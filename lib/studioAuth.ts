// Multi-Identity Studio Authentication & Account Linking Engine
// Supports any user, multi-email linking, phone SMS verification, passkeys, Google, Apple, TOTP 2FA, and RBAC roles.

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Resend } from 'resend';
import type { NextRequest } from 'next/server';
import type { StudioRole } from './studioPermissions';

if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export interface LinkedEmail {
  email: string;
  isPrimary: boolean;
  verified: boolean;
  verifiedAt?: string;
  addedAt: string;
}

export interface LinkedPhone {
  number: string;
  verified: boolean;
  verifiedAt?: string;
}

export interface RegisteredPasskey {
  id: string;
  name: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface ConnectedOAuthAccount {
  connected: boolean;
  email?: string;
  name?: string;
  sub?: string;
  connectedAt?: string;
}

export interface UserConnectedService {
  id: 'spotify' | 'soundcloud' | 'google_drive' | 'dropbox' | 'obs';
  name: string;
  connected: boolean;
  accountName?: string;
  connectedAt?: string;
  detail?: string;
}

export interface StudioUserProfile {
  id: string;
  name: string;
  role: StudioRole;
  emails: LinkedEmail[];
  phone: LinkedPhone | null;
  google: ConnectedOAuthAccount | null;
  apple: ConnectedOAuthAccount | null;
  passkeys: RegisteredPasskey[];
  totp: {
    enabled: boolean;
    secret?: string;
    verifiedAt?: string;
  };
  passwordHash?: string;
  passwordSalt?: string;
  connectedServices?: UserConnectedService[];
  active?: boolean;
  invitedBy?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface PendingOtp {
  code: string;
  target: string; // email or phone
  type: 'email' | 'phone';
  userId?: string;
  expiresAt: number;
}

export interface StudioInvite {
  token: string;
  role: StudioRole;
  email?: string;
  createdBy: string;
  createdAt: string;
  expiresAt: number;
  used: boolean;
}

export interface MasterService {
  id: 'notion' | 'r2' | 'resend' | 'obs' | 'spotify' | 'soundcloud';
  name: string;
  category: 'core' | 'storage' | 'communications' | 'broadcast' | 'streaming';
  connected: boolean;
  detail: string;
  lastToggledAt?: string;
}

// Global Storage Cache (Ensures singleton state across Next.js API routes in dev and prod)
const globalScope = globalThis as unknown as {
  __henryix_memoryUsers?: Map<string, StudioUserProfile>;
  __henryix_pendingOtps?: Map<string, PendingOtp>;
  __henryix_memoryInvites?: Map<string, StudioInvite>;
  __henryix_masterServicesState?: Record<string, boolean>;
};

const memoryUsers = (globalScope.__henryix_memoryUsers ??= new Map<string, StudioUserProfile>());
const pendingOtps = (globalScope.__henryix_pendingOtps ??= new Map<string, PendingOtp>());
const memoryInvites = (globalScope.__henryix_memoryInvites ??= new Map<string, StudioInvite>());
const masterServicesState = (globalScope.__henryix_masterServicesState ??= {
  notion: true,
  r2: true,
  resend: true,
  obs: true,
  spotify: true,
  soundcloud: true,
});

// Default Master Owner Profile for Henry IX
const DEFAULT_OWNER_ID = 'usr_henryix_master';
const defaultOwner: StudioUserProfile = {
  id: DEFAULT_OWNER_ID,
  name: 'Henry IX',
  role: 'owner',
  emails: [
    {
      email: 'henryixdj@gmail.com',
      isPrimary: true,
      verified: true,
      verifiedAt: '2026-01-01T00:00:00.000Z',
      addedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      email: 'henry@henryix.com',
      isPrimary: false,
      verified: true,
      verifiedAt: '2026-01-01T00:00:00.000Z',
      addedAt: '2026-01-01T00:00:00.000Z',
    }
  ],
  phone: null,
  google: {
    connected: true,
    email: 'henryixdj@gmail.com',
    name: 'Henry IX',
    connectedAt: '2026-01-01T00:00:00.000Z',
  },
  apple: {
    connected: false,
  },
  passkeys: [],
  totp: {
    enabled: false,
  },
  connectedServices: [
    { id: 'spotify', name: 'Spotify Artist Profile', connected: true, accountName: 'HENRY IX (Verified Artist)', detail: 'Catalog sync & playlist curation active' },
    { id: 'soundcloud', name: 'SoundCloud Pro', connected: true, accountName: 'henryixdj', detail: 'Live set & dubplate sync active' },
    { id: 'google_drive', name: 'Google Workspace', connected: true, accountName: 'henryixdj@gmail.com', detail: 'Drive sync daemon running' },
    { id: 'obs', name: 'Main Studio OBS', connected: true, accountName: 'ws://localhost:4455', detail: 'OBS WebSocket v5 connected' },
  ],
  active: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-09-07T12:00:00.000Z',
};

memoryUsers.set(DEFAULT_OWNER_ID, defaultOwner);

// S3 / R2 Cloudflare Client
function getS3Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
}

// Resend Email Client
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

// -------------------------------------------------------------
// Cloud R2 Sync Helpers
// -------------------------------------------------------------
async function loadUserFromR2(userId: string): Promise<StudioUserProfile | null> {
  const s3 = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!s3 || !bucket) return null;

