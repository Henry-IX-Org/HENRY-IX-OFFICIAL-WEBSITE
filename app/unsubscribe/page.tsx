import { Suspense } from 'react';
import { Metadata } from 'next';
import UnsubscribeClient from './unsubscribe-client';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Unsubscribe | HENRY IX',
  description: 'Unsubscribe from HENRY IX email notifications.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-zinc-500">
          LOADING...
        </div>
      }
    >
      <UnsubscribeClient />
    </Suspense>
  );
}
