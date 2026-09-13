import LiveClient from './live-client';
import { Metadata } from 'next';
import { getLiveInputStatus, getBroadcastHistory } from '@/lib/cloudflareStream';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Live Stream & Broadcasts | HENRY IX',
  description: 'Tune in to live streaming DJ sets, studio rehearsals, and multi-camera live broadcasts from DJ Henry IX in London.',
  keywords: [
    'HENRY IX Live',
    'Live DJ Stream',
    'UK Garage Stream',
    'London DJ Live',
    'Studio Broadcast',
  ],
  alternates: {
    canonical: 'https://henryix.com/live',
  },
  openGraph: {
    title: 'Live Stream & Broadcasts | HENRY IX',
    description: 'Tune in to live streaming DJ sets, studio rehearsals, and multi-camera live broadcasts from DJ Henry IX in London.',
    url: 'https://henryix.com/live',
    siteName: 'HENRY IX DJ',
    locale: 'en_GB',
    type: 'website',
  },
};

export default async function Page() {
  const [liveStatus, broadcastHistory] = await Promise.all([
    getLiveInputStatus().catch(() => ({
      isLive: false,
      status: 'offline' as const,
      playbackId: '',
      title: 'HENRY IX // LIVE',
    })),
    getBroadcastHistory().catch(() => []),
  ]);

  const initialSettings = {
    title: liveStatus.title || 'HENRY IX // LIVE',
    playbackId: liveStatus.playbackId || (broadcastHistory[0]?.playbackId ?? ''),
    viewerUserId: 'listener-' + Math.random().toString(36).substring(2, 7),
    status: liveStatus.status,
    scheduledTime: null as string | null,
    endedAt: null as string | null,
    resolution: '1080P60 HD',
    latency: 'Low Latency',
  };

  return <LiveClient initialSettings={initialSettings} history={broadcastHistory} />;
}