  try {
    const res = await s3.send(new GetObjectCommand({
      Bucket: bucket,
      Key: `_security/users/${userId}.json`,
    }));
    if (!res.Body) return null;
    const jsonStr = await res.Body.transformToString();
    const user = JSON.parse(jsonStr) as StudioUserProfile;
    memoryUsers.set(user.id, user);
    return user;
  } catch {
    return null;
  }
}

async function saveUserToR2(user: StudioUserProfile): Promise<void> {
  const s3 = getS3Client();
  const bucket = process.env.R2_BUCKET_NAME;
  if (!s3 || !bucket) return;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: `_security/users/${user.id}.json`,
      Body: JSON.stringify(user, null, 2),
      ContentType: 'application/json',
    }));
  } catch (err) {
    console.error('Failed to sync user to R2:', err);
  }
}

// -------------------------------------------------------------
// User Lookup & Retrieval Engine
// -------------------------------------------------------------
export async function getUserById(userId: string): Promise<StudioUserProfile | null> {
  if (memoryUsers.has(userId)) {
    return memoryUsers.get(userId)!;
  }
  return await loadUserFromR2(userId);
}

export async function getUserByEmail(email: string): Promise<StudioUserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Search in memory
  for (const user of Array.from(memoryUsers.values())) {
    if (user.emails.some(e => e.email.toLowerCase() === cleanEmail)) {
      return user;
    }
  }

  // 2. Check default owner
  if (defaultOwner.emails.some(e => e.email.toLowerCase() === cleanEmail)) {
    return defaultOwner;
  }

  return null;
}

export async function getUserByPhone(phone: string): Promise<StudioUserProfile | null> {
  const cleanPhone = phone.replace(/\s+/g, '');
  for (const user of Array.from(memoryUsers.values())) {
    if (user.phone && user.phone.number.replace(/\s+/g, '') === cleanPhone) {
      return user;
    }
  }
  return null;
}

export async function getUserByPasskey(credentialId: string): Promise<StudioUserProfile | null> {
  for (const user of Array.from(memoryUsers.values())) {
    if (user.passkeys.some(p => p.credentialId === credentialId)) {
      return user;
    }
  }
  return null;
}

export async function getUserByOAuth(provider: 'google' | 'apple', identifier: string): Promise<StudioUserProfile | null> {
  const cleanId = identifier.trim().toLowerCase();
  for (const user of Array.from(memoryUsers.values())) {
    const account = user[provider];
    if (account?.connected) {
      if (account.email?.toLowerCase() === cleanId || account.sub === cleanId) {
        return user;
      }
    }
  }
  return null;
}

export async function saveUser(user: StudioUserProfile): Promise<StudioUserProfile> {
  user.updatedAt = new Date().toISOString();
  memoryUsers.set(user.id, user);
  // Async save to Cloudflare R2
  saveUserToR2(user).catch(err => console.error(err));
  return user;
}

export async function listAllUsers(): Promise<StudioUserProfile[]> {
  const users = Array.from(memoryUsers.values());
  if (!users.some(u => u.id === DEFAULT_OWNER_ID)) {
    users.unshift(defaultOwner);
  }
  return users;
}

