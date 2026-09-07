'use client';

import React from 'react';
import { RightDrawerTab } from './types';

// Module 01: Streaming
import TelemetryTab from './tabs/streaming/TelemetryTab';
import LiveChatTab from './tabs/streaming/LiveChatTab';
import ClipsTab from './tabs/streaming/ClipsTab';
import CopilotTab from './tabs/shared/CopilotTab';

// Module 02: Music
import DJUtilityTab from './tabs/music/DJUtilityTab';
import HarmonicMatchTab from './tabs/music/HarmonicMatchTab';
import SetlistTab from './tabs/music/SetlistTab';
import StoryDnaTab from './tabs/music/StoryDnaTab';

// Module 03: Assets
import AssetInspectorTab from './tabs/assets/AssetInspectorTab';
import SmartCropTab from './tabs/assets/SmartCropTab';
import R2SyncTab from './tabs/assets/R2SyncTab';
import EPKBuilderTab from './tabs/assets/EPKBuilderTab';

// Module 04: Gigs
import LogisticsTab from './tabs/gigs/LogisticsTab';
import ChecklistTab from './tabs/gigs/ChecklistTab';
import FinanceTab from './tabs/gigs/FinanceTab';
import AdmissionsTab from './tabs/gigs/AdmissionsTab';

// Module 05: Social
import PromoBuilderTab from './tabs/social/PromoBuilderTab';
import GridPreviewTab from './tabs/social/GridPreviewTab';
import StoryCardTab from './tabs/social/StoryCardTab';
import VipBroadcastTab from './tabs/social/VipBroadcastTab';

// Tab Driver Registry (Direct static mapping to eliminate async ChunkLoadError)
export const DRAWER_TAB_REGISTRY: Record<RightDrawerTab, React.ComponentType> = {
  // Module 01: Streaming
  'stream-telemetry': TelemetryTab,
  'live-chat': LiveChatTab,
  'copilot': CopilotTab,
  'stream-clips': ClipsTab,

  // Module 02: Music
  'dj-utility': DJUtilityTab,
  'harmonic-match': HarmonicMatchTab,
  'setlist': SetlistTab,
  'story-dna': StoryDnaTab,

  // Module 03: Assets
  'assets': AssetInspectorTab,
  'crop-watermark': SmartCropTab,
  'r2-sync': R2SyncTab,
  'epk': EPKBuilderTab,

  // Module 04: Gigs
  'logistics': LogisticsTab,
  'checklist': ChecklistTab,
  'finance': FinanceTab,
  'admissions': AdmissionsTab,

  // Module 05: Social
  'promo': PromoBuilderTab,
  'grid-preview': GridPreviewTab,
  'story-card': StoryCardTab,
  'vip-broadcast': VipBroadcastTab,
};
