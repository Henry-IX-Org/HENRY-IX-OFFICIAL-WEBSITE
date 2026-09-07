import { NextRequest, NextResponse } from 'next/server';
import { 
  getOrCreateUserByEmail, 
  createSessionToken, 
  saveUser, 
  verifyInviteToken, 
  consumeInviteToken 
} from '@/lib/studioAuth';
import type { StudioRole } from '@/lib/studioPermissions';
import { ALL_STUDIO_ROLES } from '@/lib/studioPermissions';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { email, name, role, inviteToken } = body;
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
    const cleanName = (name && typeof name === 'string' && name.trim()) 
      ? name.trim() 
      : (cleanEmail.split('@')[0] || 'Operator');

    let cleanRole: StudioRole = 'viewer';
    if (inviteToken && typeof inviteToken === 'string') {
      const invite = verifyInviteToken(inviteToken);
      if (invite) {
        cleanRole = invite.role;
        consumeInviteToken(inviteToken);
      }
    } else if (role && ALL_STUDIO_ROLES.includes(role as StudioRole)) {
      cleanRole = role as StudioRole;
    }

    // Get or create user
    const user = await getOrCreateUserByEmail(cleanEmail, cleanName);
    
    // Update role and name
    user.name = cleanName;
    user.role = cleanRole;
    user.active = true;
    user.lastLoginAt = new Date().toISOString();
    await saveUser(user);

    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user,
      message: `Registered and authenticated as ${user.name} (${user.role})`,
    });

    response.cookies.set('henryix_studio_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: error?.message || 'Registration failed' }, { status: 500 });
  }
}
