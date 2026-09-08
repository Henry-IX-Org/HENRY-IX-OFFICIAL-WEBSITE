import MixesClient from './mixes-client';
import { Metadata } from 'next';
import { getStorageUrl } from '@/lib/storage';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'DJ Mix Archive & Virtual CDJ Player | HENRY IX',
  description: 'Stream live-recorded DJ sets from London producer HENRY IX. High-energy UK Garage, Speed Garage, and Bassline sessions from Knight Club, Royal Court, and Corner New Cross.',
  keywords: [
    'HENRY IX Mixes',
    'Knight Club Mix',
    'Royal Court Mix',
    'Corner New Cross DJ Set',
    'UK Garage DJ Mix',
    'Speed Garage Set',
    'London UKG Mix',
    'Virtual CDJ Mixer',
  ],
  alternates: {
    canonical: 'https://henryix.com/mixes',
  },
  openGraph: {
    title: 'DJ Mix Archive & Virtual CDJ Player | HENRY IX',
    description: 'Stream live-recorded DJ sets from London producer HENRY IX. High-energy UK Garage, Speed Garage, and Bassline sessions from Knight Club, Royal Court, and Corner New Cross.',
    url: 'https://henryix.com/mixes',
    siteName: 'HENRY IX DJ',
    images: [
      {
        url: 'https://henryix.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HENRY IX Virtual CDJ Mix Vault',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DJ Mix Archive & Virtual CDJ Player | HENRY IX',
    description: 'Stream high-energy UK Garage, Speed Garage, and Bassline mixes from DJ Henry IX.',
    images: ['https://henryix.com/og-image.jpg'],
  },
};

const mixesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MusicPlaylist',
  'name': 'HENRY IX Official Mix Archive',
  'description': 'Live DJ sets, club residency recordings, and studio mix sessions by London electronic music producer HENRY IX.',
  'numTracks': 8,
  'creator': {
    '@type': 'Person',
    '@id': 'https://henryix.com/#person',
    'name': 'HENRY IX',
    'url': 'https://henryix.com',
  },
  'genre': ['UK Garage', 'Speed Garage', 'Underground Bassline', 'Electronic', 'House'],
  'track': [
    {
      '@type': 'MusicRecording',
      'name': 'Knight Club Session 1',
      'byArtist': { '@type': 'Person', 'name': 'HENRY IX' },
      'genre': 'UK Garage / Underground Bassline',
      'description': 'High-octane fast-paced underground UKG and bassline. Born to jest, forced to Joust.',
    },
    {
      '@type': 'MusicRecording',
      'name': 'Knight Club Session 2',
      'byArtist': { '@type': 'Person', 'name': 'HENRY IX' },
      'genre': 'UK Garage / Underground Bassline',
    },
    {
      '@type': 'MusicRecording',
      'name': 'Royal Court Session 1',
      'byArtist': { '@type': 'Person', 'name': 'HENRY IX' },
      'genre': 'House / Vocal UKG',
      'description': 'Deep groove, immersive house, and vocal selections. Lose your mind in The Great Hall.',
    },
    {
      '@type': 'MusicRecording',
      'name': 'Corner New Cross Night 1',
      'byArtist': { '@type': 'Person', 'name': 'HENRY IX' },
      'genre': 'Live Club Residency',
      'description': 'Authentic live club residency recordings capturing the raw energy of London nightlife.',
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mixesJsonLd) }}
      />
      <link rel="preload" as="image" href={getStorageUrl('/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%201.jpg')} />
      <link rel="preload" as="image" href={getStorageUrl('/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%202.jpg')} />
      <link rel="preload" as="image" href={getStorageUrl('/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%203.jpg')} />
      <link rel="preload" as="image" href={getStorageUrl('/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%204.jpg')} />
      <MixesClient />
    </>
  );
}
