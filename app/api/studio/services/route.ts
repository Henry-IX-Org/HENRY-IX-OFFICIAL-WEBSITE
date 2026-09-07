import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  getMasterServices,
  toggleMasterService,
  toggleUserConnectedService,
  getUserById,
} from '@/lib/studioAuth';

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

    // Tier 2: Per-User Personal Connections (Each Operator's Personal Tools)
    const userServices = currentUser.connectedServices || [
      { id: 'spotify', name: 'Personal Spotify', connected: false, detail: 'Quick Playlist Import' },
      { id: 'soundcloud', name: 'Personal SoundCloud', connected: false, detail: 'Drip Rip & Stream Feeds' },
      { id: 'google_drive', name: 'Google Drive', connected: false, detail: 'Direct Audio & Asset Ingest' },
      { id: 'dropbox', name: 'Dropbox', connected: false, detail: 'Crate Sync & Backups' },
      { id: 'obs', name: 'Local OBS Studio', connected: false, detail: 'ws://localhost:4455 Bridge' },
    ];

    return NextResponse.json({
      success: true,
      role: currentUser.role,
      isOwner,
      masterServices,
      userServices,
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
    const { tier, serviceId, connected, detail } = body;

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    // Tier 1: Master Studio Infrastructure - Henry IX Only
    if (tier === 'master') {
      if (currentUser.role !== 'owner') {
        return NextResponse.json({
          error: 'FORBIDDEN: Only Henry IX (Studio Owner) has authority to connect or disconnect Master Infrastructure services',
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

    // Tier 2: Per-Operator Personal Tools - Available to any signed in teammate
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

    return NextResponse.json({ error: 'Invalid tier specified (must be "master" or "user")' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
