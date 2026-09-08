import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  getMasterServices,
  toggleMasterService,
  toggleUserConnectedService,
  saveUserOAuthConnection,
  getUserById,
} from '@/lib/studioAuth';
import { getOAuthProvider } from '@/lib/oauth/providers';

const DEFAULT_USER_SERVICES = [
  { id: 'spotify', name: 'Spotify Web API & SDK', category: 'music', detail: 'Personal playlist & track import' },
  { id: 'arena', name: 'Are.na Visual Research', category: 'visuals', detail: 'Channel syncing & moodboards' },
  { id: 'soundcloud', name: 'SoundCloud API', category: 'music', detail: 'Dubplates, sets & stream feeds' },
  { id: 'google_drive', name: 'Google Drive Audio', category: 'cloud_storage', detail: 'Direct stems & artwork ingest' },
  { id: 'dropbox', name: 'Dropbox Cloud Audio', category: 'cloud_storage', detail: 'Crate sync & audio backups' },
  { id: 'obs', name: 'Local OBS Studio', category: 'broadcast', detail: 'ws://localhost:4455 Bridge' },
];

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!currentUser) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Please sign in' }, { status: 401 });
    }

    const isOwner = currentUser.role === 'owner';

    // Tier 1: Master Studio Infrastructure (Owner Exclusive)
    const masterServices = isOwner ? getMasterServices() : [];

    // Tier 2: Per-User Personal Connections
    const existingConnections = currentUser.connectedServices || [];

    const enrichedUserServices = DEFAULT_USER_SERVICES.map((def) => {
      const existing = existingConnections.find((s) => s.id === def.id);
      const provider = getOAuthProvider(def.id);

      const isConfigured = def.id === 'obs' ? true : (provider?.isConfigured() ?? false);
      const missingKeys = def.id === 'obs' ? [] : (provider?.getMissingEnvKeys() ?? []);

      const isExpired = existing?.expiresAt ? Date.now() > existing.expiresAt : false;

      return {
        id: def.id,
        name: existing?.name || def.name,
        category: def.category,
        connected: Boolean(existing?.connected),
        configured: isConfigured,
        missingEnvKeys: missingKeys,
        accountName: existing?.accountName,
        accountUsername: existing?.accountUsername,
        avatarUrl: existing?.avatarUrl,
        profileUrl: existing?.profileUrl,
        connectedAt: existing?.connectedAt,
        detail: existing?.detail || def.detail,
        isExpired,
        // Tokens are strictly stripped for security
      };
    });

    return NextResponse.json({
      success: true,
      role: currentUser.role,
      isOwner,
      masterServices,
      userServices: enrichedUserServices,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!currentUser) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Please sign in' }, { status: 401 });
    }

    const body = (await req.json()) as any;
    const { tier, serviceId, connected, detail, personalToken } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    // Direct token linking for services that support personal access tokens (e.g. Are.na)
    if (personalToken && serviceId === 'arena') {
      const arenaAdapter = getOAuthProvider('arena');
      const profile = await arenaAdapter?.getProfile?.(personalToken.trim());
      if (!profile) {
        return NextResponse.json({ error: 'Invalid Are.na personal access token' }, { status: 400 });
      }

      await saveUserOAuthConnection(
        currentUser.id,
        'arena',
        { accessToken: personalToken.trim() },
        profile
      );

      const refreshed = await getUserById(currentUser.id);
      return NextResponse.json({
        success: true,
        message: `Connected Are.na account: @${profile.username}`,
        userServices: refreshed?.connectedServices || [],
      });
    }

    // Tier 1: Master Studio Infrastructure - Henry IX Only
    if (tier === 'master') {
      if (currentUser.role !== 'owner') {
        return NextResponse.json({
          error: 'FORBIDDEN: Only Henry IX (Studio Owner) has authority to manage Master Infrastructure',
        }, { status: 403 });
      }

      const updated = toggleMasterService(serviceId, Boolean(connected));
      if (!updated) {
        return NextResponse.json({ error: `Unknown master service: ${serviceId}` }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        message: `Master service ${serviceId} ${connected ? 'connected' : 'disconnected'}`,
        masterServices: getMasterServices(),
      });
    }

    // Tier 2: Per-Operator Personal Tools
    if (tier === 'user') {
      const updatedUser = await toggleUserConnectedService(
        currentUser.id,
        serviceId,
        Boolean(connected),
        detail
      );

      if (!updatedUser) {
        return NextResponse.json({ error: 'Failed to update user services' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Personal service ${serviceId} ${connected ? 'linked' : 'unlinked'}`,
        userServices: updatedUser.connectedServices || [],
      });
    }

    return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
