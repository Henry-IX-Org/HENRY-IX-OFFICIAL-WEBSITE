'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Sliders,
  Compass,
} from 'lucide-react';
import { useStudioStore, StudioTrack } from '@/store/studioStore';
import { isHarmonicMatch } from './music/types';
import MasterCollectionView from './music/MasterCollectionView';
import CrateWorkbenchView from './music/CrateWorkbenchView';
import SmartCratesView from './music/SmartCratesView';
import StreamingServicesView from './music/StreamingServicesView';
import SetPlanningWorkbenchView from './music/SetPlanningWorkbenchView';
import MusicRadarView from './music/MusicRadarView';

export interface MusicModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function MusicModule({
  activeView = 'music-all',
  onNavigate,
}: MusicModuleProps) {
  const trackCollection = useStudioStore((s) => s.trackCollection);
  const activeSetlist = useStudioStore((s) => s.activeSetlist);
  const exportRekordboxXml = useStudioStore((s) => s.exportRekordboxXml);
  const fetchRealTracks = useStudioStore((s) => s.fetchRealTracks);
  const addToast = useStudioStore((s) => s.addToast);

  useEffect(() => {
    fetchRealTracks();
  }, [fetchRealTracks]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Rekordbox' | 'Spotify' | 'SoundCloud' | 'Local'>('All');
  const [tasteProfile, setTasteProfile] = useState('Knight Club (145-155 BPM)');
  const [selectedClashTrack, setSelectedClashTrack] = useState<StudioTrack | null>(null);
  const [suggestedBridge, setSuggestedBridge] = useState<StudioTrack | null>(null);

  // Determine current mode from activeView
  const currentMode = useMemo(() => {
    switch (activeView) {
      case 'music-crate-kc4':
        return 'crate-kc4';
      case 'music-crate-rc2':
        return 'crate-rc2';
      case 'music-crate-cn1':
        return 'crate-cn1';
      case 'music-smart-crates':
        return 'smart-crates';
      case 'music-spotify':
        return 'spotify';
      case 'music-soundcloud':
        return 'soundcloud';
      case 'music-set-planning':
        return 'set-planning';
      case 'music-radar':
        return 'radar';
      case 'music-all':
      default:
        return 'all';
    }
  }, [activeView]);

  // Harmonic Math
  const lastSetTrack = activeSetlist.length > 0 ? activeSetlist[activeSetlist.length - 1].track : null;

  const handleInspectClash = (track: StudioTrack) => {
    setSelectedClashTrack(track);
    if (lastSetTrack && !isHarmonicMatch(lastSetTrack.key, track.key)) {
      const bridge = trackCollection.find(
        (t) => isHarmonicMatch(lastSetTrack.key, t.key) && isHarmonicMatch(t.key, track.key)
      );
      setSuggestedBridge(bridge || trackCollection[1]);
    } else {
      setSuggestedBridge(null);
    }
  };

  // Filtered tracks for master collection
  const filteredTracks = useMemo(() => {
    return trackCollection.filter((t) => {
      if (!t) return false;
      const title = t.title || '';
      const artist = t.artist || '';
      const key = t.key || '';
      const matchesQuery =
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        key.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = sourceFilter === 'All' || t.source === sourceFilter;
      return matchesQuery && matchesSource;
    });
  }, [trackCollection, searchQuery, sourceFilter]);

  // Crate specific tracks - dynamically mapped from collection
  const kc4Tracks = useMemo(() => {
    const valid = trackCollection.filter((t): t is StudioTrack => Boolean(t));
    const matched = valid.filter((t) => t.bpm >= 145 || (t.mixPresence && t.mixPresence.toLowerCase().includes('knight')));
    return matched.length > 0 ? matched : valid.slice(0, 6);
  }, [trackCollection]);

  const rc2Tracks = useMemo(() => {
    const valid = trackCollection.filter((t): t is StudioTrack => Boolean(t));
    const matched = valid.filter((t) => t.bpm < 140 || (t.mixPresence && t.mixPresence.toLowerCase().includes('royal')));
    return matched.length > 0 ? matched : valid.slice(2, 8);
  }, [trackCollection]);

  const cn1Tracks = useMemo(() => {
    const valid = trackCollection.filter((t): t is StudioTrack => Boolean(t));
    const matched = valid.filter(
      (t) =>
        t.genre?.toLowerCase().includes('garage') ||
        t.genre?.toLowerCase().includes('bass') ||
        (t.mixPresence && t.mixPresence.toLowerCase().includes('corner'))
    );
    return matched.length > 0 ? matched : valid.slice(4, 10);
  }, [trackCollection]);

  return (
    <div className="flex flex-col h-full bg-[#0c0d10] text-zinc-100 font-sans select-none">
      {/* Top Module Navigation Bar */}
      <div className="h-14 border-b border-white/[0.08] bg-[#14151a]/60 px-4 flex flex-wrap items-center justify-between flex-shrink-0 gap-2 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs py-1">
          <button
            onClick={() => (onNavigate ? onNavigate('music-all') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'all'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>📁 Master Collection</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-set-planning') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'set-planning'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles size={12} className="text-amber-400" />
            <span>⚡ Set Planning</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-crate-kc4') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'crate-kc4'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🎵 KC Vol 4</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-crate-rc2') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'crate-rc2'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🎵 Royal Court 2</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-crate-cn1') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'crate-cn1'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🎵 Corner N1</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-smart-crates') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'smart-crates'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Sliders size={12} />
            <span>Smart Crates</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-spotify') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'spotify'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🟢 Spotify</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-soundcloud') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'soundcloud'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🟠 SoundCloud</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-organiser') : null)}
            className="px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]"
          >
            <span>🧹 Organiser</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-radar') : null)}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'radar'
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <Compass size={12} />
            <span>Music Radar</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('music-hardware') : null)}
            className="px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]"
          >
            <span>💾 USB Hardware</span>
          </button>
        </div>

        {/* Right Tools: Taste Profile & Rekordbox XML Export */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={exportRekordboxXml}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-400 transition-colors font-medium text-xs shadow-sm"
            title="Download Pioneer Rekordbox XML playlist"
          >
            <Download size={13} />
            <span>Export XML</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px] font-mono">PROFILE:</span>
            <select
              value={tasteProfile}
              onChange={(e) => {
                setTasteProfile(e.target.value);
                addToast({
                  title: 'TASTE PROFILE APPLIED',
                  message: `Energy targets calibrated to ${e.target.value}.`,
                  type: 'info',
                });
              }}
              className="bg-[#14151a] border border-white/[0.08] text-zinc-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#E53558]"
            >
              <option value="Knight Club (145-155 BPM)">Knight Club (145-155 BPM)</option>
              <option value="Royal Court (Deep Techno)">Royal Court (Deep Techno)</option>
              <option value="Corner N1 (UKG / Breaks)">Corner N1 (UKG / Breaks)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Sub-View Dispatch */}
      {currentMode === 'all' && (
        <MasterCollectionView
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          filteredTracks={filteredTracks}
          handleInspectClash={handleInspectClash}
          selectedClashTrack={selectedClashTrack}
          lastSetTrack={lastSetTrack}
          suggestedBridge={suggestedBridge}
        />
      )}

      {(currentMode === 'crate-kc4' || currentMode === 'crate-rc2' || currentMode === 'crate-cn1') && (
        <CrateWorkbenchView
          currentMode={currentMode}
          kc4Tracks={kc4Tracks}
          rc2Tracks={rc2Tracks}
          cn1Tracks={cn1Tracks}
        />
      )}

      {currentMode === 'smart-crates' && <SmartCratesView filteredTracks={filteredTracks} />}

      {(currentMode === 'spotify' || currentMode === 'soundcloud') && (
        <StreamingServicesView mode={currentMode} filteredTracks={filteredTracks} />
      )}

      {currentMode === 'set-planning' && <SetPlanningWorkbenchView filteredTracks={filteredTracks} />}

      {currentMode === 'radar' && <MusicRadarView />}
    </div>
  );
}
