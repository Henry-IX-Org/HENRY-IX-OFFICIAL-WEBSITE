import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createSessionToken } from '@/lib/studioAuth';

const MASTER_PIN = '180800';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json({ error: 'Master PIN required' }, { status: 400 });
    }

    if (pin.trim() !== MASTER_PIN) {
      return NextResponse.json({ error: 'INCORRECT MASTER PIN' }, { status: 401 });
    }

    // Retrieve default owner (Henry IX)
    const user = await getUserByEmail('henryixdj@gmail.com');
    if (!user) {
      return NextResponse.json({ error: 'Owner profile not found' }, { status: 500 });
    }

    const token = await createSessionToken(user);
    const response = NextResponse.json({
      success: true,
      user,
      message: 'Master Tour PIN verified. Welcome, Henry IX.',
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
    console.error('PIN auth error:', error);
    return NextResponse.json({ error: error?.message || 'Authentication failed' }, { status: 500 });
  }
}
