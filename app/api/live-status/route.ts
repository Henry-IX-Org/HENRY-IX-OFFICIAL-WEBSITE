import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getNotionBookings } from '@/lib/notion';

export const dynamic = 'force-dynamic';

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  let result = 0;
  const length = Math.max(a.length, b.length);
  for (let i = 0; i < length; i++) {
    const charA = a.charCodeAt(i) || 0;
    const charB = b.charCodeAt(i) || 0;
    result |= (charA ^ charB);
  }
  return result === 0 && a.length === b.length;
}

// Global live transmission state for Studio OBS bridge & public reflection
const globalLiveState = {
  status: 'standby', // 'standby' | 'upcoming' | 'live' | 'ended'
  title: 'HENRY IX // LIVE TRANSMISSION',
  playbackId: '',
  obsStreamKey: '',
  countdownMinutes: 5,
  scheduledTime: null as string | null,
  endedAt: null as string | null,
  currentTrack: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]',
  bpm: 150,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json({
    success: true,
    state: globalLiveState,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const {
      secret,
      action,
      streamUrl,
      obsStreamKey,
      countdownMinutes = 5,
      notifySubscribers = true,
      currentTrack,
      bpm,
    } = body;

    const configuredSecret = process.env.LIVE_STATUS_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';

    // Verify secret using secure timing-safe comparison if configured
    if (isProduction || configuredSecret) {
      if (configuredSecret && !safeCompare(secret, configuredSecret)) {
        console.warn('Unauthorized attempt to trigger live status API');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const parsedCountdown = parseInt(String(countdownMinutes), 10);
    const offsetMs = isNaN(parsedCountdown) ? 5 * 60 * 1000 : parsedCountdown * 60 * 1000;
    const isImmediate = parsedCountdown === 0 || action === 'immediate' || action === 'live';

    if (currentTrack) globalLiveState.currentTrack = currentTrack;
    if (bpm) globalLiveState.bpm = Number(bpm) || 136;

    if (action === 'publish' || action === 'live' || action === 'upcoming' || action === 'immediate') {
      const targetStatus = isImmediate ? 'live' : 'upcoming';
      const scheduledTime = isImmediate ? new Date().toISOString() : new Date(Date.now() + offsetMs).toISOString();

      globalLiveState.status = targetStatus;
      globalLiveState.countdownMinutes = parsedCountdown;
      globalLiveState.scheduledTime = scheduledTime;
      globalLiveState.endedAt = null;
      if (streamUrl) globalLiveState.playbackId = streamUrl;
      if (obsStreamKey) globalLiveState.obsStreamKey = obsStreamKey;
      globalLiveState.lastUpdated = new Date().toISOString();

      // Resend Email Alert Dispatch (@henryix.com)
      if (notifySubscribers && process.env.RESEND_API_KEY) {
        try {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'HENRY IX Broadcasts <broadcasts@henryix.com>';
          const streamTitle = globalLiveState.title;

          // Fetch subscriber leads from Notion
          const bookings = await getNotionBookings().catch(() => []);
          const recipientEmails = bookings
            .filter(b => b.eventType === 'VIP Guestlist' && b.contactEmail)
            .map(b => b.contactEmail);

          if (recipientEmails.length > 0) {
            const subjectText = isImmediate
              ? `🔴 LIVE NOW: ${streamTitle} | HENRY IX`
              : `🚨 BROADCAST ALERT: Going Live in ${parsedCountdown} Minutes! | HENRY IX`;

            const bodyHtml = `
              <div style="background-color:#000000; color:#ffffff; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding:36px; border:1px solid #27272a; max-width:560px; margin:0 auto; border-radius:12px;">
                <div style="margin-bottom:24px;">
                  <span style="font-family:'Courier New', monospace; font-size:11px; font-weight:700; letter-spacing:2px; color:#D8163F; text-transform:uppercase;">HENRY IX // LIVE</span>
                </div>
                <h1 style="color:#ffffff; font-size:22px; font-weight:700; margin:0 0 12px 0; line-height:1.3;">${streamTitle}</h1>
                <p style="color:#a1a1aa; font-size:14px; line-height:1.6; margin:0 0 24px 0;">Live streaming now with low-latency visuals and high-fidelity audio.</p>
                <div>
                  <a href="https://henryix.com/live" style="background-color:#D8163F; color:#ffffff; padding:12px 28px; text-decoration:none; font-weight:600; font-size:13px; border-radius:8px; display:inline-block; letter-spacing:0.5px;">WATCH LIVE STREAM</a>
                </div>
                <div style="margin-top:40px; padding-top:20px; border-top:1px solid #18181b; font-size:11px; color:#71717a; font-family:'Courier New', monospace;">
                  <p style="margin:0 0 6px 0; color:#52525b;">HENRY IX OFFICIAL BROADCAST</p>
                  <p style="margin:0;">
                    <a href="https://henryix.com/preferences" style="color:#a1a1aa; text-decoration:underline;">Email Preferences</a>
                    &nbsp;•&nbsp;
                    <a href="https://henryix.com/unsubscribe" style="color:#a1a1aa; text-decoration:underline;">Unsubscribe</a>
                  </p>
                </div>
              </div>
            `;

            await resend.emails.send({
              from: fromEmail,
              to: recipientEmails.slice(0, 50),
              subject: subjectText,
              html: bodyHtml,
              headers: {
                'List-Unsubscribe': '<https://henryix.com/unsubscribe>',
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
            });
            console.log(`Email alert sent via Resend from ${fromEmail} to ${recipientEmails.length} subscribers.`);
          }
        } catch (emailErr) {
          console.warn('Resend email notification warning:', emailErr);
        }
      }

      return NextResponse.json({
        success: true,
        message: isImmediate ? 'Broadcast status set to LIVE NOW' : `Countdown scheduled for ${parsedCountdown} minutes`,
        status: targetStatus,
        scheduledTime,
        state: globalLiveState,
      });
    }

    if (action === 'done' || action === 'ended' || action === 'archive') {
      globalLiveState.status = 'ended';
      globalLiveState.endedAt = new Date().toISOString();
      globalLiveState.lastUpdated = new Date().toISOString();

      return NextResponse.json({ success: true, message: 'Broadcast concluded', state: globalLiveState });
    }

    return NextResponse.json({ error: 'Invalid action provided' }, { status: 400 });
  } catch (err: any) {
    console.error('Error in live-status route:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
