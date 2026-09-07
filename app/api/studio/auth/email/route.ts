import { NextRequest, NextResponse } from 'next/server';
import {
  sendEmailVerificationCode,
  verifyEmailCode,
  getOrCreateUserByEmail,
  createSessionToken,
  getUserByEmail,
  verifyPassword,
  hashPassword,
  saveUser,
} from '@/lib/studioAuth';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { action, email, code, password } = body;
    const turnstileToken = body.turnstileToken || body['cf-turnstile-response'];

    // Cloudflare Turnstile Bot Verification (Action: 'studio_auth')
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, 'studio_auth', clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        { error: 'Security verification failed. Please complete the security check and try again.' },
        { status: 403 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Send 6-digit Code via Resend
    if (action === 'send') {
      const user = await getUserByEmail(cleanEmail);
      const res = await sendEmailVerificationCode(cleanEmail, user?.id);

      if (!res.success) {
        return NextResponse.json({ error: res.error || 'Failed to dispatch verification code' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `6-digit code dispatched to ${cleanEmail}`,
        codePreview: res.codePreview, // Only present in dev / fallback preview
      });
    }

    // 2. Verify 6-digit Code
    if (action === 'verify') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: '6-digit verification code required' }, { status: 400 });
      }

      const verifyRes = await verifyEmailCode(cleanEmail, code);
      if (!verifyRes.success) {
        return NextResponse.json({ error: verifyRes.error || 'Invalid or expired code' }, { status: 401 });
      }

      // Get or create user account dynamically for this email
      const user = await getOrCreateUserByEmail(cleanEmail);

      // Check if user has TOTP 2FA enabled
      if (user.totp?.enabled) {
        return NextResponse.json({
          success: true,
          requires2fa: true,
          userId: user.id,
          message: 'Please enter your 6-digit Authenticator code to continue',
        });
      }

      // Establish authenticated session
      user.lastLoginAt = new Date().toISOString();
      await saveUser(user);

      const token = await createSessionToken(user);
      const response = NextResponse.json({
        success: true,
        user,
        message: `Authenticated as ${user.name} (${user.role})`,
      });

      response.cookies.set('henryix_studio_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      return response;
    }

    // 3. Authenticated Email + Password Login
    if (action === 'login') {
      if (!password || typeof password !== 'string') {
        return NextResponse.json({ error: 'Password is required' }, { status: 400 });
      }

      const user = await getUserByEmail(cleanEmail);
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      // Verify password against stored hash & salt
      if (user.passwordHash && user.passwordSalt) {
        const isValid = await verifyPassword(password, user.passwordHash, user.passwordSalt);
        if (!isValid) {
          return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
      } else if (user.role === 'owner' && !user.passwordHash) {
        // Initial setup for default Owner: establish master password on first login
        if (password.length < 6) {
          return NextResponse.json({ error: 'Master password must be at least 6 characters' }, { status: 400 });
        }
        const { hash, salt } = await hashPassword(password);
        user.passwordHash = hash;
        user.passwordSalt = salt;
        await saveUser(user);
      } else {
        return NextResponse.json(
          { error: 'No password set for this account. Please register or verify via email code.' },
          { status: 401 }
        );
      }

      // Check if user has TOTP 2FA enabled
      if (user.totp?.enabled) {
        return NextResponse.json({
          success: true,
          requires2fa: true,
          userId: user.id,
          message: 'Please enter your 6-digit Authenticator code to continue',
        });
      }

      user.lastLoginAt = new Date().toISOString();
      await saveUser(user);

      const token = await createSessionToken(user);
      const response = NextResponse.json({
        success: true,
        user,
        message: `Authenticated as ${user.name} (${user.role})`,
      });

      response.cookies.set('henryix_studio_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid action. Supported: "login", "send", "verify"' }, { status: 400 });
  } catch (error: any) {
    console.error('Email auth error:', error);
    return NextResponse.json({ error: error?.message || 'Authentication failed' }, { status: 500 });
  }
}
