import { NextRequest, NextResponse } from 'next/server';
import {
  sendPhoneVerificationCode,
  verifyPhoneCode,
  getUserByPhone,
  getUserById,
  saveUser,
  createSessionToken,
  verifySessionToken,
} from '@/lib/studioAuth';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    const { action, phone, code } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json({ error: 'Valid phone number required' }, { status: 400 });
    }

    const cleanPhone = phone.trim();

    // 1. Send SMS Verification Code
    if (action === 'send') {
      const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
      const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

      const res = await sendPhoneVerificationCode(cleanPhone, currentUser?.id);
      return NextResponse.json({
        success: true,
        message: `Verification code sent via SMS to ${cleanPhone}`,
        codePreview: res.codePreview, // For preview in development or console
      });
    }

    // 2. Verify SMS Code
    if (action === 'verify') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: '6-digit SMS code required' }, { status: 400 });
      }

      const verifyRes = await verifyPhoneCode(cleanPhone, code);
      if (!verifyRes.success) {
        return NextResponse.json({ error: verifyRes.error || 'Invalid or expired SMS code' }, { status: 401 });
      }

      // Check if user is currently signed in and adding this phone to their account
      const sessionCookie = req.cookies.get('henryix_studio_session')?.value;
      const currentUser = sessionCookie ? await verifySessionToken(sessionCookie) : null;

      if (currentUser) {
        currentUser.phone = {
          number: cleanPhone,
          verified: true,
          verifiedAt: new Date().toISOString(),
        };
        await saveUser(currentUser);

        return NextResponse.json({
          success: true,
          user: currentUser,
          message: `Phone number ${cleanPhone} verified and linked to your account.`,
        });
      }

      // If user is logging in via phone
      const existingUser = await getUserByPhone(cleanPhone);
      if (existingUser) {
        const token = await createSessionToken(existingUser);
        const response = NextResponse.json({
          success: true,
          user: existingUser,
          message: `Authenticated via phone as ${existingUser.name}`,
        });

        response.cookies.set('henryix_studio_session', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60,
          path: '/',
        });

        return response;
      }

      return NextResponse.json({
        success: true,
        verified: true,
        message: `Phone number verified successfully.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Supported: "send", "verify"' }, { status: 400 });
  } catch (error: any) {
    console.error('SMS auth error:', error);
    return NextResponse.json({ error: error?.message || 'Phone verification failed' }, { status: 500 });
  }
}
