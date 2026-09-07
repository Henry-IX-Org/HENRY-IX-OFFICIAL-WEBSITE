import { NextRequest, NextResponse } from 'next/server';
import { getNotionBookings, getNotionSets, createNotionBooking } from '@/lib/notion';
import { StudioGig } from '@/store/studioStore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const [notionBookings, notionSets] = await Promise.all([
      getNotionBookings().catch(err => {
        console.warn('Error fetching Notion bookings:', err);
        return [];
      }),
      getNotionSets().catch(err => {
        console.warn('Error fetching Notion sets:', err);
        return [];
      }),
    ]);

    const gigs: StudioGig[] = notionBookings.map((b, idx): StudioGig => {
      const isConfirmed = b.stage?.toLowerCase().includes('confirmed') || b.depositPaid;
      const isCompleted = b.stage?.toLowerCase().includes('completed');
      const status: 'Confirmed' | 'Contract' | 'Completed' = isCompleted
        ? 'Completed'
        : isConfirmed
        ? 'Confirmed'
        : 'Contract';

      const phase: 1 | 2 | 3 | 4 | 5 = isCompleted
        ? 5
        : isConfirmed
        ? 3
        : 1;

      return {
        id: b.id,
        date: b.eventDate || 'TBD',
        title: b.title || 'Untitled Gig',
        venue: b.venue || 'TBD',
        address: b.venue ? `${b.venue}, London` : 'London, UK',
        setTime: '01:00 - 03:00',
        callTime: '23:30',
        departureTime: '22:30',
        transitRoute: 'London Underground / TfL Overground',
        fee: b.fee || 0,
        depositPaid: Boolean(b.depositPaid),
        promoter: b.client || 'Promoter',
        promoterPhone: b.contactPhone || b.contactEmail || 'N/A',
        wifi: 'Venue_Guest / Guest2026',
        guestlistAllocated: 6,
        ticketLink: 'https://ra.co',
        status,
        phase,
      };
    });

    return NextResponse.json({
      success: true,
      gigs,
      sets: notionSets,
      count: gigs.length,
    });
  } catch (error: any) {
    console.error('Error in Studio Gigs API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch gigs' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: any = await req.json().catch(() => ({}));
    const {
      title,
      venue,
      client,
      stage = 'Confirmed',
      eventType = 'Club Night',
      eventDate,
      fee = 0,
      deposit = 0,
      depositPaid = false,
      contactEmail,
      contactPhone,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const result = await createNotionBooking({
      title,
      venue,
      client,
      stage,
      eventType,
      eventDate,
      fee: Number(fee) || 0,
      deposit: Number(deposit) || 0,
      depositPaid: Boolean(depositPaid),
      contactEmail,
      contactPhone,
      notes,
    });

    if (!result || result.object === 'error') {
      return NextResponse.json(
        { success: false, error: result?.message || 'Failed to create booking in Notion database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Booking created successfully in Notion!',
      result,
    });
  } catch (error: any) {
    console.error('Error creating Notion booking:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