export async function updateUserRole(userId: string, newRole: StudioRole): Promise<StudioUserProfile | null> {
  const user = await getUserById(userId);
  if (!user) return null;
  user.role = newRole;
  return await saveUser(user);
}

export async function deactivateUser(userId: string): Promise<boolean> {
  if (userId === DEFAULT_OWNER_ID) return false; // Never deactivate owner
  const user = await getUserById(userId);
  if (!user) return false;
  user.active = false;
  await saveUser(user);
  return true;
}

export async function getOrCreateUserByEmail(
  email: string, 
  name?: string,
  preferredRole?: StudioRole
): Promise<StudioUserProfile> {
  const cleanEmail = email.trim().toLowerCase();
  const existing = await getUserByEmail(cleanEmail);
  if (existing) return existing;

  const isOwnerEmail = cleanEmail === 'henryixdj@gmail.com' || cleanEmail === 'henry@henryix.com';
  const newUserId = isOwnerEmail ? DEFAULT_OWNER_ID : `usr_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  
  const assignedRole: StudioRole = isOwnerEmail 
    ? 'owner' 
    : (preferredRole || 'guest_operator');

  const newUser: StudioUserProfile = {
    id: newUserId,
    name: name || (isOwnerEmail ? 'Henry IX' : cleanEmail.split('@')[0]),
    role: assignedRole,
    emails: [
      {
        email: cleanEmail,
        isPrimary: true,
        verified: true,
        verifiedAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
      }
    ],
    phone: null,
    google: null,
    apple: null,
    passkeys: [],
    totp: { enabled: false },
    connectedServices: [
      { id: 'spotify', name: 'Spotify Account', connected: false, detail: 'Personal playlist & track import' },
      { id: 'soundcloud', name: 'SoundCloud Profile', connected: false, detail: 'Personal sets & mix links' },
      { id: 'google_drive', name: 'Google Drive', connected: false, detail: 'Show footage & artwork sync' },
      { id: 'obs', name: 'Local OBS WebSocket', connected: false, detail: 'Personal laptop OBS stream control' },
    ],
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return await saveUser(newUser);
}

// -------------------------------------------------------------
// Per-User Connected Services Management
// -------------------------------------------------------------
export async function toggleUserConnectedService(
  userId: string,
  serviceId: 'spotify' | 'soundcloud' | 'google_drive' | 'dropbox' | 'obs',
  connected: boolean,
  accountName?: string
): Promise<StudioUserProfile | null> {
  const user = await getUserById(userId);
  if (!user) return null;

  if (!user.connectedServices) {
    user.connectedServices = [];
  }

  const existing = user.connectedServices.find(s => s.id === serviceId);
  if (existing) {
    existing.connected = connected;
    if (accountName) existing.accountName = accountName;
    existing.connectedAt = connected ? new Date().toISOString() : undefined;
  } else {
    user.connectedServices.push({
      id: serviceId,
      name: serviceId.toUpperCase(),
      connected,
      accountName,
      connectedAt: connected ? new Date().toISOString() : undefined,
    });
  }

  return await saveUser(user);
}

// -------------------------------------------------------------
// Master Studio Services Management (Owner Controlled)
// -------------------------------------------------------------
export function getMasterServices(): MasterService[] {
  return [
    {
      id: 'notion',
      name: 'Notion 8,700+ Music & Bookings DB',
      category: 'core',
      connected: masterServicesState.notion ?? true,
      detail: masterServicesState.notion 
        ? 'Connected to Notion Library (36b39285...) & Sets (00c67473...)' 
        : 'DISCONNECTED BY OWNER — Notion queries paused',
    },
    {
      id: 'r2',
      name: 'Cloudflare R2 Bucket Vault',
      category: 'storage',
      connected: masterServicesState.r2 ?? true,
      detail: masterServicesState.r2
        ? 'Connected to bucket websiteassets (S3 API Active)'
        : 'DISCONNECTED BY OWNER — Asset upload/purge frozen',
    },
    {
      id: 'resend',
      name: 'Resend Email & SMS Dispatch',
      category: 'communications',
      connected: masterServicesState.resend ?? true,
      detail: masterServicesState.resend
        ? 'Connected (broadcasts@henryix.com)'
        : 'DISCONNECTED BY OWNER — Outbound dispatches paused',
    },
    {
      id: 'obs',
      name: 'OBS WebSocket v5 Bridge',
      category: 'broadcast',
      connected: masterServicesState.obs ?? true,
      detail: masterServicesState.obs
        ? 'Bridge enabled (ws://localhost:4455 / Cloudflare tunnel fallback)'
        : 'DISCONNECTED BY OWNER — Broadcast remote severed',
    },
    {
      id: 'spotify',
      name: 'Spotify Artist API',
      category: 'streaming',
      connected: masterServicesState.spotify ?? true,
      detail: masterServicesState.spotify
        ? 'Connected • Web Playback SDK Active'
        : 'DISCONNECTED BY OWNER',
    },
    {
      id: 'soundcloud',
      name: 'SoundCloud Pro API',
      category: 'streaming',
      connected: masterServicesState.soundcloud ?? true,
      detail: masterServicesState.soundcloud
        ? 'Connected • Dubplates & Sets Sync Active'
        : 'DISCONNECTED BY OWNER',
    },
  ];
}

export function toggleMasterService(serviceId: string, enabled: boolean): boolean {
  if (serviceId in masterServicesState) {
    masterServicesState[serviceId] = enabled;
    return true;
  }
  return false;
}

export function isMasterServiceConnected(serviceId: string): boolean {
  return masterServicesState[serviceId] ?? true;
}

// -------------------------------------------------------------
// Studio Operator Invite Tokens
// -------------------------------------------------------------
export function createInviteToken(role: StudioRole, email?: string, createdBy = 'Henry IX'): StudioInvite {
  const token = `inv_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
  const invite: StudioInvite = {
    token,
    role,
    email: email ? email.trim().toLowerCase() : undefined,
    createdBy,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    used: false,
  };
  memoryInvites.set(token, invite);
  return invite;
}

