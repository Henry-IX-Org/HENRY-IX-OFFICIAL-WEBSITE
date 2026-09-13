import { Suspense } from 'react';
import { Metadata } from 'next';
import PreferencesClient from './preferences-client';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Email Preferences | HENRY IX',
  description: 'Manage your alert preferences and notifications from HENRY IX.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreferencesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-zinc-500">
          LOADING PREFERENCES...
        </div>
      }
    >
      <PreferencesClient />
    </Suspense>
  );
}
