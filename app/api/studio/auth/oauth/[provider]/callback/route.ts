import { NextRequest, NextResponse } from 'next/server';
import { authenticateStudioRequest, saveUserOAuthConnection } from '@/lib/studioAuth';
import { getOAuthProvider } from '@/lib/oauth/providers';

const SESSION_SECRET =
  process.env.STUDIO_SESSION_SECRET ||
  process.env.CLOUDFLARE_API_TOKEN ||
  'henryix_studio_secure_session_secret_2026';

async function verifySignedState(state: string, expectedProvider: string): Promise<{ valid: boolean; userId?: string }> {
  if (!state || !state.includes('.')) return { valid: false };
  const [base64Payload, base64Sig] = state.split('.');

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

    if (!isValid) return { valid: false };

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf-8'));
    if (payload.provider !== expectedProvider) return { valid: false };

    // State valid for 15 minutes
    if (Date.now() - payload.iat > 15 * 60 * 1000) return { valid: false };

    return { valid: true, userId: payload.userId };
  } catch {
    return { valid: false };
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const url = new URL(req.url);

  const host = req.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error') || url.searchParams.get('error_description');

  if (error) {
    return NextResponse.redirect(
      new URL(`/studio?tab=accounts&error=${encodeURIComponent(`Connection cancelled: ${error}`)}`, baseUrl)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/studio?tab=accounts&error=' + encodeURIComponent('Missing authorization code or state token'), baseUrl)
    );
  }

  // 1. Verify CSRF State
  const stateCheck = await verifySignedState(state, provider);
  if (!stateCheck.valid || !stateCheck.userId) {
    return NextResponse.redirect(
      new URL('/studio?tab=accounts&error=' + encodeURIComponent('Invalid or expired authorization session. Please try again.'), baseUrl)
    );
  }

  // 2. Ensure user is logged in
  const currentUser = await authenticateStudioRequest(req);
  if (!currentUser || currentUser.id !== stateCheck.userId) {
    return NextResponse.redirect(
      new URL('/studio?error=' + encodeURIComponent('Session mismatch. Please sign in to the studio.'), baseUrl)
    );
  }

  const adapter = getOAuthProvider(provider);
  if (!adapter) {
    return NextResponse.redirect(
      new URL('/studio?tab=accounts&error=' + encodeURIComponent(`Unknown provider: ${provider}`), baseUrl)
    );
  }

  // 3. Exchange code for tokens
  const redirectUri = `${baseUrl}/api/studio/auth/oauth/${provider}/callback`;
  const exchangeResult = await adapter.exchangeCode(code, redirectUri);

  if (!exchangeResult.success || !exchangeResult.tokens) {
    return NextResponse.redirect(
      new URL(`/studio?tab=accounts&error=${encodeURIComponent(exchangeResult.error || 'Token exchange failed')}`, baseUrl)
    );
  }

  // 4. Persist connection in user's profile
  await saveUserOAuthConnection(
    currentUser.id,
    provider as any,
    exchangeResult.tokens,
    exchangeResult.profile
  );

  return NextResponse.redirect(
    new URL(`/studio?tab=accounts&status=connected&service=${encodeURIComponent(provider)}`, baseUrl)
  );
}
