import { NextRequest, NextResponse } from 'next/server';
import { getNotionMusicLibraryPaged } from '@/lib/notion';
import { StudioTrack } from '@/store/studioStore';
import { authenticateStudioRequest } from '@/lib/studioAuth';

export const dynamic = 'force-dynamic';

function getArtworkForTrack(title: string, artist: string): string {
  // Use high-resolution real R2 artworks
  const lower = (title + ' ' + artist).toLowerCase();
  if (lower.includes('knight club') || lower.includes('kept') || lower.includes('maja')) {
    return 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png';
  }
  if (lower.includes('corner') || lower.includes('tokyo') || lower.includes('g2g')) {
    return 'https://assets.henryix.com/Mixes/Corner%20New%20Cross/Mix%20Artwork/Night%201.png';
  }
  if (lower.includes('royal court') || lower.includes('diva') || lower.includes('zpectrum')) {
    return 'https://assets.henryix.com/Mixes/Royal%20Court/Mix%20Artwork/Session%202.png';
  }
  return 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%201.png';
}

function getHeatTag(bpm: number, energy: number): 'Peak Weapon' | 'Secret Dub' | 'Hypnotic Warm-up' {
  if (bpm >= 148 || energy >= 9.0) return 'Peak Weapon';
  if (bpm >= 138) return 'Secret Dub';
  return 'Hypnotic Warm-up';
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateStudioRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Valid studio session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const cursor = searchParams.get('cursor') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 50), 100) : 50;
    const forceFresh = searchParams.get('fresh') === 'true';

    const page = await getNotionMusicLibraryPaged({
      search,
      genre,
      pageSize: limit,
      startCursor: cursor,
      forceFresh,
    });

    const studioTracks: StudioTrack[] = page.tracks.map((t, idx) => {
      const bpm = t.bpm && !isNaN(t.bpm) && t.bpm > 0 ? t.bpm : 145.0;
      const energy = t.energy && !isNaN(t.energy) ? Math.min(10, Math.max(1, t.energy)) : 8.5;
      const duration = t.durationSeconds && t.durationSeconds > 0 ? t.durationSeconds : 240;

      // Base frequency calculation for Web Audio synth preview: A4 = 440, proportional to BPM
      const audioFreq = Math.round(110 + (bpm % 40) * 2.5);

      return {
        id: t.id,
        title: t.title,
        artist: t.artist,
        bpm: Number(bpm.toFixed(1)),
        key: t.key || '8A',
        duration,
        source: (['Rekordbox', 'Spotify', 'SoundCloud', 'Local'].includes(t.source)
          ? t.source
          : 'Rekordbox') as any,
        energy: Number(energy.toFixed(1)),
        artwork: getArtworkForTrack(t.title, t.artist),
        label: t.label || undefined,
        year: t.year || undefined,
        mixPresence: t.notes?.includes('Mix') ? 'Staged' : undefined,
        heatTag: getHeatTag(bpm, energy),
        clearance: t.source === 'SoundCloud' ? 'DMCA Risk' : 'Stream-Safe',
        audioFrequency: audioFreq,
        cues: [
          { letter: 'A', name: 'Intro Kick', time: 0.0, color: '#10b981' },
          { letter: 'B', name: 'Build In', time: Math.round(duration * 0.25), color: '#06b6d4' },
          { letter: 'C', name: 'Main Drop', time: Math.round(duration * 0.45), color: '#ef4444' },
          { letter: 'D', name: 'Second Hook', time: Math.round(duration * 0.7), color: '#eab308' },
          { letter: 'E', name: 'Mix Out', time: Math.round(duration * 0.9), color: '#f97316' },
        ],
        fileLocation: t.fileLocation || undefined,
        streamUrl: t.fileLocation
          ? `/api/studio/stream?trackId=${t.id}&location=${encodeURIComponent(t.fileLocation)}`
          : `/api/studio/stream?trackId=${t.id}`,
      };
    });

    return NextResponse.json({
      success: true,
      tracks: studioTracks,
      nextCursor: page.nextCursor,
      hasMore: page.hasMore,
      count: studioTracks.length,
    });
  } catch (error: any) {
    console.error('Error fetching studio tracks from Notion:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tracks' },
      { status: 500 }
    );
  }
}
