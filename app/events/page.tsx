import EventsClient from './events-client';
import { Metadata } from 'next';
import { fetchPublicTourEvents, TourEvent } from '@/lib/tourEvents';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Live Performance Schedule & Events | HENRY IX',
  description: 'See upcoming live performance dates, locations, ticket purchase links, and residencies for DJ Henry IX.',
  alternates: {
    canonical: 'https://henryix.com/events',
  },
  openGraph: {
    title: 'Live Performance Schedule & Events | HENRY IX',
    description: 'See upcoming live performance dates, locations, ticket purchase links, and residencies for DJ Henry IX.',
    url: 'https://henryix.com/events',
    siteName: 'HENRY IX DJ',
    images: [
      {
        url: 'https://henryix.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HENRY IX Performance Tour Dates & Events',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Performance Schedule & Events | HENRY IX',
    description: 'See upcoming live performance dates, locations, ticket purchase links, and residencies for DJ Henry IX.',
    images: ['https://henryix.com/og-image.jpg'],
  },
};

export default async function Page() {
  const { events, source, count } = await fetchPublicTourEvents();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': 'https://henryix.com/#dj',
    'name': 'HENRY IX',
    'genre': ['Electronic', 'House', 'Techno', 'Dance'],
    'image': 'https://henryix.com/og-image.jpg',
    'url': 'https://henryix.com',
    'sameAs': ['https://soundcloud.com/henryix'],
    'event': events.map((e: TourEvent) => ({
      '@type': 'MusicEvent',
      'name': e.title || `HENRY IX Live at ${e.venue}`,
      'startDate': `${e.isoDate}T${e.startTime}:00Z`,
      'endDate': `${e.isoDate}T${e.endTime}:00Z`,
      'eventStatus': 'https://schema.org/EventScheduled',
      'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
      'location': {
        '@type': 'Place',
        'name': e.venue,
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': e.city,
          'addressCountry': e.country === 'UNITED KINGDOM' ? 'GB' : e.country,
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': e.lat,
          'longitude': e.lng,
        },
      },
      'image': 'https://henryix.com/og-image.jpg',
      'description': `HENRY IX Live DJ performance at ${e.venue}, ${e.city}. Catch Henry IX live in the mix with live visualizers.`,
      'offers': {
        '@type': 'Offer',
        'url': e.ticketLink || 'https://henryix.com/events',
        'priceCurrency': 'GBP',
        'availability': e.status === 'SOLD OUT' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        'validFrom': '2026-01-01',
      },
      'performer': {
        '@type': 'MusicGroup',
        'name': 'HENRY IX',
        'url': 'https://henryix.com',
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventsClient initialEvents={events} eventSource={source} eventCount={count} />
    </>
  );
}
