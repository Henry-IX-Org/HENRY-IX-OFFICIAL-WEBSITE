import HomeClient from './home-client';
import { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'HENRY IX | London DJ & Electronic Music Producer',
  description: 'Official website of HENRY IX. High-energy UK Garage, Speed Garage, and underground bassline sets. Stream live sets, virtual CDJ sessions, and view London tour dates.',
  keywords: [
    'HENRY IX',
    'Henry IX DJ',
    'London DJ',
    'UK Garage',
    'UKG',
    'Speed Garage',
    'Underground Bassline',
    'Knight Club',
    'Corner New Cross',
    'Live DJ Sets',
    'CDJ-3000',
  ],
  alternates: {
    canonical: 'https://henryix.com',
  },
  openGraph: {
    title: 'HENRY IX | London DJ & Electronic Music Producer',
    description: 'Official website of HENRY IX. High-energy UK Garage, Speed Garage, and underground bassline sets. Stream live sets, virtual CDJ sessions, and view London tour dates.',
    url: 'https://henryix.com',
    siteName: 'HENRY IX DJ',
    images: [
      {
        url: 'https://henryix.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HENRY IX DJ Portfolio & Live Mix Archive',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HENRY IX | London DJ & Electronic Music Producer',
    description: 'Official website of HENRY IX. High-energy UK Garage, Speed Garage, and underground bassline sets.',
    images: ['https://henryix.com/og-image.jpg'],
  },
};

export default function Page() {
  return <HomeClient />;
}