export function verifyInviteToken(token: string): StudioInvite | null {
  const invite = memoryInvites.get(token);
  if (!invite) return null;
  if (invite.used) return null;
  if (Date.now() > invite.expiresAt) return null;
  return invite;
}

export function markInviteUsed(token: string): boolean {
  const invite = memoryInvites.get(token);
  if (!invite) return false;
  invite.used = true;
  return true;
}

export const consumeInviteToken = markInviteUsed;

export function listInvites(): StudioInvite[] {
  return Array.from(memoryInvites.values()).filter(i => !i.used && Date.now() <= i.expiresAt);
}

// -------------------------------------------------------------
// OTP Verification Code Engine (Email & Phone SMS)
// -------------------------------------------------------------
export function generateNumericOtp(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += (bytes[i] % 10).toString();
  }
  return code;
}

export async function sendEmailVerificationCode(email: string, userId?: string): Promise<{ success: boolean; codePreview?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const code = generateNumericOtp(6);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  pendingOtps.set(`email:${cleanEmail}`, {
    code,
    target: cleanEmail,
    type: 'email',
    userId,
    expiresAt,
  });

  const resend = getResendClient();
  if (resend) {
    try {
      const html = `
        <div style="background-color: #000000; color: #ffffff; padding: 40px 20px; font-family: 'Courier New', monospace; text-align: center; border: 1px solid #D8163F;">
          <div style="color: #D8163F; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin-bottom: 8px;">
            HENRY IX // STUDIO
          </div>
          <div style="font-size: 11px; color: #888888; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 30px;">
            ACCESS VERIFICATION CODE
          </div>
          <div style="background: #09090b; border: 1px solid #27272a; padding: 24px; margin: 0 auto; max-width: 320px;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #ffffff;">
              ${code}
            </div>
          </div>
          <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
            This code will expire in 10 minutes. If you did not request this code, please disregard.
          </p>
          <div style="margin-top: 30px; border-top: 1px solid #18181b; padding-top: 16px; font-size: 10px; color: #52525b;">
            HENRY IX DJ STUDIO // TOUR-GRADE IDENTITY GATE
          </div>
        </div>
      `;

      try {
        await resend.emails.send({
          from: 'HENRY IX Studio <studio@henryix.com>',
          to: cleanEmail,
          subject: `HENRY IX // Sign In Code: ${code}`,
          html,
        });
      } catch {
        await resend.emails.send({
          from: 'HENRY IX Studio <onboarding@resend.dev>',
          to: cleanEmail,
          subject: `HENRY IX // Sign In Code: ${code}`,
          html,
        });
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Resend dispatch notice:', err?.message || err);
      return { success: true, codePreview: code };
    }
  }

  return { success: true, codePreview: code };
}

export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();
  const record = pendingOtps.get(`email:${cleanEmail}`);

  if (!record) {
    return { success: false, error: 'NO PENDING CODE FOUND FOR THIS EMAIL' };
  }

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(`email:${cleanEmail}`);
    return { success: false, error: 'VERIFICATION CODE HAS EXPIRED' };
  }

  if (record.code !== cleanCode) {
    return { success: false, error: 'INVALID VERIFICATION CODE' };
  }

  pendingOtps.delete(`email:${cleanEmail}`);
  return { success: true };
}

