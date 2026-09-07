import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUserByEmail, saveUser, verifySessionToken } from '@/lib/studioAuth';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/studio?error=${encodeURIComponent(error || 'YouTube Music link was cancelled')}`, baseUrl)
    );
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/studio/auth/youtube/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/studio?error=' + encodeURIComponent('Server missing YouTube OAuth credentials'), baseUrl)
    );
  }

  try {
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

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string };

    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(
        new URL('/studio?error=' + encodeURIComponent('Failed to link YouTube token'), baseUrl)
      );
    }

    // Identify current user via existing session cookie or userinfo
    const existingSession = req.cookies.get('henryix_studio_session')?.value;
    let user = existingSession ? await verifySessionToken(existingSession) : null;

    if (!user) {
      // Fetch profile to identify user
      const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const googleUser = (await userRes.json()) as { email?: string };
      if (googleUser.email) {
        user = await getOrCreateUserByEmail(googleUser.email.toLowerCase().trim());
      }
    }

    if (user) {
      user.google = {
        connected: true,
        email: user.google?.email || user.emails[0]?.email || 'henryixdj@gmail.com',
        name: user.name,
        connectedAt: new Date().toISOString(),
      };
      await saveUser(user);
    }

    return NextResponse.redirect(new URL('/studio?connected=youtube', baseUrl));
  } catch (err: any) {
    console.error('YouTube OAuth callback error:', err);
    return NextResponse.redirect(
      new URL('/studio?error=' + encodeURIComponent(err?.message || 'YouTube connection failed'), baseUrl)
    );
  }
}
