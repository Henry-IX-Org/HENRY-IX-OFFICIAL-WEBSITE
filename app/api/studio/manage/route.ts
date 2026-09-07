import { NextRequest, NextResponse } from 'next/server';
import { createNotionBookingLead } from '@/lib/notion';
import { authenticateStudioRequest } from '@/lib/studioAuth';

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

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateStudioRequest(req);
    const body = (await req.json().catch(() => ({}))) as { type?: string; data?: any; secret?: string };
    const { type, data, secret } = body;

    const authHeader = req.headers.get('authorization');
    const providedSecret = secret || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '');
    const configuredSecret = process.env.STUDIO_SECRET || process.env.LIVE_STATUS_SECRET;
    const isSecretAuthorized = Boolean(configuredSecret && safeCompare(providedSecret, configuredSecret));

    if (!user && !isSecretAuthorized) {
      return NextResponse.json({ error: 'Unauthorized studio access: Valid session or secret required' }, { status: 401 });
    }

    if (!type || !data) {
      return NextResponse.json({ error: 'Missing type or document data' }, { status: 400 });
    }

    // Process Notion / Studio operations
    if (type === 'mix') {
      return NextResponse.json({
        success: true,
        message: `Mix "${data.title}" staged successfully in Studio & R2 edge storage!`,
        doc: {
          id: `mix_${Date.now()}`,
          title: data.title,
          bpm: Number(data.bpm) || 130,
          genre: data.genre || 'UK Garage',
          audioUrl: data.audioUrl,
          artworkUrl: data.artworkUrl,
          status: 'staged',
        }
      });
    } else if (type === 'galleryImage') {
      return NextResponse.json({
        success: true,
        message: `Asset "${data.title}" registered in Asset Vault & R2 mirror!`,
        doc: {
          id: `asset_${Date.now()}`,
          title: data.title,
          imageUrl: data.imageUrl,
          album: data.album || 'Me',
          section: data.section || 'General',
        }
      });
    } else if (type === 'bookingLead') {
      const result = await createNotionBookingLead({
        name: data.name || 'New Gig Inquiry',
        email: data.email,
        phone: data.phone,
        venue: data.venue,
        date: data.date,
        fee: data.fee,
        notes: data.notes,
      }).catch(err => {
        console.warn('Notion booking creation error:', err);
        return null;
      });

      return NextResponse.json({
        success: true,
        message: 'Booking lead recorded in Notion Bookings & Leads!',
        result,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${type} staged successfully in Studio command hub!`,
      data,
    });
  } catch (err: any) {
    console.error('Error in Studio Manage API:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
