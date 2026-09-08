import { NextResponse } from 'next/server';
import { getBroadcastHistory } from '@/lib/cloudflareStream';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const history = await getBroadcastHistory();
    return NextResponse.json(
      {
        success: true,
        history,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching broadcast history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
