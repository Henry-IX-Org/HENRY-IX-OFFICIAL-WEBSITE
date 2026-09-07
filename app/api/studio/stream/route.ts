import { NextRequest, NextResponse } from 'next/server';
import { getAudioStreamForTrack } from '@/lib/dropbox';
import { queryNotionDatabase, NOTION_DATABASES, getNotionText } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackId = searchParams.get('trackId') || undefined;
    let fileLocation = searchParams.get('location') || undefined;
    const title = searchParams.get('title') || undefined;
    const artist = searchParams.get('artist') || undefined;
    const format = searchParams.get('format');
    const shouldRedirect = searchParams.get('redirect') !== 'false';

    // If trackId provided and fileLocation not provided, fetch from Notion
    if (trackId && !fileLocation) {
      const apiKey = process.env.NOTION_API_KEY;
      if (apiKey) {
        try {
          const pageRes = await fetch(`https://api.notion.com/v1/pages/${trackId}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Notion-Version': '2022-06-28',
            },
          });
          if (pageRes.ok) {
            const page: any = await pageRes.json();
            fileLocation = getNotionText(page.properties?.['File Location']);
          }
        } catch (e) {
          console.warn('[Stream Route] Failed to fetch Notion page:', e);
        }
      }
    }

    const streamUrl = await getAudioStreamForTrack({
      fileLocation,
      title,
      artist,
    });

    if (!streamUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Audio stream not found in Dropbox for this track',
          fileLocation: fileLocation || null,
        },
        { status: 404 }
      );
    }

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        streamUrl,
        fileLocation,
      });
    }

    // Default: 307 Temporary Redirect to the high-speed Dropbox CDN URL
    const response = NextResponse.redirect(streamUrl, 307);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    response.headers.set('Cache-Control', 'public, max-age=10800'); // Cache for 3 hours
    return response;
  } catch (error: any) {
    console.error('[Stream Route Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Streaming failed' },
      { status: 500 }
    );
  }
}
