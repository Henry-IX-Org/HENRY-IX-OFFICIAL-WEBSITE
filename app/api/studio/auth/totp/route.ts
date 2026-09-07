import { NextRequest, NextResponse } from 'next/server';
import {
  generateBase32Secret,
  getTotpUri,
  generateQrCodeSvg,
  verifyTotpCode,
} from '@/lib/totp';
import {
  getUserById,
  saveUser,
  verifySessionToken,
  createSessionToken,
} from '@/lib/studioAuth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    const email = currentUser?.emails.find(e => e.isPrimary)?.email || 'henryixdj@gmail.com';
    const secret = generateBase32Secret(20);
    const uri = getTotpUri(currentUser?.name || 'Henry IX', email, secret);
    const qrSvg = generateQrCodeSvg(uri, 220);

    return NextResponse.json({
      success: true,
      secret,
      uri,
      qrSvg,
      email,
    });
  } catch (error: any) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to setup TOTP' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { action, secret, code, userId } = body;

    // 1. Verify 2FA code during login
    if (action === 'verify-login') {
      if (!userId || !code) {
        return NextResponse.json({ error: 'userId and 6-digit code required' }, { status: 400 });
      }

      const user = await getUserById(userId);
      if (!user || !user.totp?.secret) {
        return NextResponse.json({ error: 'User or 2FA secret not found' }, { status: 404 });
      }

      const isValid = await verifyTotpCode(code, user.totp.secret);
      if (!isValid) {
        return NextResponse.json({ error: 'INVALID AUTHENTICATOR CODE' }, { status: 401 });
      }

      const token = await createSessionToken(user);
      const response = NextResponse.json({
        success: true,
        user,
        message: `2FA Authenticated as ${user.name}`,
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

    // 2. Enable TOTP for currently signed-in user
    if (action === 'enable') {
      const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
      const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      if (!secret || !code) {
        return NextResponse.json({ error: 'Secret and test code required' }, { status: 400 });
      }

      const isValid = await verifyTotpCode(code, secret);
      if (!isValid) {
        return NextResponse.json({ error: 'INVALID 6-DIGIT CODE. Verify the time on your device is accurate.' }, { status: 400 });
      }

      currentUser.totp = {
        enabled: true,
        secret,
        verifiedAt: new Date().toISOString(),
      };

      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: 'Authenticator 2FA enabled successfully.',
      });
    }

    // 3. Disable TOTP
    if (action === 'disable') {
      const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
      const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

      if (!currentUser) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }

      currentUser.totp = {
        enabled: false,
      };

      await saveUser(currentUser);

      return NextResponse.json({
        success: true,
        user: currentUser,
        message: 'Authenticator 2FA disabled.',
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported: "enable", "disable", "verify-login"' }, { status: 400 });
  } catch (error: any) {
    console.error('TOTP verification error:', error);
    return NextResponse.json({ error: error?.message || 'TOTP operation failed' }, { status: 500 });
  }
}
