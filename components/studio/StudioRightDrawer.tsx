'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  Columns, 
  Bot, 
  Sliders, 
  BookOpen, 
  Sparkles, 
  CornerDownLeft,
  Calendar,
  CheckCircle2,
  Share2,
  Play,
  Pause,
  Trash2,
  Download,
  FolderOpen,
  Copy,
  ExternalLink,
  Music,
  Clock,
  Layers,
  CheckSquare,
  Train,
  Maximize2,
  Minimize2,
  Activity,
  MessageSquare,
  Flame,
  Radio,
  Tv,
  Send,
  Volume2,
  AlertTriangle,
  Scissors,
  LayoutGrid,
  FileCheck,
  HardDrive,
  DollarSign,
  UserCheck,
  FileText,
  Smartphone,
  Plus,
  RotateCcw,
  MoveUp,
  MoveDown,
  ShieldAlert,
  Mic,
  MicOff,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { useStudioStore, StudioTrack, StudioGig, BagItem, AdmittedGuest, InstagramPost } from '@/store/studioStore';

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

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  actionCard?: {
    id: string;
    title: string;
    targetId?: string;
    before: string;
    after: string;
    type: 'metadata' | 'logistics' | 'promo' | 'stream';
    applied: boolean;
  };
}

interface LiveChatMessage {
  id: string;
  user: string;
  platform: 'Twitch' | 'YouTube';
  badge?: string;
  time: string;
  text: string;
}

