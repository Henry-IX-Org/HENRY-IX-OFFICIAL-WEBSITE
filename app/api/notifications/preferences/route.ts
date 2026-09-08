import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '8790686e-ed87-41f6-a038-ef2d8ea248b1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim();

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        email,
        unsubscribed: false,
        topics: {},
      });
    }

    const resend = new Resend(apiKey);

    // Try to get contact details from Resend Audience
    try {
      const contactResp = await resend.contacts.get({
        audienceId: AUDIENCE_ID,
        id: email,
      });

      if (contactResp.data) {
        return NextResponse.json({
          success: true,
          email,
          unsubscribed: Boolean(contactResp.data.unsubscribed),
        });
      }
    } catch {
      // Contact might not exist yet in the audience, return default active
    }

    return NextResponse.json({
      success: true,
      email,
      unsubscribed: false,
    });
  } catch (err: any) {
    console.error('[Preferences API GET] Error:', err);
    return NextResponse.json({ error: 'Failed to retrieve preferences' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      email?: string;
      unsubscribed?: boolean;
      topics?: Array<{ id: string; subscription: 'opt_in' | 'opt_out' }>;
    };

    const { email, unsubscribed, topics } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      const resend = new Resend(apiKey);

      try {
        // 1. Update contact subscription status in Audience
        await resend.contacts.create({
          audienceId: AUDIENCE_ID,
          email: cleanEmail,
          unsubscribed: Boolean(unsubscribed),
        });

        // 2. If topics are provided and not unsubscribed, update topic preferences
        if (!unsubscribed && Array.isArray(topics) && topics.length > 0) {
          try {
            await (resend.contacts.topics.update as any)({
              audienceId: AUDIENCE_ID,
              email: cleanEmail,
              topics: topics.map((t) => ({
                id: t.id,
                subscription: t.subscription,
              })),
            });
          } catch (topicErr) {
            console.warn('[Preferences API] Topic preferences warning:', topicErr);
          }
        }
      } catch (resendErr) {
        console.warn('[Preferences API] Resend contact update warning:', resendErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: unsubscribed
        ? 'You have been unsubscribed from all emails.'
        : 'Your email preferences have been saved.',
      email: cleanEmail,
      unsubscribed: Boolean(unsubscribed),
    });
  } catch (err: any) {
    console.error('[Preferences API POST] Error:', err);
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}
