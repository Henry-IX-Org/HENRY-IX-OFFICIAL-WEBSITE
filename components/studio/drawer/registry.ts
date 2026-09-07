import dynamic from 'next/dynamic';
import React from 'react';
import { RightDrawerTab } from './types';

// Tab Driver Registry (Dynamic Load on Demand, SSR False)
export const DRAWER_TAB_REGISTRY: Record<RightDrawerTab, React.ComponentType> = {
  // Module 01: Streaming
  'stream-telemetry': dynamic(() => import('./tabs/streaming/TelemetryTab'), { ssr: false }),
  'live-chat': dynamic(() => import('./tabs/streaming/LiveChatTab'), { ssr: false }),
  'copilot': dynamic(() => import('./tabs/shared/CopilotTab'), { ssr: false }),
  'stream-clips': dynamic(() => import('./tabs/streaming/ClipsTab'), { ssr: false }),

  // Module 02: Music
  'dj-utility': dynamic(() => import('./tabs/music/DJUtilityTab'), { ssr: false }),
  'harmonic-match': dynamic(() => import('./tabs/music/HarmonicMatchTab'), { ssr: false }),
  'setlist': dynamic(() => import('./tabs/music/SetlistTab'), { ssr: false }),
  'story-dna': dynamic(() => import('./tabs/music/StoryDnaTab'), { ssr: false }),

  // Module 03: Assets
  'assets': dynamic(() => import('./tabs/assets/AssetInspectorTab'), { ssr: false }),
  'crop-watermark': dynamic(() => import('./tabs/assets/SmartCropTab'), { ssr: false }),
  'r2-sync': dynamic(() => import('./tabs/assets/R2SyncTab'), { ssr: false }),
  'epk': dynamic(() => import('./tabs/assets/EPKBuilderTab'), { ssr: false }),

  // Module 04: Gigs
  'logistics': dynamic(() => import('./tabs/gigs/LogisticsTab'), { ssr: false }),
  'checklist': dynamic(() => import('./tabs/gigs/ChecklistTab'), { ssr: false }),
  'finance': dynamic(() => import('./tabs/gigs/FinanceTab'), { ssr: false }),
  'admissions': dynamic(() => import('./tabs/gigs/AdmissionsTab'), { ssr: false }),

  // Module 05: Social
  'promo': dynamic(() => import('./tabs/social/PromoBuilderTab'), { ssr: false }),
  'grid-preview': dynamic(() => import('./tabs/social/GridPreviewTab'), { ssr: false }),
  'story-card': dynamic(() => import('./tabs/social/StoryCardTab'), { ssr: false }),
  'vip-broadcast': dynamic(() => import('./tabs/social/VipBroadcastTab'), { ssr: false }),
};
