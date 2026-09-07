import { NextRequest, NextResponse } from 'next/server';
import { createNotionSubscriberLead } from '@/lib/notion';
import { verifyTurnstileToken } from '@/lib/turnstile';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      subscription?: any;
      email?: string;
      turnstileToken?: string;
      'cf-turnstile-response'?: string;
    };
    const { subscription, email } = body;
    const token = body.turnstileToken || body['cf-turnstile-response'];

    // Gate on Turnstile bot verification (Action: 'subscribe')
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const turnstileCheck = await verifyTurnstileToken(token, 'subscribe', clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        { error: 'Security verification failed. Please refresh and try again.' },
        { status: 403 }
      );
    }

    if (!subscription && !email) {
      return NextResponse.json({ error: 'Missing subscription details or email' }, { status: 400 });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email).trim())) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
      }
    }

    const cleanEmail = email ? String(email).trim().slice(0, 150) : null;

    if (cleanEmail) {
      // 1. Save subscriber lead to Notion Bookings & Leads DB
      await createNotionSubscriberLead(cleanEmail).catch(err => {
        console.warn('[Subscribe API] Notion lead creation warning:', err);
      });

      // 2. Optional: Add contact to Resend Audience if configured
      if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.contacts.create({
            email: cleanEmail,
            unsubscribed: false,
            audienceId: process.env.RESEND_AUDIENCE_ID,
          });
        } catch (resendErr) {
          console.warn('[Subscribe API] Resend contact creation warning:', resendErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to live broadcast notifications!',
    });
  } catch (err: any) {
    console.error('Error subscribing to notifications:', err);
    return NextResponse.json({ error: 'Failed to complete subscription' }, { status: 500 });
  }
}
