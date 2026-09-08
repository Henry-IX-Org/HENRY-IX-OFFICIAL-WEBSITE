import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AudioProvider } from '@/components/AudioProvider';
import ClientLayoutWrappers from '@/components/ClientLayoutWrappers';

const avathe = localFont({
  src: './fonts/avathe.otf',
  variable: '--font-avathe',
  display: 'swap',
  adjustFontFallback: false,
});

const ocra = localFont({
  src: './fonts/ocra.woff',
  variable: '--font-ocra',
  display: 'swap',
  adjustFontFallback: false,
});

// Local monospace font fallback (avoids build-time Google Fonts network TLS failures)
const ibmPlexMono = {
  variable: '',
};

export const viewport: Viewport = {
  themeColor: '#D8163F',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://henryix.com'),
  title: {
    default: 'HENRY IX | London DJ & Electronic Music Producer',
    template: '%s | HENRY IX',
  },
  description: 'Official website of HENRY IX. High-energy UK Garage, Speed Garage, and underground bassline sets. Stream live sets, virtual CDJ sessions, and view London tour dates.',
  keywords: [
    'HENRY IX',
    'Henry IX DJ',
    'London DJ',
    'UK Garage',
    'UKG',
    'Speed Garage',
    'Underground Bassline',
    'Electronic Music Producer',
    'Knight Club',
    'Corner New Cross',
    'Live DJ Sets',
    'CDJ-3000',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HENRY IX DJ',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://henryix.com',
    siteName: 'HENRY IX DJ',
    title: 'HENRY IX | London DJ & Electronic Music Producer',
    description: 'Official website of HENRY IX. High-energy UK Garage, Speed Garage, and underground bassline sets. Stream live sets, virtual CDJ sessions, and view London tour dates.',
    images: [
      {
        url: 'https://pub-c7c5ff43a8ae174ad91e2668de0ad7f0.r2.dev/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%201.jpg',
        width: 1200,
        height: 630,
        alt: 'HENRY IX DJ Performance & Studio Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HENRY IX | London DJ & Electronic Music Producer',
    description: 'Official website of HENRY IX. High-energy UK Garage, Speed Garage, and underground bassline sets. Stream live sets and view London tour dates.',
    site: '@HenryIXDJ',
    creator: '@HenryIXDJ',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Person', 'MusicGroup'],
  '@id': 'https://henryix.com/#person',
  'name': 'HENRY IX',
  'alternateName': 'Henry IX DJ',
  'url': 'https://henryix.com',
  'image': 'https://henryix.com/og-image.jpg',
  'description': 'London-based electronic music producer and high-energy DJ specializing in UK Garage, Speed Garage, and Underground Bassline.',
  'genre': [
    'UK Garage',
    'Speed Garage',
    'Underground Bassline',
    'Electronic',
    'House',
  ],
  'knowsAbout': [
    'UK Garage',
    'Speed Garage',
    'Underground Bassline',
    'Audio Engineering',
    'Pioneer CDJ-3000',
    'DJ Performance',
  ],
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'London',
    'addressCountry': 'GB',
  },
  'sameAs': [
    'https://soundcloud.com/henryixdj',
    'https://open.spotify.com/artist/henryix',
    'https://www.mixcloud.com/HenryIXDJ/',
    'https://www.instagram.com/henryixdj/',
    'https://www.tiktok.com/@henryixdj',
    'https://www.youtube.com/@HenryIXDJ',
    'https://www.twitch.tv/henryixdj',
    'https://www.facebook.com/HenryIXDJ/',
    'https://x.com/HenryIXDJ',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${avathe.variable} ${ocra.variable} ${ibmPlexMono.variable}`}>
      <head>
        <link rel="dns-prefetch" href="https://assets.henryix.com" />
        <link rel="dns-prefetch" href="https://pub-c7c5ff43a8ae174ad91e2668de0ad7f0.r2.dev" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="bg-black">
        <AudioProvider>
          <ClientLayoutWrappers>
            {children}
          </ClientLayoutWrappers>
        </AudioProvider>
      </body>
    </html>
  );
}
