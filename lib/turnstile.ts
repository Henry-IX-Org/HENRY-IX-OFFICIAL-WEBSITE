/**
 * lib/turnstile.ts
 *
 * Canonical Cloudflare Turnstile Server-Side Verification Helper
 * Follows Cloudflare Turnstile Spin specification:
 * - Reads secret from process.env.TURNSTILE_SECRET
 * - Verifies against https://challenges.cloudflare.com/turnstile/v0/siteverify
 * - Enforces token length <= 2048
 * - Validates success === true
 * - Validates action matches expected surface action
 * - Validates hostname against deployment-specific TURNSTILE_HOSTNAMES allowlist
 */

export interface TurnstileVerificationResult {
  success: boolean;
  action?: string;
  hostname?: string;
  error?: string;
}

export async function verifyTurnstileToken(
  token: string | undefined | null,
  expectedAction: string,
  clientIp?: string
): Promise<TurnstileVerificationResult> {
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? 'localhost,127.0.0.1,henryix.com,studio.henryix.com')
      .split(',')
      .map((hostname) => hostname.trim().toLowerCase())
      .filter(Boolean)
  );

  if (!token || typeof token !== 'string' || token.trim().length === 0 || token.length > 2048) {
    return { success: false, error: 'invalid-token' };
  }

  if (expectedHostnames.size === 0) {
    return { success: false, error: 'missing-hostnames' };
  }

  const secret = process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn('[Turnstile] TURNSTILE_SECRET is not configured in environment.');
    return { success: false, error: 'missing-secret' };
  }

  // Windows dev environment TLS workaround for Node fetch
  if (process.env.NODE_ENV !== 'production' && typeof process !== 'undefined') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });
    if (clientIp) {
      params.append('remoteip', clientIp);
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: AbortSignal.timeout(10_000),
      body: params.toString(),
    });

    if (!response.ok) {
      return { success: false, error: `siteverify-http-${response.status}` };
    }

    const data = (await response.json()) as {
      success: boolean;
      action?: string;
      hostname?: string;
      'error-codes'?: string[];
    };

    if (!data.success) {
      console.warn('[Turnstile] Token verification failed:', data['error-codes']);
      return { success: false, error: 'verification-failed' };
    }

    if (expectedAction && data.action && data.action !== expectedAction) {
      console.warn(`[Turnstile] Action mismatch. Expected: ${expectedAction}, got: ${data.action}`);
      return { success: false, error: 'action-mismatch' };
    }

    const returnedHostname = (data.hostname || '').toLowerCase();
    if (returnedHostname && !expectedHostnames.has(returnedHostname)) {
      console.warn(`[Turnstile] Hostname mismatch. Got: ${returnedHostname}`);
      return { success: false, error: 'hostname-mismatch' };
    }

    return {
      success: true,
      action: data.action,
      hostname: data.hostname,
    };
  } catch (err: any) {
    console.error('[Turnstile] Error contacting siteverify API:', err);
    return { success: false, error: 'upstream-network-failure' };
  }
}
