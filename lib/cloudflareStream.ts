/**
 * Cloudflare Stream Live & Recording Service
 * Provides low-latency OBS live ingest status, automatic video recordings,
 * simulcast (multistreaming) metadata, and stream history archives.
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || 'c7c5ff43a8ae174ad91e2668de0ad7f0';
const API_TOKEN = process.env.CLOUDFLARE_STREAM_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || '';
const LIVE_INPUT_ID = process.env.CLOUDFLARE_STREAM_LIVE_INPUT_ID || '';
const CUSTOMER_SUBDOMAIN = process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN || '';

export interface CloudflareLiveInput {
  uid: string;
  meta?: { name?: string };
  status: 'connected' | 'reconnecting' | 'disconnected' | 'ready';
  rtmps?: {
    url: string;
    streamKey: string;
  };
  created?: string;
  modified?: string;
}

export interface BroadcastHistoryItem {
  id: string;
  title: string;
  playbackId: string;
  date: string;
  duration: string;
  thumbnail: string;
  resolution: string;
}

// High-fidelity fallback sessions when no live streams have been archived yet
export const DEFAULT_BROADCAST_HISTORY: BroadcastHistoryItem[] = [
  {
    id: 'stream-archive-004',
    title: 'Knight Club: Session 4 // 4-Deck UKG & Speed Garage',
    playbackId: '930b5248e181432aa6e2f5a31832fd8d',
    date: '2026-08-28',
    duration: '1:45:20',
    thumbnail: 'https://pub-c7c5ff43a8ae174ad91e2668de0ad7f0.r2.dev/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%201.jpg',
    resolution: '1080P60 HD',
  },
  {
    id: 'stream-archive-003',
    title: 'Underground Rehearsals // Deep Hypnotic Acid',
    playbackId: '930b5248e181432aa6e2f5a31832fd8c',
    date: '2026-08-14',
    duration: '2:10:05',
    thumbnail: 'https://pub-c7c5ff43a8ae174ad91e2668de0ad7f0.r2.dev/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%201.jpg',
    resolution: '1080P60 HD',
  },
  {
    id: 'stream-archive-002',
    title: 'London Club Session // Vinyl & Digital Hybrid',
    playbackId: '930b5248e181432aa6e2f5a31832fd8b',
    date: '2026-07-30',
    duration: '1:28:40',
    thumbnail: 'https://pub-c7c5ff43a8ae174ad91e2668de0ad7f0.r2.dev/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%201.jpg',
    resolution: '1080P60 HD',
  },
];

/**
 * Formats duration in seconds to HH:MM:SS or MM:SS
 */
function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Checks the live broadcast status of the Cloudflare Stream Live Input.
 * Returns true if OBS is currently broadcasting video frames.
 */
export async function getLiveInputStatus(): Promise<{
  isLive: boolean;
  status: 'live' | 'upcoming' | 'offline';
  playbackId: string;
  title: string;
}> {
  if (!API_TOKEN || !LIVE_INPUT_ID) {
    return {
      isLive: false,
      status: 'offline',
      playbackId: '',
      title: 'HENRY IX // LIVE',
    };
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/live_inputs/${LIVE_INPUT_ID}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 5 }, // 5-second edge cache
      }
    );

    if (!res.ok) {
      console.warn(`Cloudflare Stream API responded with ${res.status}`);
      return {
        isLive: false,
        status: 'offline',
        playbackId: '',
        title: 'HENRY IX // LIVE',
      };
    }

    const data: any = await res.json();
    const liveInput = data?.result;
    const isLive = liveInput?.status === 'connected';

    return {
      isLive,
      status: isLive ? 'live' : 'offline',
      playbackId: LIVE_INPUT_ID,
      title: liveInput?.meta?.name || 'HENRY IX // LIVE',
    };
  } catch (error) {
    console.error('Failed to query Cloudflare Stream live status:', error);
    return {
      isLive: false,
      status: 'offline',
      playbackId: '',
      title: 'HENRY IX // LIVE',
    };
  }
}

/**
 * Retrieves recorded broadcast history from Cloudflare Stream.
 * Automatically converts finished live sets into stream history cards.
 */
export async function getBroadcastHistory(): Promise<BroadcastHistoryItem[]> {
  if (!API_TOKEN || !LIVE_INPUT_ID) {
    return DEFAULT_BROADCAST_HISTORY;
  }

  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream/live_inputs/${LIVE_INPUT_ID}/videos`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // 1-minute cache for history
      }
    );

    if (!res.ok) {
      return DEFAULT_BROADCAST_HISTORY;
    }

    const data: any = await res.json();
    const videos = data?.result || [];

    if (!Array.isArray(videos) || videos.length === 0) {
      return DEFAULT_BROADCAST_HISTORY;
    }

    return videos.map((v: any, index: number) => ({
      id: v.uid,
      title: v.meta?.name || `Live DJ Session #${videos.length - index}`,
      playbackId: v.uid,
      date: v.created ? new Date(v.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      duration: formatDuration(v.duration || 0),
      thumbnail: v.thumbnail || `https://videodelivery.net/${v.uid}/thumbnails/thumbnail.jpg`,
      resolution: v.input?.height ? `${v.input.height}p` : '1080P60 HD',
    }));
  } catch (error) {
    console.error('Failed to fetch Cloudflare Stream broadcast history:', error);
    return DEFAULT_BROADCAST_HISTORY;
  }
}

/**
 * Returns the best embed or HLS playback URL for a Cloudflare Stream video or live input.
 */
export function getCloudflareStreamPlaybackUrl(playbackId: string): {
  iframeUrl: string;
  hlsUrl: string;
} {
  if (!playbackId) {
    return { iframeUrl: '', hlsUrl: '' };
  }

  // If already an absolute URL (e.g. custom HLS link)
  if (playbackId.startsWith('http://') || playbackId.startsWith('https://')) {
    return {
      iframeUrl: playbackId,
      hlsUrl: playbackId,
    };
  }

  // Cloudflare Universal Video Delivery URLs
  if (CUSTOMER_SUBDOMAIN) {
    return {
      iframeUrl: `https://${CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${playbackId}/iframe`,
      hlsUrl: `https://${CUSTOMER_SUBDOMAIN}.cloudflarestream.com/${playbackId}/manifest/video.m3u8`,
    };
  }

  return {
    iframeUrl: `https://iframe.videodelivery.net/${playbackId}`,
    hlsUrl: `https://videodelivery.net/${playbackId}/manifest/video.m3u8`,
  };
}
