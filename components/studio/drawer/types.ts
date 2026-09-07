import React from 'react';
import {
  Activity,
  MessageSquare,
  Bot,
  Scissors,
  Sliders,
  Sparkles,
  Music,
  BookOpen,
  FolderOpen,
  Smartphone,
  HardDrive,
  FileCheck,
  Calendar,
  CheckSquare,
  DollarSign,
  UserCheck,
  Share2,
  LayoutGrid,
  FileText,
  Send,
} from 'lucide-react';

export type RightDrawerTab =
  // Module 01: Streaming
  | 'stream-telemetry'
  | 'live-chat'
  | 'copilot'
  | 'stream-clips'
  // Module 02: Music
  | 'dj-utility'
  | 'harmonic-match'
  | 'setlist'
  | 'story-dna'
  // Module 03: Assets
  | 'assets'
  | 'crop-watermark'
  | 'r2-sync'
  | 'epk'
  // Module 04: Gigs
  | 'logistics'
  | 'checklist'
  | 'finance'
  | 'admissions'
  // Module 05: Social
  | 'promo'
  | 'grid-preview'
  | 'story-card'
  | 'vip-broadcast';

export interface TabConfig {
  id: RightDrawerTab;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const MODULE_TABS: Record<'streaming' | 'music' | 'assets' | 'gigs' | 'social', TabConfig[]> = {
  streaming: [
    { id: 'stream-telemetry', label: 'Telemetry', shortLabel: '📡 Telemetry', icon: Activity },
    { id: 'live-chat', label: 'Live Chat', shortLabel: '💬 Live Chat', icon: MessageSquare },
    { id: 'copilot', label: 'AI Copilot', shortLabel: '🤖 Copilot', icon: Bot },
    { id: 'stream-clips', label: 'Clips & EDL', shortLabel: '🎬 Clips', icon: Scissors },
  ],
  music: [
    { id: 'dj-utility', label: 'DJ Utility', shortLabel: '🎛️ DJ Utility', icon: Sliders },
    { id: 'harmonic-match', label: 'Harmonic Match', shortLabel: '⚡ Harmonic', icon: Sparkles },
    { id: 'setlist', label: 'Setlist', shortLabel: '🎵 Setlist', icon: Music },
    { id: 'story-dna', label: 'Story & DNA', shortLabel: '📖 Story DNA', icon: BookOpen },
  ],
  assets: [
    { id: 'assets', label: 'Asset Info', shortLabel: '📁 Asset Info', icon: FolderOpen },
    { id: 'crop-watermark', label: 'Crop Guard', shortLabel: '📐 Crop Guard', icon: Smartphone },
    { id: 'r2-sync', label: 'R2 Sync', shortLabel: '⚡ R2 Sync', icon: HardDrive },
    { id: 'epk', label: 'EPK Builder', shortLabel: '📄 EPK Builder', icon: FileCheck },
  ],
  gigs: [
    { id: 'logistics', label: 'Logistics', shortLabel: '📅 Logistics', icon: Calendar },
    { id: 'checklist', label: 'DJ Bag', shortLabel: '🎒 DJ Bag', icon: CheckSquare },
    { id: 'finance', label: 'Finance & Tax', shortLabel: '💰 Finance', icon: DollarSign },
    { id: 'admissions', label: 'Guestlist', shortLabel: '👥 Guestlist', icon: UserCheck },
  ],
  social: [
    { id: 'promo', label: 'Promo Posts', shortLabel: '⚡ Promo', icon: Share2 },
    { id: 'grid-preview', label: '3x3 Grid', shortLabel: '🗓️ 3x3 Grid', icon: LayoutGrid },
    { id: 'story-card', label: 'Story Card', shortLabel: '📱 Story Card', icon: FileText },
    { id: 'vip-broadcast', label: 'VIP Alert', shortLabel: '✉️ VIP Alert', icon: Send },
  ],
};

export const VIEW_DEFAULT_TABS: Record<string, { primary: RightDrawerTab; companion: RightDrawerTab }> = {
  // 01 STREAMING
  'streaming-live': { primary: 'stream-telemetry', companion: 'live-chat' },
  'streaming-analytics': { primary: 'stream-telemetry', companion: 'copilot' },
  'streaming-clips': { primary: 'stream-clips', companion: 'stream-telemetry' },

  // 02 MUSIC
  'music-all': { primary: 'dj-utility', companion: 'harmonic-match' },
  'music-crate-kc4': { primary: 'setlist', companion: 'dj-utility' },
  'music-crate-rc2': { primary: 'setlist', companion: 'dj-utility' },
  'music-crate-cn1': { primary: 'setlist', companion: 'dj-utility' },
  'music-smart-crates': { primary: 'harmonic-match', companion: 'setlist' },
  'music-spotify': { primary: 'dj-utility', companion: 'story-dna' },
  'music-soundcloud': { primary: 'dj-utility', companion: 'story-dna' },
  'music-set-planning': { primary: 'harmonic-match', companion: 'setlist' },
  'music-organiser': { primary: 'story-dna', companion: 'dj-utility' },
  'music-radar': { primary: 'story-dna', companion: 'harmonic-match' },
  'music-hardware': { primary: 'dj-utility', companion: 'harmonic-match' },

  // 03 ASSETS
  'assets-vault': { primary: 'assets', companion: 'crop-watermark' },
  'assets-dropzone': { primary: 'crop-watermark', companion: 'assets' },
  'assets-r2': { primary: 'r2-sync', companion: 'assets' },
  'assets-epk': { primary: 'epk', companion: 'assets' },

  // 04 GIGS
  'gigs-hub': { primary: 'logistics', companion: 'checklist' },
  'gigs-daysheet': { primary: 'logistics', companion: 'checklist' },
  'gigs-checklist': { primary: 'checklist', companion: 'logistics' },
  'gigs-finance': { primary: 'finance', companion: 'logistics' },
  'gigs-scanner': { primary: 'admissions', companion: 'logistics' },

  // 05 SOCIAL
  'social-scout': { primary: 'promo', companion: 'vip-broadcast' },
  'social-grid': { primary: 'grid-preview', companion: 'promo' },
  'social-pipeline': { primary: 'story-card', companion: 'promo' },
  'social-vip': { primary: 'vip-broadcast', companion: 'promo' },
};

export function getActiveModuleCategory(view: string): 'streaming' | 'music' | 'assets' | 'gigs' | 'social' {
  if (view.startsWith('streaming')) return 'streaming';
  if (view.startsWith('music')) return 'music';
  if (view.startsWith('assets')) return 'assets';
  if (view.startsWith('gigs')) return 'gigs';
  if (view.startsWith('social')) return 'social';
  return 'music';
}

export interface StudioRightDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  activeModule?: string;
  activeTrack?: any;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  requestedTab?: RightDrawerTab | null;
  onTabChange?: (tab: RightDrawerTab) => void;
}
