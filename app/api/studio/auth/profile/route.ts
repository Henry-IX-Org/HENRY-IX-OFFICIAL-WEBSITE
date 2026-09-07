import { NextRequest, NextResponse } from 'next/server';
import {
  verifySessionToken,
  saveUser,
  getUserByEmail,
  sendEmailVerificationCode,
  verifyEmailCode,
  LinkedEmail,
} from '@/lib/studioAuth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: currentUser,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to get profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = (await req.json()) as any;
    const { action, email, code, provider, oauthData, passkeyId } = body;

    // 1. Add new secondary email (Dispatches verification code)
    if (action === 'add-email') {
      if (!email || !email.includes('@')) {
        return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
      }
      const cleanEmail = email.trim().toLowerCase();

      // Check if this email is already linked to THIS user
      if (currentUser.emails.some(e => e.email.toLowerCase() === cleanEmail)) {
        return NextResponse.json({ error: 'This email is already linked to your account' }, { status: 400 });
      }

      // Check if linked to another user
      const otherUser = await getUserByEmail(cleanEmail);
      if (otherUser && otherUser.id !== currentUser.id) {
        return NextResponse.json({ error: 'This email is already associated with another account' }, { status: 400 });
      }

      // Send verification code to the new email
      const res = await sendEmailVerificationCode(cleanEmail, currentUser.id);
      return NextResponse.json({
        success: true,
        message: `Verification code sent to ${cleanEmail}`,
        codePreview: res.codePreview,
      });
    }

    // 2. Verify and link the new email
    if (action === 'verify-email') {
      if (!email || !code) {
        return NextResponse.json({ error: 'Email and verification code required' }, { status: 400 });
      }
      const cleanEmail = email.trim().toLowerCase();

      const verifyRes = await verifyEmailCode(cleanEmail, code);
      if (!verifyRes.success) {
        return NextResponse.json({ error: verifyRes.error || 'Invalid or expired code' }, { status: 400 });
      }

      // Append new verified email to account
      const newEmail: LinkedEmail = {
        email: cleanEmail,
        isPrimary: false,
        verified: true,
        verifiedAt: new Date().toISOString(),
        addedAt: new Date().toISOString(),
      };

      currentUser.emails = currentUser.emails.filter(e => e.email.toLowerCase() !== cleanEmail);
      currentUser.emails.push(newEmail);

      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: `${cleanEmail} verified and linked to your account.`,
      });
    }

    // 3. Remove a secondary email
    if (action === 'remove-email') {
      if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
      }
      const cleanEmail = email.trim().toLowerCase();

      const target = currentUser.emails.find(e => e.email.toLowerCase() === cleanEmail);
      if (!target) {
        return NextResponse.json({ error: 'Email not found on account' }, { status: 404 });
      }
      if (target.isPrimary) {
        return NextResponse.json({ error: 'Cannot remove primary account email. Set another email as primary first.' }, { status: 400 });
      }

      currentUser.emails = currentUser.emails.filter(e => e.email.toLowerCase() !== cleanEmail);
      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: `${cleanEmail} removed from account.`,
      });
    }

    // 4. Set primary email
    if (action === 'set-primary-email') {
      if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 });
      }
      const cleanEmail = email.trim().toLowerCase();

      const exists = currentUser.emails.some(e => e.email.toLowerCase() === cleanEmail);
      if (!exists) {
        return NextResponse.json({ error: 'Email not found on account' }, { status: 404 });
      }

      currentUser.emails = currentUser.emails.map(e => ({
        ...e,
        isPrimary: e.email.toLowerCase() === cleanEmail,
      }));

      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: `${cleanEmail} is now your primary email.`,
      });
    }

    // 5. Connect OAuth (Google / Apple)
    if (action === 'connect-oauth') {
      if (!provider || (provider !== 'google' && provider !== 'apple')) {
        return NextResponse.json({ error: 'Valid provider (google/apple) required' }, { status: 400 });
      }

      const pKey = provider as 'google' | 'apple';
      currentUser[pKey] = {
        connected: true,
        email: oauthData?.email || currentUser.emails[0]?.email,
        name: oauthData?.name || currentUser.name,
        sub: oauthData?.sub || `sub_${Date.now()}`,
        connectedAt: new Date().toISOString(),
      };

      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: `${provider === 'google' ? 'Google' : 'Apple'} account connected.`,
      });
    }

    // 6. Disconnect OAuth (Google / Apple)
    if (action === 'disconnect-oauth') {
      if (!provider || (provider !== 'google' && provider !== 'apple')) {
        return NextResponse.json({ error: 'Valid provider required' }, { status: 400 });
      }

      const pKey = provider as 'google' | 'apple';
      currentUser[pKey] = {
        connected: false,
      };

      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: `${provider === 'google' ? 'Google' : 'Apple'} account disconnected.`,
      });
    }

    // 7. Remove Passkey
    if (action === 'remove-passkey') {
      if (!passkeyId) {
        return NextResponse.json({ error: 'Passkey ID required' }, { status: 400 });
      }

      currentUser.passkeys = currentUser.passkeys.filter(p => p.id !== passkeyId && p.credentialId !== passkeyId);
      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: 'Passkey removed.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: error?.message || 'Profile update failed' }, { status: 500 });
  }
}
