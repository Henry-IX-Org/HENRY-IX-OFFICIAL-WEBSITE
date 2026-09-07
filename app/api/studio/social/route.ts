import { NextRequest, NextResponse } from 'next/server';
import { getNotionContentCalendar, createNotionContentPost } from '@/lib/notion';
import { InstagramPost } from '@/store/studioStore';
import { authenticateStudioRequest } from '@/lib/studioAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateStudioRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Valid studio session required' }, { status: 401 });
    }

    const contentItems = await getNotionContentCalendar().catch(err => {
      console.warn('Error fetching Notion content calendar:', err);
      return [];
    });

    const posts: InstagramPost[] = contentItems.map(item => {
      const isGigFlyer = item.contentType?.toLowerCase().includes('flyer') || item.content.toLowerCase().includes('gig');
      const isVideo = item.contentType?.toLowerCase().includes('video') || item.contentType?.toLowerCase().includes('reel');
      const isTrack = item.contentType?.toLowerCase().includes('track') || item.contentType?.toLowerCase().includes('reveal');

      const type: 'Gig Flyer' | 'Video Clip' | 'Track Reveal' | 'Artwork' = isGigFlyer
        ? 'Gig Flyer'
        : isVideo
        ? 'Video Clip'
        : isTrack
        ? 'Track Reveal'
        : 'Artwork';

      return {
        id: item.id,
        title: item.content,
        date: item.publishDate || new Date().toISOString().slice(0, 10),
        type,
        scheduled: item.status?.toLowerCase().includes('scheduled') || item.status?.toLowerCase().includes('published'),
        image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
        caption: item.notes || item.campaign || '',
      };
    });

    return NextResponse.json({
      success: true,
      posts,
      rawItems: contentItems,
      count: posts.length,
    });
  } catch (error: any) {
    console.error('Error in Studio Social API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch content calendar' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateStudioRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Valid studio session required' }, { status: 401 });
    }

    const body: any = await req.json().catch(() => ({}));
    const {
      title,
      platform = 'Instagram',
      contentType = 'Reels / Feed',
      publishDate,
      status = 'Draft',
      campaign,
      publishedLink,
      notes,
    } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Content title is required' },
        { status: 400 }
      );
    }

    const result = await createNotionContentPost({
      content: title,
      platform,
      contentType,
      publishDate: publishDate || new Date().toISOString().slice(0, 10),
      status,
      campaign,
      publishedLink,
      notes,
    });

    if (!result || result.object === 'error') {
      return NextResponse.json(
        { success: false, error: result?.message || 'Failed to create post in Notion Content Calendar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post created in Notion Content Calendar!',
      result,
    });
  } catch (error: any) {
    console.error('Error creating Notion content post:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create content post' },
      { status: 500 }
    );
  }
}
