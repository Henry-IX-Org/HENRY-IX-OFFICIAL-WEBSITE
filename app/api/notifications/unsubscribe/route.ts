import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '8790686e-ed87-41f6-a038-ef2d8ea248b1';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string };
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      const resend = new Resend(apiKey);
      try {
        await resend.contacts.create({
          audienceId: AUDIENCE_ID,
          email: cleanEmail,
          unsubscribed: true,
        });
      } catch (err) {
        console.warn('[Unsubscribe API] Resend contact unsubscribe warning:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'You have been unsubscribed from all emails.',
      email: cleanEmail,
    });
  } catch (err: any) {
    console.error('[Unsubscribe API] Error:', err);
    return NextResponse.json({ error: 'Failed to process unsubscribe' }, { status: 500 });
  }
}