export default function StudioRightDrawer({
  isOpen,
  onClose,
  width = 380,
  activeModule = 'streaming-live',
  isExpanded = false,
  onToggleExpand,
  requestedTab,
  onTabChange,
}: StudioRightDrawerProps) {
  // Determine current active module category
  const moduleCategory = useMemo(() => getActiveModuleCategory(activeModule), [activeModule]);
  const currentModuleTabs = useMemo(() => MODULE_TABS[moduleCategory], [moduleCategory]);

  const [activeTab, setActiveTab] = useState<RightDrawerTab>(() => {
    return VIEW_DEFAULT_TABS[activeModule]?.primary || 'stream-telemetry';
  });
  const [splitPane, setSplitPane] = useState(false);
  const [splitBottomTab, setSplitBottomTab] = useState<RightDrawerTab>(() => {
    return VIEW_DEFAULT_TABS[activeModule]?.companion || 'copilot';
  });

  // Input states
  const [copilotInput, setCopilotInput] = useState('');
  const [scrubPosition, setScrubPosition] = useState(42);
  const [liveChatInput, setLiveChatInput] = useState('');
  const [chatFilter, setChatFilter] = useState<'All' | 'Twitch' | 'YouTube'>('All');

  // Zustand Store Hooks
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const playTrack = useStudioStore((s) => s.playTrack);
  const trackCollection = useStudioStore((s) => s.trackCollection);
  const activeSetlist = useStudioStore((s) => s.activeSetlist);
  const addToSetlist = useStudioStore((s) => s.addToSetlist);
  const removeFromSetlist = useStudioStore((s) => s.removeFromSetlist);
  const pitchSemitones = useStudioStore((s) => s.pitchSemitones);
  const setPitchSemitones = useStudioStore((s) => s.setPitchSemitones);
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const setActiveGigId = useStudioStore((s) => s.setActiveGigId);
  const bagItems = useStudioStore((s) => s.bagItems);
  const toggleBagItem = useStudioStore((s) => s.toggleBagItem);
  const admittedGuests = useStudioStore((s) => s.admittedGuests);
  const admitGuest = useStudioStore((s) => s.admitGuest);
  const downloadInvoice = useStudioStore((s) => s.downloadInvoice);
  const downloadDaySheet = useStudioStore((s) => s.downloadDaySheet);
  const smartCropMode = useStudioStore((s) => s.smartCropMode);
  const setSmartCropMode = useStudioStore((s) => s.setSmartCropMode);
  const watermarkActive = useStudioStore((s) => s.watermarkActive);
  const setWatermarkActive = useStudioStore((s) => s.setWatermarkActive);
  const triggerEmergencyPurge = useStudioStore((s) => s.triggerEmergencyPurge);
  const instagramGrid = useStudioStore((s) => s.instagramGrid);
  const reorderInstagramGrid = useStudioStore((s) => s.reorderInstagramGrid);
  const addInstagramPost = useStudioStore((s) => s.addInstagramPost);
  const cleanTrackTitle = useStudioStore((s) => s.cleanTrackTitle);
  const exportRekordboxXml = useStudioStore((s) => s.exportRekordboxXml);
  const taxRate = useStudioStore((s) => s.settings.taxReserve);
  const addToast = useStudioStore((s) => s.addToast);

  const FALLBACK_GIG: StudioGig = useMemo(() => ({
    id: '',
    date: 'TBD',
    title: 'No Upcoming Gigs',
    venue: 'London, UK',
    address: 'London, UK',
    setTime: '01:00 - 03:00',
    callTime: '23:30',
    departureTime: '22:30',
    transitRoute: 'London TfL Network',
    fee: 0,
    depositPaid: false,
    promoter: 'Promoter',
    promoterPhone: 'N/A',
    wifi: 'Venue_Guest',
    guestlistAllocated: 6,
    ticketLink: 'https://ra.co',
    status: 'Contract',
    phase: 1,
  }), []);

  const activeGig: StudioGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || FALLBACK_GIG;

  // Calculated shifted Camelot key based on real-time pitch vocoder semitones
  const shiftedCamelotKey = useMemo(() => {
    const rawKey = currentTrack.key || '8A';
    if (pitchSemitones === 0) return rawKey;
    const match = rawKey.match(/^(\d{1,2})([AB])$/);
    if (!match) return rawKey;
    const num = parseInt(match[1]);
    const letter = match[2];
    const shiftedNum = (((num - 1 + pitchSemitones * 7) % 12 + 12) % 12) + 1;
    return `${shiftedNum}${letter}`;
  }, [currentTrack.key, pitchSemitones]);

  const prevActiveModuleRef = useRef<string>(activeModule);

  // Sync external tab request (e.g. clicking 💬 Copilot in top app bar or command palette)
  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  // Dynamic Tab Router: updates available tabs and auto-selects appropriate tab when navigation changes
  useEffect(() => {
    const isModuleChange = prevActiveModuleRef.current !== activeModule;
    prevActiveModuleRef.current = activeModule;

    if (isModuleChange) {
      const defaultMapping = VIEW_DEFAULT_TABS[activeModule];
      if (defaultMapping) {
        setActiveTab(defaultMapping.primary);
        setSplitBottomTab(defaultMapping.companion);
        onTabChange?.(defaultMapping.primary);
      } else {
        const firstTab = currentModuleTabs[0]?.id || 'stream-telemetry';
        const secondTab = currentModuleTabs[1]?.id || 'copilot';
        setActiveTab(firstTab);
        setSplitBottomTab(secondTab);
        onTabChange?.(firstTab);
      }
    } else {
      // Ensure activeTab is valid in current module unless it is universal copilot
      const validTabs = currentModuleTabs.map((t) => t.id);
      if (!validTabs.includes(activeTab) && activeTab !== 'copilot') {
        const fallback = currentModuleTabs[0]?.id || 'stream-telemetry';
        setActiveTab(fallback);
        onTabChange?.(fallback);
      }
    }
  }, [activeModule, currentModuleTabs, onTabChange, activeTab]);

  // Real-time Waveform Scrubbing Simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setScrubPosition((prev) => (prev >= currentTrack.duration ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  // Stream Duration Timer
  const [streamDuration, setStreamDuration] = useState(5058); // 01:24:18
  useEffect(() => {
    const timer = setInterval(() => {
      setStreamDuration((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- MODULE 01: STREAMING STATES ---
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>([
    { id: 'c1', user: 'dither_boy', platform: 'Twitch', badge: 'VIP', time: '01:23:40', text: 'that transition at the 32-bar drop was insane 🔥' },
    { id: 'c2', user: 'sub_bass_uk', platform: 'YouTube', badge: 'Mod', time: '01:23:55', text: 'Track ID please?! London sound is unmatched' },
    { id: 'c3', user: 'knight_club_crew', platform: 'Twitch', time: '01:24:05', text: 'HENRY IX in the building 👑' },
    { id: 'c4', user: 'techno_head_99', platform: 'YouTube', time: '01:24:12', text: 'Need this unreleased dubplate in my life right now' },
  ]);

  const [highlightClips, setHighlightClips] = useState([
    { id: 'clip-1', time: '00:24:18', title: 'Peak Bass Drop (MAJA - KEPT)', energy: 9.2, status: 'Ready for Reels' },
    { id: 'clip-2', time: '00:48:32', title: 'Unreleased Dubplate Reveal', energy: 10.0, status: '1080p Transcoded' },
    { id: 'clip-3', time: '01:12:05', title: 'Do It Diva Double Drop', energy: 8.8, status: 'Ready for Reels' },
    { id: 'clip-4', time: '01:24:18', title: 'Favela Funk Final Hook', energy: 9.5, status: 'Pending' },
  ]);
  const [newClipNote, setNewClipNote] = useState('Heavy 32-Bar Vocal Double');
  const [newClipEnergy, setNewClipEnergy] = useState(9.0);

  const handleSendLiveChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!liveChatInput.trim()) return;
    const newMsg: LiveChatMessage = {
      id: `c-${Date.now()}`,
      user: 'HENRY IX (DJ)',
      platform: 'Twitch',
      badge: 'BROADCASTER',
      time: formatTime(streamDuration),
      text: liveChatInput.trim(),
    };
    setLiveChatMessages((prev) => [...prev, newMsg]);
    setLiveChatInput('');
    addToast({
      title: 'CHAT BROADCAST',
      message: 'Message delivered to Twitch & YouTube channels.',
      type: 'info',
    });
  };

  const handleAddClip = () => {
    const timestamp = formatTime(streamDuration);
    const newEntry = {
      id: `clip-${Date.now()}`,
      time: timestamp,
      title: newClipNote.trim() || `Stream Highlight ${timestamp}`,
      energy: newClipEnergy,
      status: 'Ready for Reels',
    };
    setHighlightClips((prev) => [newEntry, ...prev]);
    addToast({
      title: 'STREAM CLIP MARKED',
      message: `Marked "${newEntry.title}" at ${timestamp} (Energy: ${newClipEnergy}/10).`,
      type: 'success',
    });
  };

  const handleExportEDL = () => {
    const edlContent = `TITLE: HENRY_IX_BROADCAST_HIGHLIGHTS\nFCM: NON-DROP FRAME\n\n` + 
      highlightClips.map((c, i) => {
        const num = (i + 1).toString().padStart(3, '0');
        return `${num}  AX       V     C        ${c.time}:00 ${c.time}:30 ${c.time}:00 ${c.time}:30\n* FROM CLIP NAME: ${c.title}\n* ENERGY: ${c.energy}/10\n`;
      }).join('\n');

    const blob = new Blob([edlContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HENRY_IX_EDL_${Date.now()}.edl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      title: 'EDL EXPORTED',
      message: 'Downloaded DaVinci Resolve & Premiere EDL marker track.',
      type: 'success',
    });
  };

  // --- COPILOT CONVERSATIONAL STATE ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Good evening Henry. Studio AI Copilot online. 4 hard guardrails active: zero autonomous public mutations. Ready to assist with harmonic mixing, bootleg sanitation, call-times, or stream director cues.',
      actionCard: {
        id: 'action-1',
        title: 'CLEAN BOOTLEG METADATA',
        targetId: currentTrack?.id || 't-1',
        before: `${currentTrack?.artist || 'MAJA'} - ${currentTrack?.title || 'KEPT'} (Official Audio) [RIP] - 320kbps`,
        after: `Title: ${currentTrack?.title || 'KEPT'} • Artist: ${currentTrack?.artist || 'MAJA'} • Key: ${currentTrack?.key || '7A'}`,
        type: 'metadata',
        applied: false,
      },
    },
  ]);

  const handleSendCopilot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setCopilotInput('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      if (lower.includes('clean') || lower.includes('bootleg') || lower.includes('tag')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'I parsed the track against canonical records. Ready to strip rip tags and bitrates.',
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'CLEAN AUDIO METADATA',
              targetId: currentTrack.id,
              before: userText,
              after: `Title: ${currentTrack.title} • Artist: ${currentTrack.artist} • Key: ${currentTrack.key} • BPM: ${currentTrack.bpm}`,
              type: 'metadata',
              applied: false,
            },
          },
        ]);
      } else if (lower.includes('gig') || lower.includes('booking') || lower.includes('call-time') || lower.includes('travel') || lower.includes('transit')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `${activeGig.venue} transit route locked. 30-min buffer accounts for London Overground evening maintenance.`,
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'VERIFY GIG CALL-TIME',
              before: `Departure: 23:15 (Tight margin)`,
              after: `Departure: ${activeGig.departureTime} • Call-Time: ${activeGig.callTime} • Set: ${activeGig.setTime}`,
              type: 'logistics',
              applied: false,
            },
          },
        ]);
      } else if (lower.includes('stream') || lower.includes('obs') || lower.includes('frame') || lower.includes('telemetry')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Stream health nominal: 60.0 FPS, 6,240 kbps bitrate. Natural Director phrase cuts aligned to 16 bars.',
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'MARK 60S HIGHLIGHT CLIP',
              before: 'Timestamp: 01:24:18 (Unsaved)',
              after: 'Clip: "Peak Drop Double" staged for TikTok / Reels Dropzone',
              type: 'stream',
              applied: false,
            },
          },
        ]);
      } else if (lower.includes('promo') || lower.includes('social') || lower.includes('post')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Staging 4-post sequence for ${activeGig.venue} into 3x3 Instagram grid.`,
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'STAGE 4-POST PROMO CAMPAIGN',
              before: 'Empty Social Staging Queue',
              after: `4 Posts staged: Announcement, Teaser Clip, Run Sheet, 4K Highlights`,
              type: 'promo',
              applied: false,
            },
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Understood: "${userText}". All operations adhere to tour-grade standards. Ready to execute staged actions on command.`,
          },
        ]);
      }
    }, 450);
  };

  const handleApplyActionCard = (card: any, idx: number) => {
    if (card.type === 'metadata') {
      cleanTrackTitle(card.targetId || currentTrack.id);
      addToast({ title: 'METADATA SANITIZED', message: 'Applied Discogs canonical tags to audio deck.', type: 'success' });
    } else if (card.type === 'logistics') {
      addToast({ title: 'LOGISTICS VERIFIED', message: `${activeGig.venue} departure locked to ${activeGig.departureTime}.`, type: 'success' });
    } else if (card.type === 'stream') {
      handleAddClip();
    } else if (card.type === 'promo') {
      handleStagePromo();
    }

    setChatMessages((prev) => {
      const copy = [...prev];
      if (copy[idx]?.actionCard) {
        copy[idx].actionCard.applied = true;
      }
      return copy;
    });
  };

  // --- MODULE 02: MUSIC STATES ---
  const harmonicMatches = useMemo(() => {
    const currentKey = currentTrack.key || '8A';
    const match = currentKey.match(/^(\d{1,2})([AB])$/);
    if (!match) return [];
    const num = parseInt(match[1]);
    const letter = match[2];

    const plusOne = `${num === 12 ? 1 : num + 1}${letter}`;
    const minusOne = `${num === 1 ? 12 : num - 1}${letter}`;
    const relative = `${num}${letter === 'A' ? 'B' : 'A'}`;

    const results: Array<{ track: StudioTrack; relationship: string; tag: string }> = [];

    // Exact matches
    trackCollection
      .filter((t) => t.id !== currentTrack.id && t.key === currentKey)
      .forEach((t) => results.push({ track: t, relationship: 'Exact Key', tag: 'Flawless Blend' }));

    // +1 Camelot
    trackCollection
      .filter((t) => t.key === plusOne)
      .forEach((t) => results.push({ track: t, relationship: '+1 Camelot', tag: 'Energy Lift' }));

    // -1 Camelot
    trackCollection
      .filter((t) => t.key === minusOne)
      .forEach((t) => results.push({ track: t, relationship: '-1 Camelot', tag: 'Energy Drop' }));

    // Relative Major/Minor
    trackCollection
      .filter((t) => t.key === relative)
      .forEach((t) => results.push({ track: t, relationship: `Relative ${letter === 'A' ? 'Major' : 'Minor'}`, tag: 'Mood Shift' }));

    // Benchmarks fallback
    if (results.length < 4) {
      const candidates = [
        { id: 'lib-hm-1', title: 'rude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend)', artist: 'dj g2g', key: minusOne, bpm: currentTrack.bpm, duration: 180, source: 'Local' as const, energy: 8.5 },
        { id: 'lib-hm-2', title: 'Do It Diva (Don Omar x Heidi Montag) [free DL]', artist: 'zpectrum', key: currentKey, bpm: currentTrack.bpm, duration: 195, source: 'Local' as const, energy: 9.0 },
        { id: 'lib-hm-3', title: 'Favela Funk', artist: 'Flori Pori', key: plusOne, bpm: currentTrack.bpm, duration: 210, source: 'Local' as const, energy: 8.8 },
        { id: 'lib-hm-4', title: 'My Neck My Back [FREE DL]', artist: 'Sunshine Vendetta', key: relative, bpm: currentTrack.bpm, duration: 175, source: 'Local' as const, energy: 8.2 },
      ];
      candidates.forEach((c) => {
        if (!results.some((r) => r.track.title === c.title)) {
          const rel = c.key === currentKey ? 'Exact Key' : c.key === plusOne ? '+1 Camelot' : c.key === minusOne ? '-1 Camelot' : 'Relative Major';
          results.push({
            track: { ...c, artwork: currentTrack.artwork, audioFrequency: 140 },
            relationship: rel,
            tag: rel === 'Exact Key' ? 'Flawless Blend' : rel === '+1 Camelot' ? 'Energy Lift' : 'Harmonic Match',
          });
        }
      });
    }

    return results.slice(0, 6);
  }, [currentTrack.key, currentTrack.id, currentTrack.bpm, currentTrack.artwork, trackCollection]);

  // Track story vibe note
  const [vibeNoteText, setVibeNoteText] = useState(
    'Peak-time UK garage hybrid with hypnotic vocal chop. High-energy double-drop weapon with heavy sub-bass response on Funktion-One sound systems.'
  );

  // --- MODULE 03: ASSETS STATES ---
  const [selectedAssetId, setSelectedAssetId] = useState('asset-1');
  const [vaultAssets, setVaultAssets] = useState([
    { id: 'asset-1', title: 'Corner N1 - Crowd Reaction 04', type: 'Photo', dimensions: '2160x3840 (9:16)', size: '1.8 MB', codec: 'WebP 300dpi', r2Key: 'Gigs/Corner_N1/Crowd_04.webp', published: true },
    { id: 'asset-2', title: 'Booth Drop Overhead (0:45s)', type: 'Video', dimensions: '1080x1920 (9:16)', size: '24.2 MB', codec: 'Fast-Start MP4 H.264', r2Key: 'Videos/KC4_Booth_Drop_1080p.mp4', published: true },
    { id: 'asset-3', title: 'Official London Tour Poster', type: 'Flyer', dimensions: '2400x3000 (4:5)', size: '3.4 MB', codec: 'WebP Lossless', r2Key: 'Flyers/Royal_Court_Tour.webp', published: false },
    { id: 'asset-4', title: 'CDJ-3000 Macro Hands', type: 'Photo', dimensions: '3840x2160 (16:9)', size: '2.1 MB', codec: 'WebP High-Q', r2Key: 'Gallery/CDJ_Hands_Macro.webp', published: true },
    { id: 'asset-5', title: 'Press Shot 2026 // Studio Red', type: 'Photo', dimensions: '3000x3000 (1:1)', size: '4.5 MB', codec: 'WebP 300dpi', r2Key: 'EPK/Henry_IX_Press_01_300dpi.webp', published: true },
  ]);

  const selectedAsset = vaultAssets.find((a) => a.id === selectedAssetId) || vaultAssets[0];

  const handleTogglePublishAsset = (id: string) => {
    setVaultAssets((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextPub = !a.published;
          addToast({
            title: nextPub ? 'ASSET PUBLISHED' : 'ASSET UNPUBLISHED',
            message: nextPub
              ? `${a.title} now live on henryix.com (Edge revalidated).`
              : `${a.title} removed from public site (<5s cache purge).`,
            type: nextPub ? 'success' : 'warning',
          });
          return { ...a, published: nextPub };
        }
        return a;
      })
    );
  };

  const [watermarkOpacity, setWatermarkOpacity] = useState(60);
  const [watermarkPos, setWatermarkPos] = useState<'bottom-right' | 'center' | 'top-right'>('bottom-right');
  const [isSyncingR2, setIsSyncingR2] = useState(false);
  const [lastR2Sync, setLastR2Sync] = useState('14 minutes ago');
  const [r2SyncLogs, setR2SyncLogs] = useState([
    '09:20:12 - Auto-ingest: 3 new 1080p proxies written to assets.henryix.com',
    '09:14:05 - Google Drive Webhook: Website Assets/R2 Storage Formats/ synchronized',
    '08:55:40 - Cache hit ratio: 99.98% across Cloudflare London edge nodes',
  ]);

  const handleForceR2Sync = () => {
    setIsSyncingR2(true);
    setTimeout(() => {
      setIsSyncingR2(false);
      setLastR2Sync('Just now');
      setR2SyncLogs((prev) => [`${new Date().toLocaleTimeString()} - Manual delta sync completed: 0 errors`, ...prev.slice(0, 4)]);
      addToast({
        title: 'R2 STORAGE SYNCHRONIZED',
        message: 'Mirror updated between Google Drive and Cloudflare R2.',
        type: 'success',
      });
    }, 1200);
  };

  // EPK generator options
  const [epkSlug, setEpkSlug] = useState('promoter-henryix-2026');
  const [epkItems, setEpkItems] = useState({
    bio: true,
    photos: true,
    logos: true,
    rider: true,
    mix: true,
  });

  // --- MODULE 04: GIGS STATES ---
  const [customTaxRate, setCustomTaxRate] = useState(taxRate || 20);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [guestTypeInput, setGuestTypeInput] = useState<'VIP Promoter Pass' | 'Guestlist +1' | 'Artist Guest'>('Guestlist +1');
  const [expenseAmount, setExpenseAmount] = useState('45.00');
  const [expenseCategory, setExpenseCategory] = useState<'Travel' | 'Digging' | 'Gear' | 'Production'>('Travel');
  const [expenseDesc, setExpenseDesc] = useState('TfL Overground & Night Tube fare');
  const [loggedExpenses, setLoggedExpenses] = useState([
    { id: 'exp-1', category: 'Travel', amount: 32.50, desc: 'London Underground off-peak travel card' },
    { id: 'exp-2', category: 'Digging', amount: 18.00, desc: 'Bandcamp Friday UKG dubplate release' },
  ]);

  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }, []);

  const handleAdmitGuest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!guestNameInput.trim()) return;
    admitGuest({
      code: `H9-MAN-${Math.floor(100 + Math.random() * 900)}`,
      name: guestNameInput.trim(),
      type: guestTypeInput,
      status: 'ADMITTED',
    });
    playChime();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([80, 50, 80]);
    }
    addToast({
      title: 'GUEST ADMITTED',
      message: `${guestNameInput.trim()} marked admitted at door.`,
      type: 'success',
    });
    setGuestNameInput('');
  };

  const handleLogExpense = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = parseFloat(expenseAmount);
    if (isNaN(val) || val <= 0) return;
    const newExp = {
      id: `exp-${Date.now()}`,
      category: expenseCategory,
      amount: val,
      desc: expenseDesc.trim() || 'Gig production expense',
    };
    setLoggedExpenses((prev) => [newExp, ...prev]);
    addToast({
      title: 'EXPENSE LOGGED',
      message: `£${val.toFixed(2)} (${expenseCategory}) deducted for HMRC UK tax reserve.`,
      type: 'info',
    });
  };

  // --- MODULE 05: SOCIAL STATES ---
  const [storyEventTitle, setStoryEventTitle] = useState(activeGig.title.toUpperCase());
  const [storyTracksText, setStoryTracksText] = useState(
    activeSetlist.length > 0 
      ? activeSetlist.map(s => `${s.track.artist} - ${s.track.title}`).join('\n')
      : 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]\nrude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend) - dj g2g\nDo It Diva (Don Omar x Heidi Montag) - zpectrum\nFlori Pori - Favela Funk\nMy Neck My Back - Sunshine Vendetta'
  );
  const [selectedGridIdx, setSelectedGridIdx] = useState<number | null>(null);
  const [vipAudience, setVipAudience] = useState('Inner Circle (120 Subscribers)');
  const [vipSmsText, setVipSmsText] = useState(
    'Secret Warehouse // Unit 4, Surrey Canal Rd, SE14. Doors 23:00. BYOB. Password at door: DUBPLATE8A.'
  );

  const handleStagePromo = () => {
    addInstagramPost({
      title: `${activeGig.venue} // Official Announcement`,
      date: 'In 14 Days',
      type: 'Gig Flyer',
      scheduled: true,
      image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
      caption: `Next up: ${activeGig.venue}. Underground bass & garage sets from 01:00. Link in bio.`,
    });
    addInstagramPost({
      title: `${activeGig.venue} // Mix Snippet Teaser`,
      date: 'In 7 Days',
      type: 'Video Clip',
      scheduled: true,
      image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
      caption: `Testing weapons for ${activeGig.venue} this Friday.`,
    });
    addInstagramPost({
      title: `${activeGig.venue} // Set Times & Run Sheet`,
      date: 'Day of Show',
      type: 'Artwork',
      scheduled: true,
      image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
      caption: `Set times locked. Doors 23:00 • HENRY IX 01:00 - 03:00. Arrive early.`,
    });
    addInstagramPost({
      title: `${activeGig.venue} // 4K Recap Highlights`,
      date: 'T+1 Day',
      type: 'Video Clip',
      scheduled: false,
      image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
      caption: `Energy at ${activeGig.venue} was unreal. Full set archive coming to SoundCloud.`,
    });

    addToast({
      title: '4-POST PROMO CAMPAIGN STAGED',
      message: `4 scheduled posts created for ${activeGig.venue} in Social Grid.`,
      type: 'success',
    });
  };

  const handleDownloadLockscreenDaySheet = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. OLED Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Dark card area below phone clock (starts at Y=500 to leave clock/status clear)
    ctx.fillStyle = '#09090b';
    ctx.fillRect(50, 500, 980, 1340);

    // 3. Red Accent bar
    ctx.fillStyle = '#D8163F';
    ctx.fillRect(90, 540, 10, 90);

    // 4. Header
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#D8163F';
    ctx.fillText('HENRY IX // TOUR DAY SHEET', 125, 575);

    ctx.font = 'bold 54px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(activeGig.venue.toUpperCase(), 125, 630);

    // 5. Details
    const details = [
      { label: 'DATE', val: activeGig.date },
      { label: 'EVENT', val: activeGig.title },
      { label: 'TFL DEPARTURE', val: `${activeGig.departureTime} (Home Studio)` },
      { label: 'TRANSIT ROUTE', val: activeGig.transitRoute },
      { label: 'CALL TIME', val: `${activeGig.callTime} (30m buffer)` },
      { label: 'SET TIME', val: activeGig.setTime },
      { label: 'VENUE ADDRESS', val: activeGig.address },
      { label: 'PROMOTER', val: `${activeGig.promoter} (${activeGig.promoterPhone})` },
      { label: 'GREEN ROOM WI-FI', val: activeGig.wifi },
      { label: 'GUESTLIST ALLOC', val: `${activeGig.guestlistAllocated} Slots (${admittedGuests.length} Admitted)` },
    ];

    let startY = 730;
    details.forEach((d) => {
      ctx.font = 'bold 22px monospace';
      ctx.fillStyle = '#666666';
      ctx.fillText(d.label, 125, startY);

      ctx.font = 'bold 30px monospace';
      ctx.fillStyle = d.label.includes('SET TIME') ? '#22d3ee' : d.label.includes('DEPARTURE') ? '#fbbf24' : '#FFFFFF';
      ctx.fillText(d.val, 125, startY + 36);

      startY += 100;
    });

    // 6. Verification stamp & footer
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#10b981';
    ctx.fillText('✓ HARDWARE VERIFIED • DUAL GTX USB SYNCED', 125, 1760);

    ctx.font = '20px monospace';
    ctx.fillStyle = '#444444';
    ctx.fillText('HENRY IX STUDIO // TOUR OPERATIONS 2026', 125, 1820);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `LOCKSCREEN_${activeGig.venue.replace(/\s+/g, '_')}_${activeGig.date}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addToast({
      title: 'LOCKSCREEN SAVED',
      message: 'Saved 9:16 mobile wallpaper day sheet to downloads.',
      type: 'success',
    });
  };

  const handleDownloadStoryCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark OLED background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);

    // Red accent bar
    ctx.fillStyle = '#D8163F';
    ctx.fillRect(80, 120, 8, 80);

    // Title
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('HENRY IX // LIVE SETLIST', 120, 180);

    // Event
    ctx.font = '36px monospace';
    ctx.fillStyle = '#D8163F';
    ctx.fillText(storyEventTitle.toUpperCase(), 120, 240);

    // Tracklist with dynamic line spacing to prevent off-canvas collision
    const lines = storyTracksText.split('\n').filter((l) => l.trim().length > 0);
    const maxTracks = 18;
    const displayLines = lines.slice(0, maxTracks);
    const lineSpacing = Math.min(68, Math.max(38, Math.floor(1300 / Math.max(displayLines.length, 1))));

    ctx.font = '30px monospace';
    ctx.fillStyle = '#CCCCCC';
    displayLines.forEach((line, idx) => {
      ctx.fillText(`${idx + 1}. ${line}`, 120, 360 + idx * lineSpacing);
    });

    if (lines.length > maxTracks) {
      ctx.font = 'italic 26px monospace';
      ctx.fillStyle = '#888888';
      ctx.fillText(`+ ${lines.length - maxTracks} more tracks in set...`, 120, 360 + maxTracks * lineSpacing);
    }

    // Watermark footer
    ctx.font = '24px monospace';
    ctx.fillStyle = '#666666';
    ctx.fillText('HENRY IX STUDIO // INSTAGRAM STORY CARD', 120, 1800);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `STORY_CARD_${storyEventTitle.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addToast({
      title: 'STORY CARD DOWNLOADED',
      message: 'Saved 9:16 Instagram Story graphic to downloads.',
      type: 'success',
    });
  };

  const handleDispatchVipSms = () => {
    addToast({
      title: 'VIP SMS DISPATCHED',
      message: `Secret broadcast delivered to ${vipAudience}.`,
      type: 'success',
    });
  };

  if (!isOpen) return null;

  // =========================================================================
  // --- INDIVIDUAL TAB RENDERERS ---
  // =========================================================================

  // 1. STREAM TELEMETRY
  const renderStreamTelemetry = () => (
    <div className="space-y-4 text-xs">
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">OBS BROADCAST TELEMETRY</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE ON AIR
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px] uppercase">FRAMERATE</div>
            <div className="text-emerald-400 font-bold text-sm">60.0 FPS</div>
          </div>
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px] uppercase">BITRATE</div>
            <div className="text-emerald-400 font-bold text-sm">6,240 kbps</div>
          </div>
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px] uppercase">DROPPED FRAMES</div>
            <div className="text-white font-bold text-sm">0 (0.0%)</div>
          </div>
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px] uppercase">RECORD TIME</div>
            <div className="text-white font-bold text-sm">{formatTime(streamDuration)}</div>
          </div>
        </div>

        {/* Audio VU Monitor */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>BOOTH MASTER REC OUT</span>
            <span className="text-emerald-400 font-mono">-3.2 dB (Clean)</span>
          </div>
          <div className="h-3 bg-black border border-zinc-900 rounded-sm overflow-hidden flex items-center px-1">
            <div className="h-1.5 w-[75%] bg-gradient-to-r from-emerald-500 via-yellow-500 to-[#D8163F] rounded-sm" />
          </div>
        </div>

        {/* Action Macros */}
        <div className="pt-2 border-t border-zinc-900 flex flex-wrap gap-2">
          <button
            onClick={handleAddClip}
            className="flex-1 min-w-[120px] py-1.5 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles size={12} />
            <span>Mark 60s Clip</span>
          </button>
          <button
            onClick={() => {
              addToast({
                title: 'STANDBY SCENE ENGAGED',
                message: 'Auto-switched OBS to 5-minute countdown intermission.',
                type: 'warning',
              });
            }}
            className="flex-1 min-w-[120px] py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-bold transition-colors"
          >
            ☕ Standby Break
          </button>
        </div>
      </div>
    </div>
  );

  // 2. LIVE CHAT
  const renderLiveChat = () => (
    <div className="flex flex-col h-full justify-between space-y-3 text-xs">
      {/* Flame Meter Header */}
      <div className="p-2.5 bg-black border border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-orange-500 animate-pulse" />
          <span className="font-bold text-white text-[11px]">CHAT VELOCITY: 34 msgs/min</span>
        </div>
        <div className="flex items-center gap-1">
          {(['All', 'Twitch', 'YouTube'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setChatFilter(filter)}
              className={`px-1.5 py-0.5 rounded text-[9px] transition-colors ${
                chatFilter === filter ? 'bg-[#D8163F] text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[140px]">
        {liveChatMessages
          .filter((m) => chatFilter === 'All' || m.platform === chatFilter)
          .map((msg) => (
            <div key={msg.id} className="p-2 bg-zinc-950 border border-zinc-900 rounded space-y-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1 py-0.2 rounded text-[9px] font-bold ${
                    msg.platform === 'Twitch' ? 'bg-purple-950 text-purple-400' : 'bg-red-950 text-red-400'
                  }`}>
                    {msg.platform}
                  </span>
                  <span className="font-bold text-white">{msg.user}</span>
                  {msg.badge && (
                    <span className="text-[9px] px-1 bg-yellow-950 border border-yellow-600 text-yellow-400">
                      {msg.badge}
                    </span>
                  )}
                </div>
                <span className="text-zinc-600 font-mono text-[9px]">{msg.time}</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">{msg.text}</p>
            </div>
          ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendLiveChat} className="flex gap-2 pt-2 border-t border-zinc-900 flex-shrink-0">
        <input
          type="text"
          placeholder="Broadcast chat as HENRY IX..."
          value={liveChatInput}
          onChange={(e) => setLiveChatInput(e.target.value)}
          className="flex-1 bg-black border border-zinc-800 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D8163F]"
        />
        <button
          type="submit"
          className="px-3 py-1.5 bg-[#D8163F] text-black font-bold hover:bg-white transition-colors flex items-center gap-1"
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );

  // 3. AI COPILOT
  const renderCopilot = () => (
    <div className="flex flex-col h-full justify-between space-y-4 text-xs">
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`space-y-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2.5 rounded-sm text-xs leading-relaxed max-w-[95%] ${
              msg.sender === 'user' 
                ? 'bg-[#D8163F]/20 border border-[#D8163F]/50 text-white' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
            }`}>
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1">
                {msg.sender === 'user' ? 'HENRY IX (OWNER)' : 'STUDIO COPILOT'}
              </div>
              {msg.text}
            </div>

            {/* Interactive Action Staging Card */}
            {msg.actionCard && (
              <div className="p-3 border border-[#D8163F]/40 bg-zinc-950 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] text-[#D8163F] font-bold tracking-wider">
                  <span>{msg.actionCard.title}</span>
                  {msg.actionCard.applied ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} />
                      APPLIED
                    </span>
                  ) : (
                    <span className="text-zinc-500">STAGED DIFF</span>
                  )}
                </div>
                <div className="text-[11px] space-y-1">
                  <div className="text-red-400 line-through truncate font-mono text-[10px]">{msg.actionCard.before}</div>
                  <div className="text-emerald-400 font-bold truncate font-mono text-[10px]">{msg.actionCard.after}</div>
                </div>
                <button
                  onClick={() => handleApplyActionCard(msg.actionCard, idx)}
                  disabled={msg.actionCard.applied}
                  className={`w-full py-1.5 text-xs font-bold uppercase transition-colors ${
                    msg.actionCard.applied 
                      ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                      : 'bg-[#D8163F] text-black hover:bg-white hover:text-black'
                  }`}
                >
                  {msg.actionCard.applied ? '✓ MUTATION COMMITTED' : 'COMMIT ACTION CARD'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendCopilot} className="border-t border-zinc-900 pt-2 flex gap-2 flex-shrink-0">
        <input 
          type="text"
          placeholder="Ask Copilot (e.g. 'Clean metadata', 'Verify gig call-time')..."
          value={copilotInput}
          onChange={(e) => setCopilotInput(e.target.value)}
          className="flex-1 bg-black border border-zinc-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D8163F]"
        />
        <button 
          type="submit"
          className="px-3 py-2 bg-[#D8163F] text-black font-bold hover:bg-white transition-colors"
        >
          <CornerDownLeft size={14} />
        </button>
      </form>
    </div>
  );

  // 4. STREAM CLIPS & EDL
  const renderStreamClips = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">LIVESTREAM CLIP MARKERS &amp; EDL</h4>
        <span className="text-[#D8163F] font-mono text-[10px]">{highlightClips.length} CLIPS</span>
      </div>

      {/* Quick Marker Composer */}
      <div className="p-2.5 border border-zinc-800 bg-black space-y-2">
        <span className="text-[10px] text-zinc-400 font-bold uppercase">⚡ MARK CLIP AT CURRENT TIME ({formatTime(streamDuration)})</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={newClipNote}
            onChange={(e) => setNewClipNote(e.target.value)}
            placeholder="Clip note..."
            className="flex-1 bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-white focus:outline-none focus:border-[#D8163F]"
          />
          <button
            onClick={handleAddClip}
            className="px-3 py-1 bg-[#D8163F] text-black font-bold text-xs hover:bg-white transition-colors"
          >
            Mark
          </button>
        </div>
      </div>

      {/* Clip List */}
      <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
        {highlightClips.map((clip) => (
          <div key={clip.id} className="p-2 border border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#D8163F] text-[10px]">{clip.time}</span>
                <span className="font-bold text-white text-[11px] truncate">{clip.title}</span>
              </div>
              <div className="text-[9px] text-zinc-500 mt-0.5">
                Energy: {clip.energy}/10 • <span className="text-emerald-400">{clip.status}</span>
              </div>
            </div>
            <button
              onClick={() => {
                addToast({ title: 'CLIP STAGED', message: `Pushed ${clip.title} to Assets dropzone for Reels export.`, type: 'info' });
              }}
              className="p-1 text-zinc-400 hover:text-white"
              title="Push to Dropzone"
            >
              <Share2 size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* EDL Export Button */}
      <button
        onClick={handleExportEDL}
        className="w-full py-2 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
      >
        <Download size={12} />
        <span>Export EDL Marker Track (.edl)</span>
      </button>
    </div>
  );

  // 5. DJ UTILITY
  const renderDJUtility = () => (
    <div className="space-y-4 text-xs">
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">ACTIVE LIVE DECK TRACK</h4>
          <span className="text-[10px] px-1.5 py-0.5 bg-black border border-zinc-800 text-cyan-400 font-mono">
            DECK 1
          </span>
        </div>
        <div className="text-sm font-bold text-white">{currentTrack.title}</div>
        <div className="text-zinc-400 text-[11px]">
          {currentTrack.artist} • {currentTrack.bpm.toFixed(1)} BPM • <span className="text-[#22d3ee] font-bold">{currentTrack.key}</span>
          {pitchSemitones !== 0 && (
            <span className="text-amber-400 font-bold ml-1.5">
              ➔ {shiftedCamelotKey} ({pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones}st)
            </span>
          )}
        </div>
      </div>

      {/* Waveform Scrubber */}
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-zinc-500 uppercase tracking-widest font-bold">3-BAND WAVEFORM &amp; SCRUBBER</span>
          <span className="text-zinc-400 font-mono">
            {Math.floor(scrubPosition / 60)}:{(Math.floor(scrubPosition) % 60).toString().padStart(2, '0')} / {Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <div 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newPos = pct * currentTrack.duration;
            setScrubPosition(newPos);
            addToast({
              title: 'CUE SCRUB',
              message: `Jumped to ${Math.floor(newPos / 60)}:${(Math.floor(newPos) % 60).toString().padStart(2, '0')}.`,
              type: 'info',
            });
          }}
          className="h-12 bg-black border border-zinc-800 rounded relative cursor-pointer group overflow-hidden flex items-center px-1"
          title="Click to seek playhead"
        >
          <div className="w-full h-8 flex items-center justify-between gap-0.5 opacity-80">
            {Array.from({ length: 48 }).map((_, i) => {
              const h = 25 + Math.sin(i * 0.4) * 20 + Math.cos(i * 0.8) * 15;
              const color = i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#10b981' : '#ef4444';
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${Math.max(15, h)}%`,
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </div>

          <div 
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] z-10 transition-all"
            style={{ left: `${(scrubPosition / currentTrack.duration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={togglePlay}
            className={`px-3 py-1.5 rounded font-bold text-xs flex items-center gap-1.5 transition-colors ${
              isPlaying 
                ? 'bg-emerald-500 text-black hover:bg-white' 
                : 'bg-[#D8163F] text-white hover:bg-white hover:text-black'
            }`}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
            <span>{isPlaying ? 'PAUSE DECK' : 'PLAY DECK'}</span>
          </button>

          <span className="text-[10px] text-zinc-500 font-mono">
            {isPlaying ? 'TRANSPORT: ACTIVE' : 'TRANSPORT: STOPPED'}
          </span>
        </div>
      </div>

      {/* Real-Time Pitch Shifter */}
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">REAL-TIME PITCH SHIFTER</h4>
          <span className="font-mono text-[#D8163F] font-bold">
            {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} SEMITONES
            {pitchSemitones !== 0 && (
              <span className="text-amber-400 ml-1.5">({shiftedCamelotKey})</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 gap-1">
          {[-2, -1, 0, 1, 2].map((st) => (
            <button 
              key={st}
              onClick={() => {
                setPitchSemitones(st);
                addToast({
                  title: 'KEY SHIFT APPLIED',
                  message: st === 0 ? 'Original key restored.' : `Pitch shifted by ${st > 0 ? `+${st}` : st} semitones.`,
                  type: 'info',
                });
              }}
              className={`flex-1 py-1.5 border text-xs font-mono font-bold transition-colors ${
                pitchSemitones === st 
                  ? 'bg-[#D8163F] text-black border-[#D8163F]' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              {st === 0 ? 'ORIG' : st > 0 ? `♯ +${st}` : `♭ ${st}`}
            </button>
          ))}
        </div>
      </div>

      {/* Hot Cues */}
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">CDJ-3000 PERFORMANCE CUES</h4>
        <div className="space-y-1 text-[11px]">
          {(currentTrack.cues || [
            { letter: 'A', name: 'Intro Beat', time: 0, color: '#10b981' },
            { letter: 'B', name: 'Vocal Breakdown', time: 64, color: '#06b6d4' },
            { letter: 'C', name: 'Main Bass Drop', time: 92, color: '#ef4444' },
            { letter: 'D', name: 'Secondary Hook', time: 160, color: '#eab308' },
            { letter: 'E', name: 'Double Drop Bridge', time: 224, color: '#a855f7' },
            { letter: 'F', name: 'Outro Mix-Out', time: 288, color: '#f97316' },
          ]).map((cue: any) => (
            <div 
              key={cue.letter} 
              onClick={() => {
                setScrubPosition(cue.time);
                addToast({
                  title: `CUE ${cue.letter} TRIGGERED`,
                  message: `Jumped to ${cue.name} (${Math.floor(cue.time / 60)}:${(cue.time % 60).toString().padStart(2, '0')}).`,
                  type: 'info',
                });
              }}
              className="flex justify-between p-1.5 border-l-2 bg-black hover:bg-zinc-900 cursor-pointer transition-colors" 
              style={{ borderColor: cue.color }}
            >
              <span className="font-bold">CUE {cue.letter}: {cue.name}</span>
              <span className="text-zinc-500 font-mono">{Math.floor(cue.time / 60)}:{(cue.time % 60).toString().padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 6. HARMONIC MATCH
  const renderHarmonicMatch = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
          HARMONIC MATCH RADAR ({currentTrack.key} COMPATIBLE)
        </h4>
        <span className="text-[#22d3ee] font-mono text-[10px]">{harmonicMatches.length} MATCHES</span>
      </div>
      
      <div className="space-y-2">
        {harmonicMatches.map((m, idx) => (
          <div key={idx} className="p-2.5 border border-zinc-800 bg-black hover:border-zinc-600 transition-colors flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white text-[11px] truncate">{m.track.title}</div>
              <div className="text-[10px] text-zinc-500 truncate">
                {m.track.artist} • <span className="text-[#22d3ee] font-bold">{m.track.key}</span> • {m.track.bpm.toFixed(1)} BPM
              </div>
              <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
                {m.relationship} ({m.tag})
              </div>
            </div>
            <button 
              onClick={() => {
                addToSetlist(m.track);
                addToast({
                  title: 'QUEUED TO SETLIST',
                  message: `${m.track.title} (${m.track.key}) added to active setlist.`,
                  type: 'success',
                });
              }}
              className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 hover:border-[#D8163F] text-[10px] text-zinc-200 hover:text-white font-bold whitespace-nowrap transition-colors"
            >
              + Queue
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // 7. SETLIST
  const renderSetlist = () => (
    <div className="space-y-4 text-xs">
      <div className="flex justify-between items-center">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">ACTIVE LIVE SETLIST ({activeSetlist.length})</h4>
        <span className="text-emerald-400 text-[10px] font-mono">NOTION SYNCED</span>
      </div>

      <div className="space-y-2">
        {activeSetlist.map((item, idx) => (
          <div key={idx} className="p-2.5 border border-zinc-800 bg-black flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white truncate text-[11px]">{item.pos}. {item.track.title}</div>
              <div className="text-[10px] text-zinc-500 truncate">{item.track.artist} • {item.track.key} • {item.track.bpm} BPM</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  playTrack(item.track);
                  addToast({ title: 'TRACK LOADED', message: `Loaded ${item.track.title} into persistent deck.`, type: 'info' });
                }}
                className="p-1 hover:text-[#D8163F] text-zinc-400"
                title="Play Track"
              >
                <Play size={12} />
              </button>
              <button
                onClick={() => {
                  removeFromSetlist(idx);
                  addToast({ title: 'SETLIST UPDATED', message: `Removed ${item.track.title} from setlist.`, type: 'info' });
                }}
                className="p-1 hover:text-red-500 text-zinc-600"
                title="Remove"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-zinc-900 flex gap-2">
        <button
          onClick={exportRekordboxXml}
          className="flex-1 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-bold text-zinc-200"
        >
          Export XML
        </button>
        <button
          onClick={() => {
            const text = activeSetlist.map((s) => `${s.pos}. ${s.track.artist} - ${s.track.title} [${s.track.key}]`).join('\n');
            navigator.clipboard.writeText(text);
            addToast({ title: 'SETLIST COPIED', message: 'Copied tracklist with keys and order.', type: 'success' });
          }}
          className="flex-1 py-1.5 bg-[#D8163F] text-black font-bold text-xs hover:bg-white"
        >
          Copy Text
        </button>
      </div>
    </div>
  );

  // 8. STORY DNA
  const renderStoryDNA = () => (
    <div className="space-y-4 text-xs">
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-3">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">CULTURAL TRACK DNA &amp; SET CONTEXT</h4>
        
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-black border border-zinc-800 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
            <Music size={24} className="text-[#D8163F]" />
          </div>
          <div>
            <div className="font-bold text-sm text-white">{currentTrack.title}</div>
            <div className="text-zinc-400">{currentTrack.artist}</div>
            <div className="text-[#22d3ee] text-[10px] font-mono mt-0.5">{currentTrack.key} • {currentTrack.bpm} BPM • {currentTrack.source}</div>
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-zinc-900 text-[11px]">
          <div className="flex justify-between">
            <span className="text-zinc-500">RECORD LABEL:</span>
            <span className="text-white font-bold">{currentTrack.label || 'XL Recordings // UK'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">RELEASE YEAR:</span>
            <span className="text-white">{currentTrack.year || 2021}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">ORIGIN:</span>
            <span className="text-white">London, United Kingdom</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">MIX PRESENCE:</span>
            <span className="text-amber-400 font-bold">{currentTrack.mixPresence || 'Knight Club Vol 4'}</span>
          </div>
        </div>

        <div className="p-2.5 bg-black border border-zinc-900 space-y-1.5">
          <span className="text-zinc-500 text-[10px] uppercase block font-bold">SET STORYTELLING &amp; VIBE NOTES:</span>
          <textarea
            value={vibeNoteText}
            onChange={(e) => setVibeNoteText(e.target.value)}
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 p-2 text-zinc-300 text-[11px] leading-relaxed focus:outline-none focus:border-[#D8163F]"
          />
          <button
            onClick={() => {
              addToast({ title: 'VIBE NOTES SAVED', message: 'Updated set narrative in Notion Sets database.', type: 'success' });
            }}
            className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-[10px] hover:text-white"
          >
            Save Vibe Notes
          </button>
        </div>

        <button
          onClick={() => {
            const lore = `${currentTrack.title} by ${currentTrack.artist} [${currentTrack.label || 'XL Recordings'}] — ${currentTrack.key} • ${currentTrack.bpm} BPM. ${vibeNoteText}`;
            navigator.clipboard.writeText(lore);
            addToast({ title: 'TRACK DNA COPIED', message: 'Lore text copied for social caption or show notes.', type: 'success' });
          }}
          className="w-full py-2 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Copy size={12} />
          <span>Copy Track Story for Show Notes</span>
        </button>
      </div>
    </div>
  );

  // 9. ASSETS INFO & RESOLUTION INSPECTOR
  const renderAssets = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
          ASSET RESOLUTION &amp; METADATA INSPECTOR
        </h4>
        <span className="text-purple-400 font-mono text-[10px]">R2 MIRROR</span>
      </div>

      {/* Asset Selector */}
      <div className="p-2.5 bg-black border border-zinc-800 space-y-2">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">SELECT ACTIVE VAULT ASSET:</span>
        <select
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs text-white focus:outline-none focus:border-[#D8163F]"
        >
          {vaultAssets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} ({a.type})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Asset Metadata Card */}
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2.5">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-white text-sm">{selectedAsset.title}</div>
            <div className="text-zinc-500 text-[10px]">{selectedAsset.r2Key}</div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold uppercase">
            {selectedAsset.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-zinc-900">
          <div>
            <span className="text-zinc-500 text-[9px] block">DIMENSIONS</span>
            <span className="font-mono text-white">{selectedAsset.dimensions}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block">FILE SIZE</span>
            <span className="font-mono text-white">{selectedAsset.size}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block">CODEC / FORMAT</span>
            <span className="font-mono text-white">{selectedAsset.codec}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-[9px] block">CDN STATUS</span>
            <span className={`font-mono font-bold ${selectedAsset.published ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedAsset.published ? '✓ Live on henryix.com' : 'Vault Only'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-zinc-900 flex gap-2">
          <button
            onClick={() => handleTogglePublishAsset(selectedAsset.id)}
            className={`flex-1 py-1.5 font-bold text-xs uppercase transition-colors ${
              selectedAsset.published
                ? 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400'
                : 'bg-emerald-500 text-black hover:bg-white'
            }`}
          >
            {selectedAsset.published ? 'Unpublish (<5s Purge)' : 'Publish to Website'}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://assets.henryix.com/${selectedAsset.r2Key}`);
              addToast({ title: 'R2 URL COPIED', message: 'Copied edge CDN link to clipboard.', type: 'info' });
            }}
            className="px-3 py-1.5 bg-black border border-zinc-800 hover:border-white text-zinc-300 hover:text-white"
            title="Copy URL"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  // 10. SMART CROP & WATERMARK GUARD
  const renderCropWatermark = () => (
    <div className="space-y-4 text-xs">
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-3">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">SMART CROP GUARD // SAFE-ZONE</h4>
        
        {/* Aspect Ratio Buttons */}
        <div className="space-y-1.5">
          <span className="text-zinc-500 text-[10px] uppercase">TARGET ASPECT RATIO:</span>
          <div className="grid grid-cols-4 gap-1">
            {(['none', 'tiktok', 'reels', '4:5'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setSmartCropMode(mode);
                  addToast({ title: 'CROP MODE UPDATED', message: `Overlay set to ${mode.toUpperCase()}.`, type: 'info' });
                }}
                className={`py-1.5 border text-xs font-mono font-bold transition-colors ${
                  smartCropMode === mode
                    ? 'bg-[#D8163F] text-black border-[#D8163F]'
                    : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {mode === 'none' ? 'ORIGINAL' : mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Safe Zone HUD Wireframe */}
        <div className="p-2.5 bg-black border border-zinc-800 space-y-1.5 font-mono text-[10px]">
          <div className="p-1 border border-red-500/40 bg-red-950/20 text-red-400 flex justify-between">
            <span>▲ TOP 10% DANGER ZONE</span>
            <span>(Status Bar / Search)</span>
          </div>
          <div className="p-2 border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 flex justify-between items-center h-12">
            <span>[ 4:5 FEED SAFE BOX ]</span>
            <span className="text-[9px] text-zinc-500">DJ Hands &amp; Track ID Clear</span>
          </div>
          <div className="p-1 border border-red-500/40 bg-red-950/20 text-red-400 flex justify-between">
            <span>▼ BOTTOM 20% DANGER ZONE</span>
            <span>(Captions &amp; Audio Disc)</span>
          </div>
        </div>

        <div className="text-emerald-400 font-bold text-[10px] flex items-center gap-1.5">
          <CheckCircle2 size={12} />
          <span>[✓ SAFE] Visual focal point clear of UI occlusion.</span>
        </div>
      </div>

      {/* Promoter Preview Watermark Burn-in */}
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">PROMOTER PREVIEW WATERMARK</h4>
          <button
            onClick={() => {
              const nextState = !watermarkActive;
              setWatermarkActive(nextState);
              addToast({
                title: nextState ? 'WATERMARK ENGAGED' : 'WATERMARK DISABLED',
                message: nextState ? 'Promoter preview stamp active on exports.' : 'Clean master mode.',
                type: 'info',
              });
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              watermarkActive ? 'bg-[#D8163F] text-white' : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
            }`}
          >
            {watermarkActive ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        <div className="text-[11px] text-zinc-400">
          Stamps <strong className="text-white">&ldquo;HENRY IX // PROMOTER PREVIEW&rdquo;</strong> to safeguard unreleased dubs and set cuts before announcements.
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-900 text-[10px]">
          <span className="text-zinc-500">OPACITY: {watermarkOpacity}%</span>
          <input
            type="range"
            min={20}
            max={100}
            value={watermarkOpacity}
            onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
            className="w-32 accent-[#D8163F]"
          />
        </div>

        <div className="space-y-1 pt-1 border-t border-zinc-900 text-[10px]">
          <span className="text-zinc-500 uppercase font-bold">WATERMARK POSITION:</span>
          <div className="grid grid-cols-3 gap-1">
            {(['bottom-right', 'center', 'top-right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  setWatermarkPos(pos);
                  addToast({ title: 'WATERMARK POSITION', message: `Anchor set to ${pos.replace('-', ' ')}.`, type: 'info' });
                }}
                className={`py-1 border text-[10px] font-mono capitalize transition-colors ${
                  watermarkPos === pos
                    ? 'bg-[#D8163F] text-black border-[#D8163F] font-bold'
                    : 'bg-black border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {pos.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // 11. R2 BUCKET SYNC & EMERGENCY PURGE
  const renderR2Sync = () => (
    <div className="space-y-4 text-xs">
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">CLOUDFLARE R2 EDGE STATS</h4>
          <span className="text-emerald-400 font-mono text-[10px] font-bold">HEALTHY (0 ERRORS)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px]">STORAGE USED</div>
            <div className="text-white font-bold text-sm">4.2 GB</div>
          </div>
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px]">TOTAL OBJECTS</div>
            <div className="text-white font-bold text-sm">142 Files</div>
          </div>
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px]">EGRESS FEES</div>
            <div className="text-emerald-400 font-bold text-sm">£0.00 (0-Egress)</div>
          </div>
          <div className="p-2 bg-black border border-zinc-900 rounded">
            <div className="text-zinc-500 text-[9px]">CACHE HIT RATE</div>
            <div className="text-emerald-400 font-bold text-sm">99.98%</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-zinc-500">
          <span>Google Drive Mirror:</span>
          <span className="text-white">{lastR2Sync}</span>
        </div>

        <button
          onClick={handleForceR2Sync}
          disabled={isSyncingR2}
          className="w-full py-2 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <RotateCcw size={12} className={isSyncingR2 ? 'animate-spin text-[#D8163F]' : ''} />
          <span>{isSyncingR2 ? 'Synchronizing with R2 Mirror...' : '🔄 Force R2 Delta Sync'}</span>
        </button>
      </div>

      {/* Emergency Nuclear Purge */}
      <div className="p-3 border border-red-900/50 bg-red-950/20 space-y-2">
        <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs uppercase">
          <ShieldAlert size={14} />
          <span>Emergency Nuclear Purge (&lt;5s SLA)</span>
        </div>
        <p className="text-zinc-400 text-[10px] leading-relaxed">
          Instantly wipes global Cloudflare edge cache and triggers on-demand revalidation for all public pages.
        </p>
        <button
          onClick={triggerEmergencyPurge}
          className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase transition-colors"
        >
          🚨 Trigger Nuclear Edge Purge
        </button>
      </div>

      {/* Real-Time Sync Logs */}
      <div className="p-2.5 bg-black border border-zinc-900 space-y-1 font-mono text-[9px] text-zinc-500">
        <span className="text-zinc-400 uppercase font-bold block mb-1">R2 Activity Log:</span>
        {r2SyncLogs.map((log, i) => (
          <div key={i} className="truncate">{log}</div>
        ))}
      </div>
    </div>
  );

  // 12. EPK BUILDER
  const renderEPK = () => (
    <div className="space-y-4 text-xs">
      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-3">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">1-CLICK PRESS KIT / EPK GENERATOR</h4>
        
        {/* Included Items Checklist */}
        <div className="space-y-1 text-[11px]">
          <span className="text-zinc-500 text-[10px] uppercase font-bold">Included in Bundle:</span>
          {[
            { key: 'bio' as const, label: 'Verified Artist Biography (Short & Full)' },
            { key: 'photos' as const, label: '3x 300dpi High-Res Press Photos' },
            { key: 'logos' as const, label: 'Downloadable Vector Brand Logos (SVG/AI)' },
            { key: 'rider' as const, label: 'Pioneer CDJ-3000 Technical Rider PDF' },
            { key: 'mix' as const, label: 'Flagship SoundCloud Mix Embed' },
          ].map((item) => {
            const isChecked = epkItems[item.key];
            return (
              <div 
                key={item.key} 
                onClick={() => setEpkItems(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className="flex items-center justify-between p-1 rounded hover:bg-zinc-900 cursor-pointer text-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className={isChecked ? 'text-emerald-400' : 'text-zinc-600'} />
                  <span className={isChecked ? 'text-zinc-200' : 'text-zinc-500 line-through'}>{item.label}</span>
                </div>
                <span className={`text-[9px] font-mono ${isChecked ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {isChecked ? 'ON' : 'OFF'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Secret Promoter Link */}
        <div className="p-2.5 bg-black border border-zinc-900 space-y-1.5">
          <div className="flex justify-between items-center text-[9px] text-zinc-500 uppercase font-bold">
            <span>Secret Promoter Slug:</span>
            <button
              onClick={() => setEpkSlug(`promoter-${Math.random().toString(36).substring(2, 7)}-2026`)}
              className="text-[#D8163F] hover:text-white"
            >
              🎲 Randomize
            </button>
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={epkSlug}
              onChange={(e) => setEpkSlug(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-[#D8163F]"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://henryix.com/press/${epkSlug}`);
                addToast({ title: 'SECRET LINK COPIED', message: 'Promoter one-pager link copied.', type: 'info' });
              }}
              className="px-2 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white"
              title="Copy URL"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>

        {/* 1-Click ZIP Download */}
        <a
          href="/api/epk/zip"
          download="Henry_IX_Press_Kit_2026.zip"
          onClick={() => {
            addToast({ title: 'EPK ZIP GENERATING', message: 'Bundling hi-res press kit assets from R2.', type: 'info' });
          }}
          className="w-full py-2.5 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(216,22,63,0.3)]"
        >
          <Download size={13} />
          <span>Download Henry_IX_Press_Kit_2026.zip</span>
        </a>
      </div>
    </div>
  );

  // 13. GIG LOGISTICS
  const renderLogistics = () => {
    if (gigs.length === 0) {
      return (
        <div className="p-4 border border-zinc-800 bg-zinc-950 text-center space-y-3">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">NO GIGS IN NOTION DATABASE</div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Your Notion Bookings database currently has 0 confirmed bookings. Add a gig in Gigs Hub to automatically sync logistics, day sheets, and financial breakdowns.
          </p>
          <div className="p-2.5 bg-black border border-zinc-900 text-left text-[11px] space-y-1 text-zinc-400">
            <div>• Notion DB: <span className="text-zinc-200">Bookings &amp; Enquiries</span></div>
            <div>• Auto-generates 1-page Day Sheet (.txt)</div>
            <div>• Calculates 9:16 iPhone Lockscreen graphic</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3 text-xs">
        {/* Active Gig Selector */}
        <div className="p-2.5 bg-black border border-zinc-800 space-y-1.5">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">SELECT ACTIVE GIG:</span>
        <select
          value={activeGigId}
          onChange={(e) => setActiveGigId(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs text-white focus:outline-none focus:border-[#D8163F]"
        >
          {gigs.map((g) => (
            <option key={g.id} value={g.id}>
              {g.venue} ({g.date}) — {g.title}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2 text-[11px]">
        <div><span className="text-zinc-500">VENUE:</span> <strong className="text-white">{activeGig.venue}</strong></div>
        <div><span className="text-zinc-500">ADDRESS:</span> {activeGig.address}</div>
        <div><span className="text-zinc-500">TRANSIT:</span> {activeGig.transitRoute}</div>
        <div><span className="text-zinc-500">DEPARTURE:</span> <strong className="text-amber-400">{activeGig.departureTime}</strong> (30m buffer)</div>
        <div><span className="text-zinc-500">CALL-TIME:</span> {activeGig.callTime}</div>
        <div><span className="text-zinc-500">SET TIME:</span> <strong className="text-[#22d3ee]">{activeGig.setTime}</strong></div>
        <div className="flex justify-between items-center pt-1 border-t border-zinc-900">
          <div><span className="text-zinc-500">PROMOTER:</span> {activeGig.promoter} ({activeGig.promoterPhone})</div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeGig.promoterPhone);
              addToast({ title: 'PHONE COPIED', message: `Copied ${activeGig.promoterPhone}.`, type: 'info' });
            }}
            className="text-zinc-400 hover:text-white"
          >
            <Copy size={11} />
          </button>
        </div>
        <div className="flex justify-between items-center">
          <div><span className="text-zinc-500">WI-FI:</span> <span className="font-mono text-white">{activeGig.wifi}</span></div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeGig.wifi);
              addToast({ title: 'WI-FI COPIED', message: 'Green room password copied.', type: 'info' });
            }}
            className="text-zinc-400 hover:text-white"
          >
            <Copy size={11} />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-900 space-y-2">
        <button
          onClick={() => downloadDaySheet(activeGig.id)}
          className="w-full py-2 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <Download size={13} />
          <span>Download 1-Page Day Sheet (.txt)</span>
        </button>
        <button
          onClick={handleDownloadLockscreenDaySheet}
          className="w-full py-2 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_10px_rgba(216,22,63,0.3)]"
        >
          <Smartphone size={13} />
          <span>Save Lockscreen Wallpaper (PNG)</span>
        </button>
      </div>
    </div>
  );
  };

  // 14. DJ BAG HARDWARE CHECKLIST
  const renderChecklist = () => {
    const uncheckedCritical = bagItems.filter((i) => !i.checked && i.critical);

    return (
      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">SMART DJ BAG CHECKLIST</h4>
          <span className={`font-mono text-[10px] font-bold ${uncheckedCritical.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {bagItems.filter(i => i.checked).length} / {bagItems.length} PACKED
          </span>
        </div>

        {/* Departure Countdown Warning Banner */}
        {uncheckedCritical.length > 0 && (
          <div className="p-2.5 border border-amber-500/50 bg-amber-950/30 text-amber-300 space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
              <AlertTriangle size={13} className="text-amber-400 animate-pulse" />
              <span>DEPARTURE WARNING // {activeGig.departureTime}</span>
            </div>
            <p className="text-[10px] text-zinc-300 leading-tight">
              {uncheckedCritical.length} critical item(s) unverified (e.g. 1/4&quot; Gold Jack Adapter). Verify hardware before departure.
            </p>
          </div>
        )}

        {/* Checklist items */}
        <div className="space-y-1.5">
          {bagItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleBagItem(item.id)}
              className={`p-2 border rounded cursor-pointer transition-colors flex items-center justify-between ${
                item.checked
                  ? 'bg-black border-zinc-800 text-zinc-400 line-through'
                  : 'bg-zinc-950 border-zinc-700 text-white hover:border-[#D8163F]'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  readOnly
                  className="accent-[#D8163F] pointer-events-none"
                />
                <span className="text-[11px] font-bold">{item.name}</span>
              </div>
              {item.critical && (
                <span className="text-[9px] px-1 bg-red-950 border border-red-700 text-red-400 font-bold uppercase">
                  CRITICAL
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-900 flex gap-2">
          <button
            onClick={() => {
              bagItems.forEach((item) => {
                if (!item.checked) toggleBagItem(item.id);
              });
              addToast({ title: 'ALL HARDWARE PACKED', message: 'Smart DJ Bag verified for transit.', type: 'success' });
            }}
            className="flex-1 py-1.5 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white"
          >
            Check All
          </button>
          <button
            onClick={() => {
              bagItems.forEach((item) => {
                if (item.checked) toggleBagItem(item.id);
              });
              addToast({ title: 'CHECKLIST RESET', message: 'Reset DJ bag for new gig.', type: 'info' });
            }}
            className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold"
          >
            Reset
          </button>
        </div>
      </div>
    );
  };

  // 15. FINANCE & HMRC TAX
  const renderFinance = () => {
    if (gigs.length === 0) {
      return (
        <div className="p-4 border border-zinc-800 bg-zinc-950 text-center space-y-3">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">NO GIGS FOR HMRC FINANCIAL BREAKDOWN</div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            No active bookings found in Notion. Once a gig is logged, the HMRC DJ Invoice calculator will automatically calculate gross fees, deposit status, and {customTaxRate}% tax reserve.
          </p>
        </div>
      );
    }

    const grossFee = activeGig.fee;
    const taxDeduction = (grossFee * (customTaxRate / 100)).toFixed(2);
    const netRemittance = (grossFee * (1 - customTaxRate / 100)).toFixed(2);
    const totalLoggedExpenses = loggedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netAfterExpenses = (parseFloat(netRemittance) - totalLoggedExpenses).toFixed(2);

    return (
      <div className="space-y-4 text-xs">
        <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">HMRC DJ INVOICE CALCULATOR</h4>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">{activeGig.venue.toUpperCase()}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="p-2 bg-black border border-zinc-900 rounded">
              <div className="text-zinc-500 text-[9px]">GROSS FEE</div>
              <div className="text-white font-bold text-sm">£{grossFee.toFixed(2)}</div>
            </div>
            <div className="p-2 bg-black border border-zinc-900 rounded">
              <div className="text-zinc-500 text-[9px]">DEPOSIT STATUS</div>
              <div className={`font-bold text-sm ${activeGig.depositPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
                {activeGig.depositPaid ? 'PAID' : 'DUE ARRIVAL'}
              </div>
            </div>
            <div className="p-2 bg-black border border-zinc-900 rounded">
              <div className="text-zinc-500 text-[9px]">{customTaxRate}% TAX RESERVE</div>
              <div className="text-amber-400 font-bold text-sm">£{taxDeduction}</div>
            </div>
            <div className="p-2 bg-black border border-zinc-900 rounded">
              <div className="text-zinc-500 text-[9px]">NET REMITTANCE</div>
              <div className="text-emerald-400 font-bold text-sm">£{netRemittance}</div>
            </div>
          </div>

          {/* Tax Reserve Slider */}
          <div className="space-y-1 pt-1 border-t border-zinc-900">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>HMRC TAX RESERVE SLIDER:</span>
              <span className="font-mono text-white font-bold">{customTaxRate}%</span>
            </div>
            <input
              type="range"
              min={15}
              max={40}
              value={customTaxRate}
              onChange={(e) => setCustomTaxRate(parseInt(e.target.value))}
              className="w-full accent-[#D8163F]"
            />
          </div>

          <button
            onClick={() => downloadInvoice(activeGig.id)}
            className="w-full py-2 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Download size={12} />
            <span>Generate &amp; Download Invoice (.txt)</span>
          </button>
        </div>

        {/* Quick Expense Logger */}
        <form onSubmit={handleLogExpense} className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">LOG TOUR EXPENSE TO HMRC LEDGER:</span>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              placeholder="£ Amount"
              className="w-24 bg-black border border-zinc-800 p-1.5 text-xs text-white"
            />
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value as any)}
              className="flex-1 bg-black border border-zinc-800 p-1.5 text-xs text-white"
            >
              <option value="Travel">Travel / TfL</option>
              <option value="Digging">Digging / Music</option>
              <option value="Gear">Hardware / Audio</option>
              <option value="Production">Production</option>
            </select>
          </div>
          <input
            type="text"
            value={expenseDesc}
            onChange={(e) => setExpenseDesc(e.target.value)}
            placeholder="Expense description..."
            className="w-full bg-black border border-zinc-800 p-1.5 text-xs text-white"
          />
          <button
            type="submit"
            className="w-full py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs font-bold transition-colors"
          >
            + Log Expense to Ledger
          </button>
        </form>

        {/* Logged Expenses Ledger */}
        <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 uppercase font-bold">HMRC DEDUCTIONS LEDGER ({loggedExpenses.length}):</span>
            <span className="text-amber-400 font-mono text-[10px] font-bold">TOTAL £{totalLoggedExpenses.toFixed(2)}</span>
          </div>

          <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
            {loggedExpenses.length === 0 ? (
              <div className="text-zinc-600 text-[10px] italic py-2 text-center">No expenses logged for this gig yet.</div>
            ) : (
              loggedExpenses.map((exp) => (
                <div key={exp.id} className="p-2 bg-black border border-zinc-900 flex items-center justify-between text-[11px]">
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] px-1 py-0.5 font-bold uppercase rounded ${
                        exp.category === 'Travel' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                        exp.category === 'Digging' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                        exp.category === 'Gear' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-zinc-800 text-zinc-300'
                      }`}>
                        {exp.category}
                      </span>
                      <span className="font-mono text-amber-300 font-bold">£{exp.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-zinc-400 text-[10px] truncate mt-0.5">{exp.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLoggedExpenses(prev => prev.filter(e => e.id !== exp.id));
                      addToast({ title: 'EXPENSE REMOVED', message: `Removed £${exp.amount.toFixed(2)} from ledger.`, type: 'info' });
                    }}
                    className="text-zinc-600 hover:text-red-400 p-1 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-500">NET AFTER EXPENSES:</span>
            <span className="text-emerald-400 font-bold">£{netAfterExpenses}</span>
          </div>
        </div>
      </div>
    );
  };

  // 16. GUESTLIST & ADMISSIONS
  const renderAdmissions = () => {
    if (gigs.length === 0) {
      return (
        <div className="p-4 border border-zinc-800 bg-zinc-950 text-center space-y-3">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider">NO ACTIVE GUESTLIST SESSION</div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Guestlist admissions and sensory door check-in require a scheduled gig in Notion. Connect a booking to activate the quota meter and real-time scanner.
          </p>
        </div>
      );
    }

    const allocation = activeGig.guestlistAllocated || 6;
    const quotaPct = Math.round((admittedGuests.length / allocation) * 100);

    return (
      <div className="space-y-4 text-xs">
        <div className="p-3 border border-zinc-800 bg-zinc-950 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
              GUESTLIST &amp; DOOR ADMISSIONS ({activeGig.venue})
            </h4>
            <span className="text-emerald-400 font-mono text-[10px] font-bold">
              {admittedGuests.length} / {allocation} ADMITTED
            </span>
          </div>

          {/* Live Door Count Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>ALLOCATION QUOTA</span>
              <span className="text-white font-mono">{quotaPct}%</span>
            </div>
            <div className="h-2 bg-black border border-zinc-900 rounded-sm overflow-hidden flex items-center">
              <div 
                className="h-full bg-[#D8163F] rounded-sm transition-all"
                style={{ width: `${Math.min(100, quotaPct)}%` }}
              />
            </div>
          </div>

        {/* Quick Check-In Form */}
        <form onSubmit={handleAdmitGuest} className="space-y-2 pt-2 border-t border-zinc-900">
          <span className="text-[10px] text-zinc-500 uppercase font-bold">QUICK DOOR CHECK-IN:</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={guestNameInput}
              onChange={(e) => setGuestNameInput(e.target.value)}
              placeholder="Guest full name..."
              className="flex-1 bg-black border border-zinc-800 p-1.5 text-xs text-white focus:outline-none focus:border-[#D8163F]"
            />
            <select
              value={guestTypeInput}
              onChange={(e) => setGuestTypeInput(e.target.value as any)}
              className="bg-black border border-zinc-800 p-1.5 text-xs text-white"
            >
              <option value="Guestlist +1">Guestlist +1</option>
              <option value="VIP Promoter Pass">VIP Promoter Pass</option>
              <option value="Artist Guest">Artist Guest</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-emerald-500 text-black font-bold text-xs uppercase hover:bg-white transition-colors"
          >
            ✓ Admit Guest (Haptic &amp; Chime)
          </button>
        </form>

        {/* Admitted Guests List */}
        <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 pt-1">
          {admittedGuests.map((guest, idx) => (
            <div key={idx} className="p-1.5 bg-black border border-zinc-900 flex items-center justify-between text-[10px]">
              <div>
                <span className="font-bold text-white">{guest.name}</span>
                <span className="text-zinc-500 ml-1">({guest.type})</span>
              </div>
              <span className="text-emerald-400 font-mono">{guest.time}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            const list = admittedGuests.map((g) => `${g.time} - ${g.name} [${g.type}]`).join('\n');
            navigator.clipboard.writeText(list);
            addToast({ title: 'DOOR LIST COPIED', message: 'Copied admitted list for promoter check.', type: 'success' });
          }}
          className="w-full py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-xs font-bold"
        >
          📋 Copy Door List for Promoter
        </button>
      </div>
    </div>
  );
  };

  // 17. PROMO CAMPAIGN POSTS
  const renderPromo = () => (
    <div className="space-y-3 text-xs">
      <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">1-CLICK PROMO CAMPAIGN PACK</h4>
      <p className="text-zinc-400 text-[11px] leading-relaxed">
        Confirming {activeGig.venue} automatically generates and stages a 4-post sequence into the 3x3 Social Grid.
      </p>
      <div className="p-2.5 border border-zinc-800 bg-black space-y-1.5 text-[10px] text-zinc-400 font-mono">
        <div>1. Announcement Flyer (T-14 Days)</div>
        <div>2. Mix Snippet Teaser (T-7 Days)</div>
        <div>3. Set Time Run-Sheet (Day of Show)</div>
        <div>4. 4K Recap Highlights (T+1 Day)</div>
      </div>
      <button 
        onClick={handleStagePromo}
        className="w-full py-2.5 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors shadow-[0_0_15px_rgba(216,22,63,0.4)] flex items-center justify-center gap-1.5"
      >
        <Share2 size={13} />
        <span>Stage 4 Posts to Social Grid</span>
      </button>
    </div>
  );

  // 18. 3x3 INSTAGRAM LAYOUT PREVIEW
  const renderGridPreview = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">3x3 INSTAGRAM PROFILE GRID</h4>
        <span className="text-emerald-400 font-mono text-[10px] font-bold">94% BALANCE</span>
      </div>

      {/* 3x3 Visual Grid */}
      <div className="grid grid-cols-3 gap-1.5 bg-black p-2 border border-zinc-800">
        {instagramGrid.slice(0, 9).map((post, idx) => (
          <div
            key={post.id}
            onClick={() => setSelectedGridIdx(idx)}
            className={`aspect-square border relative cursor-pointer group overflow-hidden ${
              selectedGridIdx === idx ? 'border-[#D8163F] ring-1 ring-[#D8163F]' : 'border-zinc-800 hover:border-zinc-600'
            }`}
          >
            <div className="absolute inset-0 bg-zinc-900 flex flex-col justify-between p-1.5 text-[8px] font-mono select-none">
              <span className="text-zinc-500">#{idx + 1}</span>
              <span className="font-bold text-white truncate">{post.type}</span>
              <span className="text-[7px] text-[#D8163F] truncate">{post.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reorder controls for selected tile */}
      {selectedGridIdx !== null && (
        <div className="p-2.5 border border-zinc-800 bg-zinc-950 space-y-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold text-white">Tile #{selectedGridIdx + 1}: {instagramGrid[selectedGridIdx]?.title}</span>
            <span className="text-zinc-500 font-mono">{instagramGrid[selectedGridIdx]?.type}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (selectedGridIdx > 0) {
                  reorderInstagramGrid(selectedGridIdx, selectedGridIdx - 1);
                  setSelectedGridIdx(selectedGridIdx - 1);
                }
              }}
              disabled={selectedGridIdx === 0}
              className="flex-1 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-bold disabled:opacity-30"
            >
              ▲ Move Earlier
            </button>
            <button
              onClick={() => {
                if (selectedGridIdx < instagramGrid.length - 1) {
                  reorderInstagramGrid(selectedGridIdx, selectedGridIdx + 1);
                  setSelectedGridIdx(selectedGridIdx + 1);
                }
              }}
              disabled={selectedGridIdx >= instagramGrid.length - 1}
              className="flex-1 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-bold disabled:opacity-30"
            >
              ▼ Move Later
            </button>
          </div>
        </div>
      )}

      {/* Stage New Tile Button */}
      <div className="pt-2 border-t border-zinc-900">
        <button
          onClick={() => {
            const sampleTypes: Array<'Gig Flyer' | 'Video Clip' | 'Track Reveal' | 'Artwork'> = [
              'Gig Flyer', 'Video Clip', 'Track Reveal', 'Artwork'
            ];
            const randomType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
            const gigVenue = activeGig.venue;
            addInstagramPost({
              title: `${gigVenue.toUpperCase()} // LIVE REEL`,
              date: new Date().toISOString().split('T')[0],
              type: randomType,
              scheduled: true,
              image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
              caption: `Live from ${gigVenue}. Unreleased UKG / Speed Garage dubs incoming. Link in bio for ticket bookings. #henryix #${gigVenue.toLowerCase().replace(/\s+/g, '')}`,
            });
            addToast({
              title: 'TILE STAGED',
              message: `Staged new ${randomType} tile into 3x3 Instagram grid.`,
              type: 'success',
            });
          }}
          className="w-full py-2 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Plus size={12} />
          <span>+ Stage New Tile to Grid</span>
        </button>
      </div>
    </div>
  );

  // 19. 9:16 STORY CARD GENERATOR
  const renderStoryCard = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">9:16 STORY CARD GENERATOR</h4>
        <span className="text-[#D8163F] font-mono text-[10px]">1080x1920</span>
      </div>

      <div className="p-2.5 border border-zinc-800 bg-black space-y-2">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">EVENT TITLE:</span>
        <input
          type="text"
          value={storyEventTitle}
          onChange={(e) => setStoryEventTitle(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs text-white focus:outline-none focus:border-[#D8163F]"
        />

        <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-bold">
          <span>TRACKLIST REVEAL:</span>
          <button
            type="button"
            onClick={() => {
              if (activeSetlist && activeSetlist.length > 0) {
                const lines = activeSetlist.map((item, i) => `${i + 1}. ${item.track.artist} - ${item.track.title}`);
                setStoryTracksText(lines.join('\n'));
                addToast({
                  title: 'SETLIST SYNCED',
                  message: `Imported ${lines.length} track(s) from active setlist into story card.`,
                  type: 'success',
                });
              } else {
                addToast({
                  title: 'NO ACTIVE SETLIST',
                  message: 'Build a setlist in Music module or keep default track reveal.',
                  type: 'warning',
                });
              }
            }}
            className="text-[#D8163F] hover:text-white flex items-center gap-1 font-mono normal-case text-[9px] transition-colors"
          >
            <RotateCcw size={10} />
            <span>Sync Setlist</span>
          </button>
        </div>
        <textarea
          rows={4}
          value={storyTracksText}
          onChange={(e) => setStoryTracksText(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#D8163F]"
        />
      </div>

      <button
        onClick={handleDownloadStoryCard}
        className="w-full py-2 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5"
      >
        <Download size={12} />
        <span>Download 9:16 Story Card (PNG)</span>
      </button>
    </div>
  );

  // 20. VIP INNER CIRCLE SMS DISPATCHER
  const renderVipBroadcast = () => (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">VIP INNER CIRCLE SMS DISPATCH</h4>
        <span className="text-[#D8163F] font-mono text-[10px]">RESEND &amp; SMS</span>
      </div>

      <div className="p-2.5 border border-zinc-800 bg-black space-y-2">
        <span className="text-[10px] text-zinc-500 uppercase font-bold">TARGET AUDIENCE:</span>
        <select
          value={vipAudience}
          onChange={(e) => setVipAudience(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs text-white"
        >
          <option value="Inner Circle (120 Subscribers)">Inner Circle (120 Subscribers)</option>
          <option value="Residency VIPs (50)">Residency VIPs (50 Dancers)</option>
          <option value="Open Decks Collective">Open Decks Collective</option>
        </select>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 uppercase font-bold">
          <span>SECRET DISPATCH TEXT:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setVipSmsText(`[COORDINATES] 51.4905° N, 0.0982° W (${activeGig.venue}). Secret entrance via loading dock.`);
                addToast({ title: 'PRESET LOADED', message: 'Location coordinates preset applied.', type: 'info' });
              }}
              className="text-[9px] px-1 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              📍 Coords
            </button>
            <button
              type="button"
              onClick={() => {
                setVipSmsText(`[SET TIMES] ${activeGig.venue}: 22:00 Resident / ${activeGig.setTime} HENRY IX / 03:00 B2B Close.`);
                addToast({ title: 'PRESET LOADED', message: 'Set times preset applied.', type: 'info' });
              }}
              className="text-[9px] px-1 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              ⏰ Times
            </button>
            <button
              type="button"
              onClick={() => {
                setVipSmsText(`[DOOR PASS] Whisper 'SUB-FREQUENCY' at the ${activeGig.venue} guestlist desk for express entry.`);
                addToast({ title: 'PRESET LOADED', message: 'Door password preset applied.', type: 'info' });
              }}
              className="text-[9px] px-1 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              🔑 Pass
            </button>
          </div>
        </div>
        <textarea
          rows={3}
          value={vipSmsText}
          onChange={(e) => setVipSmsText(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 p-1.5 text-xs text-white focus:outline-none focus:border-[#D8163F]"
        />
        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>GSM CHARACTERS: {vipSmsText.length} / 160</span>
          <span>1 SMS SEGMENT</span>
        </div>
      </div>

      <button
        onClick={handleDispatchVipSms}
        className="w-full py-2 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors flex items-center justify-center gap-1.5"
      >
        <Send size={12} />
        <span>Dispatch VIP Alert Now</span>
      </button>
    </div>
  );

  // Master Switcher for any Tab
  const renderTabContent = (tabKey: RightDrawerTab) => {
    switch (tabKey) {
      case 'stream-telemetry':
        return renderStreamTelemetry();
      case 'live-chat':
        return renderLiveChat();
      case 'copilot':
        return renderCopilot();
      case 'stream-clips':
        return renderStreamClips();
      case 'dj-utility':
        return renderDJUtility();
      case 'harmonic-match':
        return renderHarmonicMatch();
      case 'setlist':
        return renderSetlist();
      case 'story-dna':
        return renderStoryDNA();
      case 'assets':
        return renderAssets();
      case 'crop-watermark':
        return renderCropWatermark();
      case 'r2-sync':
        return renderR2Sync();
      case 'epk':
        return renderEPK();
      case 'logistics':
        return renderLogistics();
      case 'checklist':
        return renderChecklist();
      case 'finance':
        return renderFinance();
      case 'admissions':
        return renderAdmissions();
      case 'promo':
        return renderPromo();
      case 'grid-preview':
        return renderGridPreview();
      case 'story-card':
        return renderStoryCard();
      case 'vip-broadcast':
        return renderVipBroadcast();
      default:
        return renderCopilot();
    }
  };

  return (
    <div 
      className="flex flex-col h-full bg-zinc-950 border-l border-zinc-900 font-mono text-white select-none z-20 relative overflow-hidden"
      style={{ width }}
    >
      {/* 1. TOP HEADER & MULTI-PANE ACTIONS */}
      <div className="h-12 border-b border-zinc-900 px-3 flex items-center justify-between bg-black flex-shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={15} className="text-[#D8163F]" />
          <span className="font-avathe text-xs tracking-wider text-zinc-200 uppercase">
            {moduleCategory} // TOOLKIT
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Quick Copilot Jump Button */}
          <button 
            onClick={() => {
              if (splitPane) {
                setSplitBottomTab('copilot');
              } else {
                setActiveTab('copilot');
              }
              addToast({ title: 'COPILOT ENGAGED', message: 'Ready to assist in current workspace.', type: 'info' });
            }}
            className="p-1.5 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
            title="Open AI Copilot"
          >
            <Bot size={13} />
          </button>

          {/* Split Pane Toggle Button */}
          <button 
            onClick={() => setSplitPane(!splitPane)} 
            className={`p-1.5 rounded hover:bg-zinc-900 transition-colors ${splitPane ? 'text-[#D8163F] bg-[#D8163F]/10' : 'text-zinc-500 hover:text-white'}`}
            title={splitPane ? "Close Split View" : "Toggle Vertical Split Pane (Deck A / Deck B)"}
          >
            <Columns size={13} />
          </button>

          {/* 50-50 / Expand Toggle Button */}
          {onToggleExpand && (
            <button 
              onClick={onToggleExpand} 
              className={`p-1.5 rounded hover:bg-zinc-900 transition-colors ${isExpanded ? 'text-[#D8163F]' : 'text-zinc-500 hover:text-white'}`}
              title={isExpanded ? "Collapse to 380px" : "Expand 50-50 Half Screen"}
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}

          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="p-1.5 rounded hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
            title="Dock / Close Right Drawer (Esc)"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC MODULE-TAILORED TAB BAR (SINGLE PANE MODE) */}
      {!splitPane && (
        <div className="flex items-center border-b border-zinc-900 bg-zinc-950 px-2 py-1.5 gap-1 overflow-x-auto custom-scrollbar flex-shrink-0 text-[10px]">
          {/* Universal Copilot Chip when copilot is active outside streaming */}
          {!currentModuleTabs.some((t) => t.id === activeTab) && activeTab === 'copilot' && (
            <button
              onClick={() => setActiveTab('copilot')}
              className="px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 bg-[#D8163F] text-black font-bold shadow-[0_0_8px_rgba(216,22,63,0.4)] flex-shrink-0"
            >
              <Bot size={11} />
              <span>🤖 Copilot</span>
            </button>
          )}
          {currentModuleTabs.map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 ${
                  isTabActive 
                    ? 'bg-[#D8163F] text-black font-bold shadow-[0_0_8px_rgba(216,22,63,0.4)]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Icon size={11} />
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. MAIN WORKBENCH: FULL-HEIGHT vs VERTICAL SPLIT PANE */}
      {!splitPane ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative">
          <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
          {renderTabContent(activeTab)}
        </div>
      ) : (
        /* VERTICAL SPLIT PANE (TOP DECK A + BOTTOM DECK B) */
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          
          {/* TOP DECK A (PRIMARY CONTEXTUAL TOOL) */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-800 bg-zinc-950/60 overflow-hidden">
            <div className="h-8 px-2 bg-black border-b border-zinc-900 flex items-center justify-between flex-shrink-0 text-[10px] gap-2">
              <div className="flex items-center gap-1.5 font-bold text-zinc-300 min-w-0 flex-shrink truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D8163F] flex-shrink-0" />
                <span className="uppercase text-[9px] truncate">DECK A // {activeTab.replace('-', ' ')}</span>
              </div>

              {/* Module Tabs for Deck A */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-shrink-0">
                {currentModuleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap transition-colors ${
                      activeTab === tab.id ? 'bg-[#D8163F] text-black font-bold' : 'text-zinc-500 hover:text-white'
                    }`}
                    title={tab.label}
                  >
                    {tab.shortLabel}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {renderTabContent(activeTab)}
            </div>
          </div>

          {/* SKEUOMORPHIC SPLIT DIVIDER & DECK B SELECTOR */}
          <div className="h-7 bg-black border-y border-zinc-800 px-2 flex items-center justify-between text-[9px] text-zinc-500 font-mono tracking-wider flex-shrink-0 gap-2">
            <span className="font-bold text-zinc-400 truncate">═ DECK B ═</span>
            <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar flex-shrink-0">
              <button
                onClick={() => setSplitBottomTab('copilot')}
                className={`px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap transition-colors ${
                  splitBottomTab === 'copilot' ? 'text-black font-bold bg-[#D8163F]' : 'text-zinc-500 hover:text-white'
                }`}
              >
                🤖 Copilot
              </button>
              {currentModuleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSplitBottomTab(tab.id)}
                  className={`px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap transition-colors ${
                    splitBottomTab === tab.id ? 'text-black font-bold bg-[#D8163F]' : 'text-zinc-500 hover:text-white'
                  }`}
                  title={tab.label}
                >
                  {tab.shortLabel}
                </button>
              ))}
            </div>
          </div>

          {/* BOTTOM DECK B (SECONDARY TOOL) */}
          <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 overflow-y-auto custom-scrollbar p-3">
            {renderTabContent(splitBottomTab)}
          </div>
        </div>
      )}
    </div>
  );
}
