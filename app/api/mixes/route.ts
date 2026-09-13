import { NextResponse } from 'next/server';
import { getNotionSets } from '@/lib/notion';
import { STATIC_MIX_GROUPS } from '@/lib/mixes';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notionSets = await getNotionSets().catch((err) => {
      console.warn('[API/mixes] Notion sets fetch error:', err);
      return [];
    });

    const dynamicMixes = (notionSets || [])
      .filter(set => set.soundcloudUrl || set.spotifyUrl || set.rekordboxExport)
      .map(set => ({
        id: set.id,
        title: set.name,
        url: set.soundcloudUrl || set.spotifyUrl,
        link: set.soundcloudUrl || set.spotifyUrl,
        bpm: 130,
        genre: set.occasion || 'UK Garage',
        tags: [set.venue, set.occasion, 'Live Set'].filter(Boolean),
        cuePoints: [],
        tracklist: set.notes || '',
        artworkUrl: undefined,
      }));

    const groups = STATIC_MIX_GROUPS.map(group => ({
      ...group,
      mixes: (group.mixes || []).filter(mix => mix.url || mix.link)
    })).filter(group => group.mixes.length > 0);

    if (dynamicMixes.length > 0) {
      groups.unshift({
        title: 'NOTION LIVE SETS & RELEASES',
        description: 'Synchronized live sets from the HENRY IX Notion Sets database',
        mixes: dynamicMixes as any,
      } as any);
    }

    return NextResponse.json({
      success: true,
      groups,
      dynamicMixes,
    });
  } catch (err: any) {
    console.error('Error in /api/mixes:', err);
    return NextResponse.json({
      success: true,
      groups: STATIC_MIX_GROUPS,
      dynamicMixes: [],
    });
  }
}
