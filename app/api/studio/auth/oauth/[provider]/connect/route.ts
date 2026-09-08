import { NextRequest, NextResponse } from 'next/server';
import { authenticateStudioRequest } from '@/lib/studioAuth';
import { getOAuthProvider } from '@/lib/oauth/providers';

const SESSION_SECRET =
  process.env.STUDIO_SESSION_SECRET ||
  process.env.CLOUDFLARE_API_TOKEN ||
  'henryix_studio_secure_session_secret_2026';

async function createSignedState(userId: string, provider: string): Promise<string> {
  const payload = {
    userId,
    provider,
    iat: Date.now(),
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

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(base64Payload));
  const base64Sig = Buffer.from(sig).toString('base64url');

  return `${base64Payload}.${base64Sig}`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const user = await authenticateStudioRequest(req);

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (!user) {
    return NextResponse.redirect(
      new URL('/studio?error=' + encodeURIComponent('Studio sign-in required to link services'), baseUrl)
    );
  }

  const adapter = getOAuthProvider(provider);
  if (!adapter) {
    return NextResponse.redirect(
      new URL('/studio?tab=accounts&error=' + encodeURIComponent(`Unsupported connection: ${provider}`), baseUrl)
    );
  }

  if (!adapter.isConfigured()) {
    const missing = adapter.getMissingEnvKeys().join(', ');
    return NextResponse.redirect(
      new URL(`/studio?tab=accounts&error=${encodeURIComponent(`Missing API credentials for ${adapter.name} (${missing})`)}`, baseUrl)
    );
  }

  const redirectUri = `${baseUrl}/api/studio/auth/oauth/${provider}/callback`;
  const state = await createSignedState(user.id, provider);

  const authUrl = adapter.getAuthUrl(redirectUri, state);
  return NextResponse.redirect(authUrl);
}
