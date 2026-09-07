import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUserByEmail, createSessionToken, saveUser } from '@/lib/studioAuth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (error || !code) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(
      new URL(`/studio?error=${encodeURIComponent(error || 'Google sign-in was cancelled')}`, baseUrl)
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/studio/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/studio?error=' + encodeURIComponent('Server missing Google OAuth credentials'), baseUrl)
    );
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string; id_token?: string; error?: string };

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error('Failed to exchange Google token:', tokenData);
      return NextResponse.redirect(
        new URL('/studio?error=' + encodeURIComponent('Failed to exchange Google token'), baseUrl)
      );
    }

    // 2. Fetch user profile from Google UserInfo endpoint
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = (await userRes.json()) as { email?: string; name?: string; sub?: string };

    if (!userRes.ok || !googleUser.email) {
      return NextResponse.redirect(
        new URL('/studio?error=' + encodeURIComponent('Could not retrieve email from Google profile'), baseUrl)
      );
    }

    const email = googleUser.email.toLowerCase().trim();

    // 3. Find or create account in Studio Auth
    const user = await getOrCreateUserByEmail(email);

    // Link Google account metadata
    user.google = {
      connected: true,
      email: googleUser.email,
      name: googleUser.name || user.name,
      sub: googleUser.sub,
      connectedAt: new Date().toISOString(),
    };

    await saveUser(user);

    // Check if 2FA is required
    if (user.totp?.enabled) {
      return NextResponse.redirect(
        new URL(`/studio?step=totp-2fa&userId=${encodeURIComponent(user.id)}`, baseUrl)
      );
    }

    // 4. Create session token and set cookie
    const sessionToken = await createSessionToken(user);

    const redirectResponse = NextResponse.redirect(new URL('/studio', baseUrl));
    redirectResponse.cookies.set('henryix_studio_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return redirectResponse;
  } catch (err: any) {
    console.error('Google OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/studio?error=' + encodeURIComponent(err?.message || 'Authentication failed'), baseUrl)
    );
  }
}
