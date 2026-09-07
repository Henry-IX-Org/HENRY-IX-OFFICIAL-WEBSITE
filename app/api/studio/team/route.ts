import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  listAllUsers,
  updateUserRole,
  deactivateUser,
  createInviteToken,
  listInvites,
} from '@/lib/studioAuth';
import type { StudioRole } from '@/lib/studioPermissions';
import { ALL_STUDIO_ROLES, ROLE_METADATA } from '@/lib/studioPermissions';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!currentUser) {
      return NextResponse.json({ error: 'UNAUTHORIZED: Please sign in' }, { status: 401 });
    }

    if (currentUser.role !== 'owner' && currentUser.role !== 'manager') {
      return NextResponse.json({ error: 'FORBIDDEN: Insufficient permissions to view team registry' }, { status: 403 });
    }

    const allUsers = await listAllUsers();

    // Sanitize user data for display (never expose raw password hashes or TOTP secrets)
    const sanitizedUsers = allUsers.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      roleMeta: ROLE_METADATA[u.role] || null,
      primaryEmail: u.emails.find(e => e.isPrimary)?.email || u.emails[0]?.email || 'None',
      phone: u.phone?.number || null,
      active: u.active !== false,
      lastLoginAt: u.lastLoginAt || u.updatedAt,
      createdAt: u.createdAt,
      servicesConnectedCount: (u.connectedServices || []).filter(s => s.connected).length,
    }));

    const invites = currentUser.role === 'owner' ? listInvites() : [];

    return NextResponse.json({
      success: true,
      operators: sanitizedUsers,
      invites,
      availableRoles: ALL_STUDIO_ROLES.map((roleKey: StudioRole) => ({
        id: roleKey,
        ...ROLE_METADATA[roleKey],
      })),
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
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // Role changes and invite creation require Owner privileges
    if (currentUser.role !== 'owner') {
      return NextResponse.json({ error: 'FORBIDDEN: Only Henry IX (Owner) can modify team roles or issue invites' }, { status: 403 });
    }

    const body = (await req.json()) as any;
    const { action } = body;

    if (action === 'invite') {
      const { role, email } = body;
      if (!role || !ALL_STUDIO_ROLES.includes(role as StudioRole)) {
        return NextResponse.json({ error: 'Valid Studio role is required' }, { status: 400 });
      }

      const invite = createInviteToken(role as StudioRole, email, currentUser.id);
      const origin = req.nextUrl.origin || 'https://studio.henryix.com';
      const inviteUrl = `${origin}/studio?invite=${invite.token}&role=${invite.role}`;

      return NextResponse.json({
        success: true,
        invite: {
          ...invite,
          inviteUrl,
        },
      });
    }

    if (action === 'update_role') {
      const { targetUserId, newRole } = body;
      if (!targetUserId || !newRole || !ALL_STUDIO_ROLES.includes(newRole as StudioRole)) {
        return NextResponse.json({ error: 'Invalid target user or role' }, { status: 400 });
      }

      const updated = await updateUserRole(targetUserId, newRole as StudioRole);
      if (!updated) {
        return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: {
          id: updated.id,
          name: updated.name,
          role: updated.role,
        },
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!currentUser) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (currentUser.role !== 'owner') {
      return NextResponse.json({ error: 'FORBIDDEN: Only Henry IX (Owner) can deactivate operators' }, { status: 403 });
    }

    const body = (await req.json()) as any;
    const { targetUserId } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
    }

    if (targetUserId === currentUser.id || targetUserId === 'usr_henryix_master') {
      return NextResponse.json({ error: 'CANNOT DEACTIVATE MASTER OWNER ACCOUNT' }, { status: 400 });
    }

    const deactivated = await deactivateUser(targetUserId);
    if (!deactivated) {
      return NextResponse.json({ error: 'Target operator not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Operator deactivated successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
