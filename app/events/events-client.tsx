'use client';

import { GigSchedule } from '@/components/GigSchedule';
import PageShell from '@/components/PageShell';
import { TourEvent } from '@/lib/tourEvents';

interface EventsClientProps {
  initialEvents: TourEvent[] | null;
  eventSource?: 'notion' | 'calendar' | 'verified' | string;
  eventCount?: number;
}

export default function EventsClient({
  initialEvents,
  eventSource = 'notion',
  eventCount,
}: EventsClientProps) {
  return (
    <PageShell>
      <main className="w-full min-h-[100dvh] pt-20 pb-16 flex flex-col justify-start overflow-y-auto custom-scrollbar">
        <GigSchedule
          isDepth={true}
          initialEvents={initialEvents}
          eventSource={eventSource}
          eventCount={eventCount}
        />
      </main>
    </PageShell>
  );
}