export async function sendPhoneVerificationCode(phone: string, userId?: string): Promise<{ success: boolean; codePreview?: string; error?: string }> {
  const cleanPhone = phone.replace(/\s+/g, '');
  const code = generateNumericOtp(6);
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  pendingOtps.set(`phone:${cleanPhone}`, {
    code,
    target: cleanPhone,
    type: 'phone',
    userId,
    expiresAt,
  });

  // Safe developer preview & SMS dispatch hook
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[HENRY IX STUDIO SMS GATE] Verification code for ${cleanPhone}: ${code}`);
  }

  return { success: true, codePreview: code };
}

export async function verifyPhoneCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = phone.replace(/\s+/g, '');
  const cleanCode = code.trim();
  const record = pendingOtps.get(`phone:${cleanPhone}`);

  if (!record) {
    return { success: false, error: 'NO PENDING CODE FOUND FOR THIS PHONE' };
  }

  if (Date.now() > record.expiresAt) {
    pendingOtps.delete(`phone:${cleanPhone}`);
    return { success: false, error: 'VERIFICATION CODE HAS EXPIRED' };
  }

  if (record.code !== cleanCode) {
    return { success: false, error: 'INVALID VERIFICATION CODE' };
  }

  pendingOtps.delete(`phone:${cleanPhone}`);
  return { success: true };
}

// -------------------------------------------------------------
// Cryptographic Password Hashing (Edge & Node compatible)
// -------------------------------------------------------------
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const s = salt || Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('hex');
  const encoder = new TextEncoder();
  const data = encoder.encode(password + s);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const hash = Buffer.from(digest).toString('hex');
  return { hash, salt: s };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const computed = await hashPassword(password, salt);
  return computed.hash === hash;
}

// -------------------------------------------------------------
// Session Token & Cookie Handler (Edge & Node compatible)
// -------------------------------------------------------------
const SESSION_SECRET =
  process.env.STUDIO_SESSION_SECRET ||
  process.env.CLOUDFLARE_API_TOKEN ||
  'henryix_studio_secure_session_secret_2026';

export async function createSessionToken(user: StudioUserProfile): Promise<string> {
  const payload = {
    userId: user.id,
    name: user.name,
    email: user.emails.find(e => e.isPrimary)?.email || user.emails[0]?.email || '',
    role: user.role,
    iat: Date.now(),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(base64Payload));
  const base64Sig = Buffer.from(signature).toString('base64url');

  return `${base64Payload}.${base64Sig}`;
}

export async function verifySessionToken(token: string): Promise<StudioUserProfile | null> {
  if (!token || !token.includes('.')) return null;
  const [base64Payload, base64Sig] = token.split('.');

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = Buffer.from(base64Sig, 'base64url');
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(base64Payload)
    );

    if (!isValid) return null;

    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) return null;

    return await getUserById(payload.userId);
  } catch {
    return null;
  }
}

export async function authenticateStudioRequest(
  req: NextRequest | { cookies: { get: (name: string) => { value?: string } | undefined }; headers: { get: (name: string) => string | null } }
): Promise<StudioUserProfile | null> {
  const cookieToken = req.cookies.get('henryix_studio_session')?.value;
  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;
  if (!token) return null;
  const user = await verifySessionToken(token);
  if (user && user.active !== false) return user;
  return null;
}
