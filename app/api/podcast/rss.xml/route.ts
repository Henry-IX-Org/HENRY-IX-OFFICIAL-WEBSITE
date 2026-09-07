import { getNotionSets } from '@/lib/notion';
import { STATIC_MIX_GROUPS } from '@/lib/mixes';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let episodes: any[] = [];
    try {
      const notionSets = await getNotionSets();
      episodes = notionSets.map((set, idx) => ({
        id: set.id,
        title: set.name,
        episodeNumber: notionSets.length - idx,
        seasonNumber: 1,
        summary: set.notes || `${set.name} - Recorded live at ${set.venue || 'London'}`,
        audioUrl: set.soundcloudUrl || set.spotifyUrl || 'https://assets.henryix.com/podcast/latest.mp3',
        artworkUrl: 'https://assets.henryix.com/Mix%20Covers/henry-ix-podcast-cover.jpg',
        duration: '01:00:00',
        explicit: false,
        publishedAt: set.eventDate || new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Could not fetch podcast episodes from Notion:', e);
    }

    if (episodes.length === 0) {
      // Fallback to static mixes
      const allStatic = STATIC_MIX_GROUPS.flatMap(g => g.mixes);
      episodes = allStatic.map((m, idx) => ({
        id: m.id || `ep-${idx + 1}`,
        title: m.title,
        episodeNumber: allStatic.length - idx,
        seasonNumber: 1,
        summary: `HENRY IX Transmission: ${m.title}. High-fidelity DJ mix featuring UK Garage, 140, and Techno.`,
        audioUrl: m.url || 'https://assets.henryix.com/podcast/latest.mp3',
        artworkUrl: (m as any).artworkUrl || 'https://assets.henryix.com/Mix%20Covers/henry-ix-podcast-cover.jpg',
        duration: '00:58:00',
        explicit: false,
        publishedAt: '2026-07-16T00:00:00Z',
      }));
    }

    const host = 'https://henryix.com';
    const defaultArtwork = `${host}/og-image.jpg`;

    const safeEpisodes = Array.isArray(episodes) ? episodes : [];
    const itemsXml = safeEpisodes
      .map(ep => {
        const title = ep.title || `Episode ${ep.episodeNumber}`;
        const pubDate = ep.publishedAt ? new Date(ep.publishedAt).toUTCString() : new Date().toUTCString();
        const audioUrl = ep.audioUrl?.startsWith('http') ? ep.audioUrl : `${host}${ep.audioUrl || ''}`;
        const artworkUrl = ep.artworkUrl?.startsWith('http') ? ep.artworkUrl : (ep.artworkUrl ? `${host}${ep.artworkUrl}` : defaultArtwork);
        const explicit = ep.explicit ? 'yes' : 'no';

        return `
    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${ep.summary || title}]]></description>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${audioUrl}" type="audio/mpeg" length="0" />
      <guid isPermaLink="false">henryix-podcast-ep-${ep.episodeNumber || ep.id}</guid>
      <itunes:episode>${ep.episodeNumber || 1}</itunes:episode>
      <itunes:season>${ep.seasonNumber || 1}</itunes:season>
      <itunes:duration>${ep.duration || '00:45:00'}</itunes:duration>
      <itunes:explicit>${explicit}</itunes:explicit>
      <itunes:image href="${artworkUrl}" />
    </item>`;
      })
      .join('\n');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>HENRY IX OFFICIAL PODCAST & TRANSMISSIONS</title>
    <link>${host}</link>
    <language>en-gb</language>
    <copyright>Copyright 2026 HENRY IX</copyright>
    <itunes:author>HENRY IX</itunes:author>
    <itunes:summary>Official studio podcasts, live set archives, unreleased dubplates, and exclusive interviews with DJ Henry IX.</itunes:summary>
    <description>Official studio podcasts, live set archives, unreleased dubplates, and exclusive interviews with DJ Henry IX.</description>
    <itunes:owner>
      <itunes:name>HENRY IX</itunes:name>
      <itunes:email>broadcasts@henryix.com</itunes:email>
    </itunes:owner>
    <itunes:image href="${defaultArtwork}" />
    <itunes:category text="Music">
      <itunes:category text="Music Commentary" />
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(rssXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (err: any) {
    console.error('Error generating RSS XML:', err);
    return new Response('Error generating podcast RSS', { status: 500 });
  }
}
