import { NextResponse } from 'next/server';
import { saveContactSubmissionToD1, queueEmailPayload } from '@/lib/cloudflare';
import { verifyTurnstileToken } from '@/lib/turnstile';

export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    const { name, email, subject, message, turnstileToken } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim().slice(0, 100);
    const cleanEmail = String(email).trim().slice(0, 150);
    const cleanSubject = subject ? String(subject).trim().slice(0, 150) : '';
    const cleanMessage = String(message).trim().slice(0, 3000);

    // Verify Turnstile (Action: contact)
    const clientIp = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, 'contact', clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        { error: 'Security verification failed. Please refresh and try again.' },
        { status: 403 }
      );
    }

    // Save to D1 database
    try {
      await saveContactSubmissionToD1({
        name: cleanName,
        email: cleanEmail,
        message: cleanSubject ? `[${cleanSubject}] ${cleanMessage}` : cleanMessage,
      });
    } catch (d1Err) {
      console.warn('D1 database insert skipped or failed:', d1Err);
    }

    // Queue email dispatch
    try {
      await queueEmailPayload({
        to: cleanEmail,
        subject: `Thanks for reaching out, ${cleanName}`,
        name: cleanName,
        message: cleanSubject ? `[${cleanSubject}] ${cleanMessage}` : cleanMessage,
      });
    } catch (queueErr) {
      console.warn('Queue email dispatch skipped or failed:', queueErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Contact submit API error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
