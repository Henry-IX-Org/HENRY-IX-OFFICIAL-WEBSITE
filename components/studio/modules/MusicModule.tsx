'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Play, 
  Pause, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Download, 
  Sliders, 
  Disc,
  ArrowRight,
  Compass,
  Folder,
  Radio,
  ExternalLink,
  Copy,
  Layers,
  Filter,
  RefreshCw,
  Share2,
  TrendingUp,
  Tag,
  ListPlus
} from 'lucide-react';
import ThreeBandColorWaveform from '../ThreeBandColorWaveform';
import { useStudioStore, StudioTrack } from '@/store/studioStore';

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
  const addToSetlist = useStudioStore((s) => s.addToSetlist);
  const addToQueue = useStudioStore((s) => s.addToQueue);
  const removeFromSetlist = useStudioStore((s) => s.removeFromSetlist);
  const cleanTrackTitle = useStudioStore((s) => s.cleanTrackTitle);
  const exportRekordboxXml = useStudioStore((s) => s.exportRekordboxXml);
  const playTrack = useStudioStore((s) => s.playTrack);
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const addToast = useStudioStore((s) => s.addToast);
  const fetchRealTracks = useStudioStore((s) => s.fetchRealTracks);
  const isLoadingTracks = useStudioStore((s) => s.isLoadingTracks);

  useEffect(() => {
    fetchRealTracks();
  }, [fetchRealTracks]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Rekordbox' | 'Spotify' | 'SoundCloud' | 'Local'>('All');
  const [tasteProfile, setTasteProfile] = useState('Knight Club (145-155 BPM)');
  const [selectedClashTrack, setSelectedClashTrack] = useState<StudioTrack | null>(null);
  const [suggestedBridge, setSuggestedBridge] = useState<StudioTrack | null>(null);

  // Smart Crates Active Rule Filter State
  const [smartCrateRule, setSmartCrateRule] = useState<'140-dub' | 'peak' | 'harmonic-8a'>('140-dub');

  // Radar State
  const [diggingWishlist, setDiggingWishlist] = useState<Array<{ id: string; title: string; artist: string; label: string; bpm: number; key: string; storeUrl: string; price: string }>>([
    { id: 'w-1', title: 'KEPT [MAJA + OKTE REWORK]', artist: 'MAJA', label: 'Self-Released', bpm: 150, key: '7A', storeUrl: 'https://bandcamp.com', price: 'Free DL' },
    { id: 'w-2', title: 'rude boy tokyo drift', artist: 'dj g2g', label: 'Club Edits', bpm: 150, key: '2A', storeUrl: 'https://bandcamp.com', price: '£2.50' },
    { id: 'w-3', title: 'Do It Diva', artist: 'zpectrum', label: 'Latin Bass', bpm: 145, key: '3A', storeUrl: 'https://bandcamp.com', price: '£3.00' },
    { id: 'w-4', title: 'Favela Funk', artist: 'Flori Pori', label: 'Favela Sound', bpm: 150, key: '7B', storeUrl: 'https://bandcamp.com', price: '£2.00' },
  ]);

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

  const isHarmonicMatch = (k1: string, k2: string) => {
    if (k1 === k2) return true;
    const num1 = parseInt(k1);
    const num2 = parseInt(k2);
    const letter1 = k1.slice(-1);
    const letter2 = k2.slice(-1);

    if (letter1 === letter2) {
      const diff = Math.abs(num1 - num2);
      return diff === 1 || diff === 11;
    }
    if (num1 === num2) return true;
    return false;
  };

  const handleInspectClash = (track: StudioTrack) => {
    setSelectedClashTrack(track);
    if (lastSetTrack && !isHarmonicMatch(lastSetTrack.key, track.key)) {
      const bridge = trackCollection.find(t => 
        isHarmonicMatch(lastSetTrack.key, t.key) && isHarmonicMatch(t.key, track.key)
      );
      setSuggestedBridge(bridge || trackCollection[1]);
    } else {
      setSuggestedBridge(null);
    }
  };

  // Filtered tracks for master collection
  const filteredTracks = useMemo(() => {
    return trackCollection.filter(t => {
      if (!t) return false;
      const title = t.title || '';
      const artist = t.artist || '';
      const key = t.key || '';
      const matchesQuery = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           key.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = sourceFilter === 'All' || t.source === sourceFilter;
      return matchesQuery && matchesSource;
    });
  }, [trackCollection, searchQuery, sourceFilter]);

  // Crate specific tracks - dynamically mapped from Henry's real collection
  const kc4Tracks = useMemo(() => {
    const valid = trackCollection.filter((t): t is StudioTrack => Boolean(t));
    const matched = valid.filter(t => t.bpm >= 145 || (t.mixPresence && t.mixPresence.toLowerCase().includes('knight')));
    return matched.length > 0 ? matched : valid.slice(0, 6);
  }, [trackCollection]);

  const rc2Tracks = useMemo(() => {
    const valid = trackCollection.filter((t): t is StudioTrack => Boolean(t));
    const matched = valid.filter(t => t.bpm < 140 || (t.mixPresence && t.mixPresence.toLowerCase().includes('royal')));
    return matched.length > 0 ? matched : valid.slice(2, 8);
  }, [trackCollection]);

  const cn1Tracks = useMemo(() => {
    const valid = trackCollection.filter((t): t is StudioTrack => Boolean(t));
    const matched = valid.filter(t => t.genre?.toLowerCase().includes('garage') || t.genre?.toLowerCase().includes('bass') || (t.mixPresence && t.mixPresence.toLowerCase().includes('corner')));
    return matched.length > 0 ? matched : valid.slice(4, 10);
  }, [trackCollection]);

  // Load all tracks of a crate into active setlist
  const handleLoadCrateToSetlist = (tracks: StudioTrack[], crateName: string) => {
    tracks.forEach(t => addToSetlist(t));
    addToast({
      title: `${crateName.toUpperCase()} LOADED`,
      message: `Pushed ${tracks.length} tracks from ${crateName} into active live setlist.`,
      type: 'success',
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0c0d10] text-zinc-100 font-sans select-none">
      
      {/* 1. TOP MODULE NAVIGATION BAR */}
      <div className="h-14 border-b border-white/[0.08] bg-[#14151a]/60 px-4 flex flex-wrap items-center justify-between flex-shrink-0 gap-2 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs py-1">
          <button
            onClick={() => onNavigate ? onNavigate('music-all') : null}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'all' 
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>📁 Master Collection</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-set-planning') : null}
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
            onClick={() => onNavigate ? onNavigate('music-crate-kc4') : null}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'crate-kc4' 
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🎵 KC Vol 4</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-crate-rc2') : null}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'crate-rc2' 
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🎵 Royal Court 2</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-crate-cn1') : null}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'crate-cn1' 
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🎵 Corner N1</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-smart-crates') : null}
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
            onClick={() => onNavigate ? onNavigate('music-spotify') : null}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'spotify' 
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🟢 Spotify</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-soundcloud') : null}
            className={`px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              currentMode === 'soundcloud' 
                ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]'
            }`}
          >
            <span>🟠 SoundCloud</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-organiser') : null}
            className="px-3 py-1.5 font-medium rounded-lg border transition-all flex items-center gap-1.5 bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.04]"
          >
            <span>🧹 Organiser</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-radar') : null}
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
            onClick={() => onNavigate ? onNavigate('music-hardware') : null}
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

      {/* ========================================================================= */}
      {/* 2. VIEW: MASTER COLLECTION TABLE                                          */}
      {/* ========================================================================= */}
      {currentMode === 'all' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 flex-1 max-w-md bg-[#14151a] border border-white/[0.08] px-3.5 py-2 rounded-xl focus-within:border-white/[0.2] transition-colors shadow-sm">
              <Search size={14} className="text-zinc-400" />
              <input 
                type="text"
                placeholder="Search tracks by Title, Artist, Key (8A), BPM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
              />
            </div>

            {/* Source Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {(['All', 'Rekordbox', 'Spotify', 'SoundCloud', 'Local'] as const).map(source => (
                <button
                  key={source}
                  onClick={() => setSourceFilter(source)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    sourceFilter === source 
                      ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                      : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.05]'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Master Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead className="bg-[#14151a] sticky top-0 z-10 border-b border-white/[0.08] text-zinc-400 font-medium tracking-wider text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">PLAY</th>
                  <th className="p-3 w-24">SOURCE</th>
                  <th className="p-3">TITLE</th>
                  <th className="p-3">ARTIST</th>
                  <th className="p-3 w-20">BPM</th>
                  <th className="p-3 w-20">KEY</th>
                  <th className="p-3 w-36">3-BAND WAVE</th>
                  <th className="p-3 w-32">HEAT TAG</th>
                  <th className="p-3 w-32">CLEARANCE</th>
                  <th className="p-3 w-12 text-center">+QUEUE</th>
                  <th className="p-3 w-12 text-center">+SET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredTracks.map(track => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isMinor = track.key?.endsWith('A');
                  return (
                    <tr 
                      key={track.id}
                      onClick={() => handleInspectClash(track)}
                      className={`hover:bg-white/[0.03] cursor-pointer transition-colors ${
                        isCurrent ? 'bg-[#E53558]/5 border-l-2 border-[#E53558]' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              togglePlay();
                            } else {
                              playTrack(track);
                            }
                          }}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isCurrent && isPlaying 
                              ? 'border-emerald-400 bg-emerald-950 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                              : 'border-white/[0.1] bg-white/[0.04] text-zinc-400 hover:border-white/[0.3] hover:text-white'
                          }`}
                        >
                          {isCurrent && isPlaying ? <Pause size={11} /> : <Play size={10} className="ml-0.5" />}
                        </button>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 border rounded-full font-medium ${
                          track.source === 'Rekordbox' ? 'border-blue-500/30 text-blue-400 bg-blue-950/30' :
                          track.source === 'Spotify' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30' :
                          track.source === 'SoundCloud' ? 'border-amber-500/30 text-amber-400 bg-amber-950/30' :
                          'border-white/[0.08] text-zinc-400 bg-white/[0.04]'
                        }`}>
                          {track.source}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-white flex items-center gap-1.5">
                        <span>{track.title}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            cleanTrackTitle(track.id);
                          }}
                          className="text-zinc-600 hover:text-amber-400 transition-colors"
                          title="Clean Bootleg Rip Strings (Wand)"
                        >
                          <Sparkles size={12} />
                        </button>
                      </td>
                      <td className="p-3 text-zinc-400">{track.artist}</td>
                      <td className="p-3 text-zinc-300 font-mono">{track.bpm.toFixed(1)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-mono font-medium text-[11px] border ${
                          isMinor 
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        }`}>
                          {track.key}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-28 h-3.5 bg-white/[0.06] rounded-full overflow-hidden flex items-center px-1">
                          <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-[#E53558] opacity-80" />
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                          track.heatTag === 'Peak Weapon' ? 'text-[#E53558] bg-[#E53558]/10 border-[#E53558]/30' :
                          track.heatTag === 'Secret Dub' ? 'text-purple-400 bg-purple-950/30 border-purple-500/30' :
                          'text-blue-400 bg-blue-950/30 border-blue-500/30'
                        }`}>
                          {track.heatTag}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-medium flex items-center gap-1.5 ${
                          track.clearance === 'Stream-Safe' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          {track.clearance === 'Stream-Safe' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                          {track.clearance}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToQueue(track);
                          }}
                          className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:border-cyan-500/40 hover:text-cyan-400 transition-colors"
                          title="Add to Playback Queue"
                        >
                          <ListPlus size={12} />
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToSetlist(track);
                          }}
                          className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:border-[#E53558]/50 hover:text-[#E53558] transition-colors"
                          title="Add to Active Setlist"
                        >
                          <Plus size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Harmonic Clash Radar Alert Panel */}
          {selectedClashTrack && lastSetTrack && (
            <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-3.5 flex flex-wrap items-center justify-between text-xs gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 font-medium font-mono uppercase text-[11px]">HARMONIC RADAR:</span>
                <span>
                  Transitioning from <strong className="text-cyan-400 font-mono">{lastSetTrack.title} ({lastSetTrack.key})</strong> ➔ <strong className="text-white font-mono">{selectedClashTrack.title} ({selectedClashTrack.key})</strong>:
                </span>
                {isHarmonicMatch(lastSetTrack.key, selectedClashTrack.key) ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} /> Perfect Harmonic Blend
                  </span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1">
                    <AlertTriangle size={13} /> Harmonic Clash Risk
                  </span>
                )}
              </div>

              {suggestedBridge && (
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-[11px]">Suggested Bridge Track:</span>
                  <button 
                    onClick={() => {
                      addToSetlist(suggestedBridge);
                      addToSetlist(selectedClashTrack);
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium text-xs hover:bg-amber-500/20 flex items-center gap-1.5 transition-colors"
                  >
                    <span>Insert {suggestedBridge.title} ({suggestedBridge.key})</span>
                    <ArrowRight size={10} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {/* ========================================================================= */}
      {/* 3. VIEWS: CURATED CRATES (KNIGHT CLUB 4, ROYAL COURT 2, CORNER N1)        */}
      {/* ========================================================================= */}
      {(currentMode === 'crate-kc4' || currentMode === 'crate-rc2' || currentMode === 'crate-cn1') && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
          
          {/* Crate Header Banner */}
          <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-amber-400" />
                <h3 className="font-semibold text-base text-white tracking-wide uppercase">
                  {currentMode === 'crate-kc4' && `CURATED CRATE // KNIGHT CLUB VOL 4 [${kc4Tracks.length} TRACKS]`}
                  {currentMode === 'crate-rc2' && `CURATED CRATE // ROYAL COURT 2 [${rc2Tracks.length} TRACKS]`}
                  {currentMode === 'crate-cn1' && `CURATED CRATE // CORNER N1 [${cn1Tracks.length} TRACKS]`}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-mono">
                {currentMode === 'crate-kc4' && '145-155 BPM • UKG / BREAKS / HARD GROOVE • CORSICA STUDIOS ROOM 2'}
                {currentMode === 'crate-rc2' && '134-138 BPM • DEEP HYPNOTIC TECHNO • VENUE MOT BERMONDSEY'}
                {currentMode === 'crate-cn1' && '138-142 BPM • SPEED GARAGE / 140 DUBS • CORNER NEW CROSS BASEMENT'}
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  const tList = currentMode === 'crate-kc4' ? kc4Tracks : currentMode === 'crate-rc2' ? rc2Tracks : cn1Tracks;
                  addToQueue(tList);
                }}
                className="px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/40 text-cyan-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Append all crate tracks to playback queue"
              >
                <ListPlus size={13} />
                <span>Queue All</span>
              </button>

              <button
                onClick={() => {
                  const tList = currentMode === 'crate-kc4' ? kc4Tracks : currentMode === 'crate-rc2' ? rc2Tracks : cn1Tracks;
                  handleLoadCrateToSetlist(tList, currentMode === 'crate-kc4' ? 'Knight Club 4' : currentMode === 'crate-rc2' ? 'Royal Court 2' : 'Corner N1');
                }}
                className="px-4 py-2 rounded-lg bg-[#E53558] text-white font-medium text-xs hover:bg-[#ff3b66] transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(229,53,88,0.4)]"
              >
                <Play size={12} className="fill-current" />
                <span>Load All to Setlist</span>
              </button>

              <button
                onClick={exportRekordboxXml}
                className="px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>Export XML</span>
              </button>
            </div>
          </div>

          {/* Crate Tracks Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead className="bg-[#14151a] sticky top-0 z-10 border-b border-white/[0.08] text-zinc-400 font-medium tracking-wider text-[11px] uppercase">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3 w-10 text-center">PLAY</th>
                  <th className="p-3">TITLE</th>
                  <th className="p-3">ARTIST</th>
                  <th className="p-3 w-20">BPM</th>
                  <th className="p-3 w-20">KEY</th>
                  <th className="p-3 w-32">ENERGY</th>
                  <th className="p-3">PRESENCE</th>
                  <th className="p-3 w-12 text-center">+QUEUE</th>
                  <th className="p-3 w-12 text-center">+SET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {(currentMode === 'crate-kc4' ? kc4Tracks : currentMode === 'crate-rc2' ? rc2Tracks : cn1Tracks).map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  const isMinor = track.key?.endsWith('A');
                  return (
                    <tr key={track.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="p-3 text-center text-zinc-500 font-mono text-xs">{idx + 1}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => isCurrent ? togglePlay() : playTrack(track)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isCurrent && isPlaying ? 'border-emerald-400 bg-emerald-950 text-emerald-400' : 'border-white/[0.1] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                          }`}
                        >
                          {isCurrent && isPlaying ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
                        </button>
                      </td>
                      <td className="p-3 font-medium text-white">{track.title}</td>
                      <td className="p-3 text-zinc-400">{track.artist}</td>
                      <td className="p-3 text-zinc-300 font-mono">{track.bpm.toFixed(1)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-mono font-medium text-[11px] border ${
                          isMinor 
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/20' 
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                        }`}>
                          {track.key}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-white/[0.08] rounded-full overflow-hidden flex">
                            <div className="bg-[#E53558] h-full rounded-full" style={{ width: `${(track.energy / 10) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-400 font-mono">{track.energy}/10</span>
                        </div>
                      </td>
                      <td className="p-3 text-zinc-400 text-xs">{track.mixPresence}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => addToQueue(track)}
                          className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:border-cyan-500/40 hover:text-cyan-400 transition-colors"
                          title="Add to Playback Queue"
                        >
                          <ListPlus size={12} />
                        </button>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => addToSetlist(track)}
                          className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:border-[#E53558]/50 hover:text-[#E53558] transition-colors"
                          title="Add to Setlist"
                        >
                          <Plus size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: SMART CRATES (140 BPM, PEAK WEAPONS)                             */}
      {/* ========================================================================= */}
      {currentMode === 'smart-crates' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
          <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
                  <Sliders size={18} className="text-[#E53558]" />
                  SMART CRATES // DYNAMIC RULE ENGINE
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Auto-populating virtual crates matching tempo range, Camelot harmonic paths, and energy thresholds
                </p>
              </div>

              <button
                onClick={() => addToast({ title: 'SMART CRATE SYNCED', message: 'Mirrored rules to Rekordbox XML.', type: 'success' })}
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/50 text-xs font-medium text-zinc-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} />
                <span>Sync to Rekordbox Smart Crates</span>
              </button>
            </div>

            {/* Rule Filter Tabs */}
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: '140-dub', label: 'RULE 1: 140 BPM DUBS (138 - 142 BPM)', count: '14 Tracks' },
                { id: 'peak', label: 'RULE 2: PEAK WEAPONS (ENERGY >= 8.5)', count: '28 Tracks' },
                { id: 'harmonic-8a', label: 'RULE 3: HARMONIC 8A FLOW (7A / 8A / 9A)', count: '42 Tracks' },
              ].map(rule => (
                <button
                  key={rule.id}
                  onClick={() => setSmartCrateRule(rule.id as any)}
                  className={`px-3.5 py-2 rounded-xl border text-left transition-all ${
                    smartCrateRule === rule.id 
                      ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm' 
                      : 'bg-[#1b1c22]/50 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="font-medium text-xs">{rule.label}</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{rule.count} matching</div>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Matches Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 shadow-sm">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#14151a] sticky top-0 border-b border-white/[0.08] text-zinc-400 font-medium uppercase text-[11px]">
                <tr>
                  <th className="p-3">PLAY</th>
                  <th className="p-3">MATCHING TRACK</th>
                  <th className="p-3">ARTIST</th>
                  <th className="p-3">BPM</th>
                  <th className="p-3">KEY</th>
                  <th className="p-3">SOURCE</th>
                  <th className="p-3">RULE MATCH REASON</th>
                  <th className="p-3 text-center">+SET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredTracks.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3">
                      <button 
                        onClick={() => playTrack(t)}
                        className="w-6 h-6 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center hover:border-white text-zinc-400"
                      >
                        <Play size={10} className="ml-0.5" />
                      </button>
                    </td>
                    <td className="p-3 font-medium text-white">{t.title}</td>
                    <td className="p-3 text-zinc-400">{t.artist}</td>
                    <td className="p-3 text-zinc-300 font-mono">{t.bpm.toFixed(1)}</td>
                    <td className="p-3 text-cyan-400 font-mono font-medium">{t.key}</td>
                    <td className="p-3 text-zinc-400">{t.source}</td>
                    <td className="p-3 text-emerald-400 text-xs">
                      {smartCrateRule === '140-dub' ? 'Tempo inside 138-142 BPM window' : smartCrateRule === 'peak' ? 'Energy rating 8.5+ threshold' : 'Camelot ±1 Key Match'}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => addToSetlist(t)} className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:border-[#E53558]/50 hover:text-[#E53558] transition-colors">
                        <Plus size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW: SYNCED SPOTIFY PLAYLISTS                                         */}
      {/* ========================================================================= */}
      {currentMode === 'spotify' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
          <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
                  <Radio size={18} className="text-emerald-400" />
                  SYNCED SPOTIFY PLAYLISTS // ARTIST PRO
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Live connection with Henry IX Spotify for Artists account. Bi-directional track importing and public playlist curation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>Token Active</span>
                </span>
                <button
                  onClick={() => addToast({ title: 'SPOTIFY SYNC COMPLETE', message: 'Imported 8 new saved tracks into Rekordbox pool.', type: 'success' })}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} />
                  <span>Sync New Saves</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
                <div className="font-semibold text-white">HENRY IX // SELECTS (Official)</div>
                <div className="text-zinc-500 text-[11px] font-mono">50 Tracks • 4,280 Followers</div>
                <button 
                  onClick={() => addToast({ title: 'PLAYLIST SYNCED', message: 'Updated public Spotify playlist.', type: 'info' })}
                  className="text-emerald-400 hover:underline text-[11px] font-medium block pt-1"
                >
                  + Push Setlist to Spotify
                </button>
              </div>
              <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
                <div className="font-semibold text-white">Late Night London 140</div>
                <div className="text-zinc-500 text-[11px] font-mono">38 Tracks • 1,840 Followers</div>
                <button 
                  onClick={() => addToast({ title: 'IMPORT COMPLETE', message: 'Imported 38 tracks to Crate.', type: 'info' })}
                  className="text-emerald-400 hover:underline text-[11px] font-medium block pt-1"
                >
                  + Import to Local Crate
                </button>
              </div>
              <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
                <div className="font-semibold text-white">Knight Club Heavy Rotation</div>
                <div className="text-zinc-500 text-[11px] font-mono">24 Tracks • 910 Followers</div>
                <button 
                  onClick={() => addToast({ title: 'IMPORT COMPLETE', message: 'Imported 24 tracks to Crate.', type: 'info' })}
                  className="text-emerald-400 hover:underline text-[11px] font-medium block pt-1"
                >
                  + Import to Local Crate
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 p-5 shadow-sm">
            <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">SPOTIFY IMPORT QUEUE (READY FOR REKORDBOX)</h4>
            <div className="space-y-2">
              {filteredTracks.slice(0, 4).map(t => (
                <div key={t.id} className="p-3 bg-[#1b1c22]/40 border border-white/[0.05] rounded-lg flex items-center justify-between text-xs hover:border-white/[0.1] transition-colors">
                  <div>
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">{t.artist} • <span className="font-mono text-zinc-300">{t.bpm} BPM</span> • <span className="font-mono text-cyan-400">{t.key}</span></div>
                  </div>
                  <button 
                    onClick={() => {
                      addToSetlist(t);
                      addToast({ title: 'TRACK ADDED', message: `${t.title} imported from Spotify to Setlist.`, type: 'success' });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#E53558]/50 hover:text-[#E53558] text-zinc-200 text-xs font-medium transition-colors"
                  >
                    + Import to Set
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. VIEW: SYNCED SOUNDCLOUD PLAYLISTS                                      */}
      {/* ========================================================================= */}
      {currentMode === 'soundcloud' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
          <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
                  <Radio size={18} className="text-amber-500" />
                  SOUNDCLOUD PRO // UNRELEASED DUBS & LIVE ARCHIVE
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Lossless WAV upload pipeline, private secret dubs sharing, and automated chapter marker syncing.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-400 text-xs font-mono font-medium">
                Next Pro Unlimited
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
                <div className="font-semibold text-white">Secret Dubs (Private Playlist)</div>
                <div className="text-zinc-500 text-[11px] font-mono">12 Unreleased Tracks • Secret Token Link</div>
                <button 
                  onClick={() => addToast({ title: 'LINK COPIED', message: 'Secret dubs link copied to clipboard.', type: 'info' })}
                  className="text-amber-400 hover:underline text-[11px] font-medium block pt-1"
                >
                  Copy Private Inner Circle URL
                </button>
              </div>
              <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
                <div className="font-semibold text-white">Live at Corsica Studios (Room 2)</div>
                <div className="text-zinc-500 text-[11px] font-mono">02:14:20 • 24 Chapter Markers Sync</div>
                <button 
                  onClick={() => addToast({ title: 'METADATA SYNCED', message: 'Chapter markers pushed to SoundCloud.', type: 'info' })}
                  className="text-amber-400 hover:underline text-[11px] font-medium block pt-1"
                >
                  Sync Timestamps & Tracklist
                </button>
              </div>
              <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
                <div className="font-semibold text-white">Knight Club Session 03</div>
                <div className="text-zinc-500 text-[11px] font-mono">14,200 Plays • Public DJ Mix</div>
                <button 
                  onClick={() => addToast({ title: 'STATS PULLED', message: 'Analytics updated from SoundCloud API.', type: 'info' })}
                  className="text-amber-400 hover:underline text-[11px] font-medium block pt-1"
                >
                  Refresh Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 p-5 shadow-sm">
            <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">UNRELEASED DUBS INGESTION</h4>
            <div className="space-y-2 text-xs">
              {filteredTracks.map(t => (
                <div key={t.id} className="p-3 bg-[#1b1c22]/40 border border-white/[0.05] rounded-lg flex items-center justify-between hover:border-white/[0.1] transition-colors">
                  <div>
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">{t.artist} • <span className="font-mono text-zinc-300">24-bit 48kHz WAV</span> • <span className="font-mono text-cyan-400">{t.bpm} BPM</span></div>
                  </div>
                  <button 
                    onClick={() => addToast({ title: 'MASTER DOWNLOADED', message: `Downloaded ${t.title} master audio to local library.`, type: 'success' })}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-amber-500/50 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <Download size={12} />
                    <span>Download Master</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. VIEW: SET PLANNING SPLIT WORKBENCH                                     */}
      {/* ========================================================================= */}
      {currentMode === 'set-planning' && (
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden p-6 gap-5 font-sans">
          
          {/* Left Pane: Search Pool */}
          <div className="w-full md:w-1/2 flex flex-col border border-white/[0.08] bg-[#14151a] rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="font-semibold text-xs text-white uppercase tracking-wider">AVAILABLE CRATE TRACKS</span>
              <span className="text-[11px] text-zinc-400 font-mono">{filteredTracks.length} Ready</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {filteredTracks.map(t => (
                <div key={t.id} className="p-2.5 bg-[#1b1c22]/40 border border-white/[0.04] hover:border-white/[0.1] rounded-lg flex items-center justify-between text-xs transition-colors">
                  <div>
                    <div className="font-medium text-white">{t.title}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{t.artist} • <span className="text-cyan-400 font-mono font-medium">{t.key}</span> • <span className="font-mono text-zinc-400">{t.bpm} BPM</span></div>
                  </div>
                  <button
                    onClick={() => addToSetlist(t)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#E53558]/50 hover:text-[#E53558] text-zinc-300 text-[11px] font-medium transition-colors"
                  >
                    + Add to Set
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pane: Planned Setlist Workbench */}
          <div className="w-full md:w-1/2 flex flex-col border border-white/[0.08] bg-[#14151a] rounded-xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <div>
                <span className="font-semibold text-xs text-white uppercase tracking-wider">ACTIVE LIVE SETLIST</span>
                <span className="text-[11px] text-zinc-400 font-mono ml-2">({activeSetlist.length} Tracks Planned)</span>
              </div>
              <button
                onClick={exportRekordboxXml}
                className="px-3 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 font-medium text-xs hover:bg-emerald-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>Save XML</span>
              </button>
            </div>

            {/* Set Flow Energy Profile Curve */}
            <div className="p-3 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5">
              <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                <span>SET FLOW ENERGY PROFILE</span>
                <span className="text-[#E53558] font-medium">Peak: 10.0 / 10</span>
              </div>
              <div className="h-9 flex items-end gap-1 pt-1">
                {activeSetlist.map((item, i) => (
                  <div key={i} className="flex-1 bg-white/[0.06] rounded-t overflow-hidden flex flex-col justify-end">
                    <div 
                      className="w-full bg-[#E53558] rounded-t" 
                      style={{ height: `${(item.energy / 10) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {activeSetlist.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#1b1c22]/40 border border-white/[0.04] hover:border-white/[0.1] rounded-lg flex items-center justify-between text-xs transition-colors">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[#E53558] font-bold font-mono w-5 flex-shrink-0">#{item.pos}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate">{item.track.title}</div>
                      <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                        {item.track.artist} • <span className="text-cyan-400 font-mono font-medium">{item.track.key}</span> • <span className="font-mono text-zinc-400">{item.track.bpm} BPM</span> • <span className="text-zinc-500">{item.note}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => playTrack(item.track)}
                      className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
                      title="Preview Track"
                    >
                      <Play size={12} />
                    </button>
                    <button
                      onClick={() => removeFromSetlist(idx)}
                      className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-zinc-500 hover:text-[#E53558] transition-colors"
                      title="Remove from Setlist"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. VIEW: MUSIC RADAR (ARTIST & LABEL DIGGING)                             */}
      {/* ========================================================================= */}
      {currentMode === 'radar' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
          <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
                  <Compass size={18} className="text-[#E53558]" />
                  MUSIC RADAR // ARTIST & UNDERGROUND LABEL TRACKER
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Automated scraping & tracking of Bandcamp, Beatport, and SoundCloud secret accounts for unreleased weapons
                </p>
              </div>

              <button
                onClick={() => addToast({ title: 'RADAR REFRESHED', message: 'Scanned 14 label Bandcamp pages for new releases.', type: 'success' })}
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#E53558]/50 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} />
                <span>Scan Labels Now</span>
              </button>
            </div>

            {/* Monitored Labels Bar */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-zinc-500 font-mono text-[10px] uppercase">MONITORED LABELS:</span>
              {['XL Recordings', 'Hessle Audio', 'Ilian Tape', 'PAN', 'SK_eleven', 'Time Is Now', 'Sneaker Social Club'].map(label => (
                <span key={label} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Digging Wishlist & Lookalikes Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 p-5 space-y-3 shadow-sm">
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
              <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
                DIGGING RADAR WISHLIST ({diggingWishlist.length} RELEASES IDENTIFIED)
              </h4>
              <span className="text-[11px] text-zinc-400 font-mono">1-CLICK PURCHASE ➔ LOG TO FINANCE EXPENSES</span>
            </div>

            <div className="space-y-2 text-xs">
              {diggingWishlist.map(item => (
                <div key={item.id} className="p-3.5 bg-[#1b1c22]/40 border border-white/[0.05] hover:border-white/[0.1] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
                  <div>
                    <div className="font-medium text-white text-[13px]">{item.title}</div>
                    <div className="text-zinc-400 text-xs mt-0.5">
                      {item.artist} • <span className="text-zinc-300">{item.label}</span> • <span className="text-cyan-400 font-mono font-medium">{item.key}</span> • <span className="font-mono text-zinc-400">{item.bpm} BPM</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-semibold font-mono mr-2">{item.price}</span>
                    <a
                      href={item.storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] text-zinc-200 text-xs flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <ExternalLink size={12} />
                      <span>Bandcamp</span>
                    </a>
                    <button
                      onClick={() => {
                        addToast({
                          title: 'LOGGED TO FINANCE',
                          message: `Logged ${item.price} expense for ${item.title} to UK HMRC ledger.`,
                          type: 'success',
                        });
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#E53558] text-white font-medium text-xs hover:bg-[#ff3b66] transition-all shadow-[0_0_10px_rgba(229,53,88,0.3)]"
                    >
                      + Add to Digging Expense
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
