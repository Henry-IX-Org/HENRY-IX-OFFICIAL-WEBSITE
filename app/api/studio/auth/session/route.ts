import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/studioAuth';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await verifySessionToken(sessionCookie);
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false, error: error?.message }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Signed out successfully',
  });

  response.cookies.set('henryix_studio_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
