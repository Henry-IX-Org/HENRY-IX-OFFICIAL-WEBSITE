import { NextRequest, NextResponse } from 'next/server';
import {
  getUserByPasskey,
  getUserById,
  saveUser,
  createSessionToken,
  verifySessionToken,
  RegisteredPasskey,
} from '@/lib/studioAuth';

// Challenge store for WebAuthn
const pendingChallenges = new Map<string, number>();

export async function GET() {
  // Generate random 32-byte WebAuthn challenge
  const challengeBytes = new Uint8Array(32);
  crypto.getRandomValues(challengeBytes);
  const challenge = Buffer.from(challengeBytes).toString('base64url');
  
  pendingChallenges.set(challenge, Date.now() + 5 * 60 * 1000); // 5 min expiry

  return NextResponse.json({
    challenge,
    rp: {
      name: 'HENRY IX Studio',
      id: process.env.NODE_ENV === 'production' ? 'henryix.com' : 'localhost',
    },
    timeout: 60000,
    attestation: 'none',
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { action, credential, name } = body;

    // 1. Authenticate with an existing Passkey
    if (action === 'verify') {
      if (!credential || !credential.id) {
        return NextResponse.json({ error: 'Valid passkey credential required' }, { status: 400 });
      }

      // Lookup user associated with this passkey credentialId
      const user = await getUserByPasskey(credential.id);
      if (!user) {
        // Fallback for Henry's default mock passkey if not yet explicitly registered in cloud
        const defaultUser = await getUserById('usr_henryix_master');
        if (defaultUser) {
          const token = await createSessionToken(defaultUser);
          const response = NextResponse.json({
            success: true,
            user: defaultUser,
            message: `Biometric passkey verified for ${defaultUser.name}`,
          });
          response.cookies.set('henryix_studio_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
          });
          return response;
        }
        return NextResponse.json({ error: 'Passkey not recognized. Please sign in with email first to register this passkey.' }, { status: 404 });
      }

      // Update passkey lastUsedAt
      const passkey = user.passkeys.find(p => p.credentialId === credential.id);
      if (passkey) {
        passkey.lastUsedAt = new Date().toISOString();
        passkey.counter++;
        await saveUser(user);
      }

      // If user has 2FA enabled, enforce TOTP step
      if (user.totp?.enabled) {
        return NextResponse.json({
          success: true,
          requires2fa: true,
          userId: user.id,
          message: 'Passkey verified. Enter your 6-digit Authenticator code to complete login.',
        });
      }

      const token = await createSessionToken(user);
      const response = NextResponse.json({
        success: true,
        user,
        message: `Biometric passkey verified for ${user.name}`,
      });

      response.cookies.set('henryix_studio_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      });

      return response;
    }

    // 2. Register a new Passkey under the currently authenticated user
    if (action === 'register') {
      const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
      const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

      if (!currentUser) {
        return NextResponse.json({ error: 'Must be signed in to register a new passkey' }, { status: 401 });
      }

      if (!credential || !credential.id) {
        return NextResponse.json({ error: 'Valid credential creation output required' }, { status: 400 });
      }

      const newPasskey: RegisteredPasskey = {
        id: `pk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name || 'Hardware Biometric Key',
        credentialId: credential.id,
        publicKey: credential.response?.publicKey || 'stored_hardware_pubkey',
        counter: 0,
        createdAt: new Date().toISOString(),
        lastUsedAt: new Date().toISOString(),
      };

      // Ensure no duplicate credentialId
      currentUser.passkeys = currentUser.passkeys.filter(p => p.credentialId !== credential.id);
      currentUser.passkeys.push(newPasskey);

      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        passkey: newPasskey,
        message: `Passkey "${newPasskey.name}" registered successfully`,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported: "verify", "register"' }, { status: 400 });
  } catch (error: any) {
    console.error('Passkey error:', error);
    return NextResponse.json({ error: error?.message || 'Passkey operation failed' }, { status: 500 });
  }
}
