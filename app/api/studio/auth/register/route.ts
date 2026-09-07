import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateUserByEmail, createSessionToken, saveUser } from '@/lib/studioAuth';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { email, name, role } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && typeof name === 'string' && name.trim()) 
      ? name.trim() 
      : (cleanEmail.split('@')[0] || 'Operator');
    const cleanRole = (role === 'owner' || role === 'manager' || role === 'media' || role === 'viewer') 
      ? role 
      : 'owner';

    // Get or create user
    const user = await getOrCreateUserByEmail(cleanEmail, cleanName);
    
    // Update role and name if explicitly specified
    user.name = cleanName;
    if (cleanRole) {
      user.role = cleanRole;
    }
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
