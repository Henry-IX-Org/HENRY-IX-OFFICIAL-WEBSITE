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
  Tag
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
    <div className="flex flex-col h-full bg-black text-white font-mono select-none">
      
      {/* 1. TOP MODULE NAVIGATION BAR */}
      <div className="h-12 border-b border-zinc-900 bg-zinc-950 px-4 flex flex-wrap items-center justify-between flex-shrink-0 gap-2">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs py-1">
          <button
            onClick={() => onNavigate ? onNavigate('music-all') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'all' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span>📁 Master Collection</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-set-planning') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'set-planning' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Sparkles size={11} className="text-yellow-400" />
            <span>⚡ Set Planning</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-crate-kc4') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'crate-kc4' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span>🎵 KC Vol 4</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-crate-rc2') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'crate-rc2' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span>🎵 Royal Court 2</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-crate-cn1') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'crate-cn1' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span>🎵 Corner N1</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-smart-crates') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'smart-crates' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Sliders size={11} />
            <span>Smart Crates</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-spotify') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'spotify' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span>🟢 Spotify</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-soundcloud') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'soundcloud' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <span>🟠 SoundCloud</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-organiser') : null}
            className="px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 bg-black text-zinc-400 border-zinc-800 hover:text-white"
          >
            <span>🧹 Organiser (6 Bays)</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-radar') : null}
            className={`px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 ${
              currentMode === 'radar' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Compass size={11} />
            <span>Music Radar</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('music-hardware') : null}
            className="px-2.5 py-1 font-bold rounded-sm border transition-colors flex items-center gap-1 bg-black text-zinc-400 border-zinc-800 hover:text-white"
          >
            <span>💾 USB Redundancy</span>
          </button>
        </div>

        {/* Right Tools: Taste Profile & Rekordbox XML Export */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={exportRekordboxXml}
            className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-zinc-200 hover:text-emerald-400 transition-colors"
            title="Download Pioneer Rekordbox XML playlist"
          >
            <Download size={12} />
            <span>EXPORT REKORDBOX XML</span>
          </button>

          <div className="hidden lg:flex items-center gap-1.5">
            <span className="text-zinc-500 text-[10px]">PROFILE:</span>
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
              className="bg-black border border-zinc-800 text-zinc-300 px-2 py-1 text-xs focus:outline-none focus:border-[#D8163F]"
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-4 space-y-4">
          
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-2 flex-1 max-w-md bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-sm">
              <Search size={14} className="text-zinc-500" />
              <input 
                type="text"
                placeholder="Search tracks by Title, Artist, Key (8A), BPM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs text-white placeholder-zinc-500 focus:outline-none w-full"
              />
            </div>

            {/* Source Filter Pills */}
            <div className="flex items-center gap-1 text-xs">
              {(['All', 'Rekordbox', 'Spotify', 'SoundCloud', 'Local'] as const).map(source => (
                <button
                  key={source}
                  onClick={() => setSourceFilter(source)}
                  className={`px-2.5 py-1 rounded-sm border font-bold transition-colors ${
                    sourceFilter === source 
                      ? 'bg-zinc-800 text-white border-zinc-600' 
                      : 'bg-black text-zinc-500 border-zinc-900 hover:text-zinc-300'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Master Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-black sticky top-0 z-10 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 w-10 text-center">PLAY</th>
                  <th className="p-2.5 w-24">SOURCE</th>
                  <th className="p-2.5">TITLE</th>
                  <th className="p-2.5">ARTIST</th>
                  <th className="p-2.5 w-16">BPM</th>
                  <th className="p-2.5 w-16">KEY</th>
                  <th className="p-2.5 w-40">3-BAND WAVE</th>
                  <th className="p-2.5 w-28">HEAT TAG</th>
                  <th className="p-2.5 w-28">CLEARANCE</th>
                  <th className="p-2.5 w-12 text-center">+SET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono">
                {filteredTracks.map(track => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <tr 
                      key={track.id}
                      onClick={() => handleInspectClash(track)}
                      className={`hover:bg-zinc-900/60 cursor-pointer transition-colors ${
                        isCurrent ? 'bg-[#D8163F]/10 border-l-2 border-[#D8163F]' : ''
                      }`}
                    >
                      <td className="p-2.5 text-center">
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
                              ? 'border-emerald-400 bg-emerald-950 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]' 
                              : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-white hover:text-white'
                          }`}
                        >
                          {isCurrent && isPlaying ? <Pause size={11} /> : <Play size={10} className="ml-0.5" />}
                        </button>
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 border rounded-sm font-bold ${
                          track.source === 'Rekordbox' ? 'border-blue-900 text-blue-400 bg-blue-950/40' :
                          track.source === 'Spotify' ? 'border-emerald-900 text-emerald-400 bg-emerald-950/40' :
                          track.source === 'SoundCloud' ? 'border-amber-900 text-amber-400 bg-amber-950/40' :
                          'border-zinc-800 text-zinc-400 bg-zinc-900/40'
                        }`}>
                          {track.source}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                        <span>{track.title}</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            cleanTrackTitle(track.id);
                          }}
                          className="text-zinc-600 hover:text-yellow-400 transition-colors"
                          title="Clean Bootleg Rip Strings (Wand)"
                        >
                          <Sparkles size={12} />
                        </button>
                      </td>
                      <td className="p-2.5 text-zinc-400">{track.artist}</td>
                      <td className="p-2.5 text-zinc-300 font-mono">{track.bpm.toFixed(1)}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-black border border-zinc-800 text-[#22d3ee] font-bold text-[10px] rounded-sm">
                          {track.key}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="w-32 h-4 bg-zinc-900 rounded overflow-hidden flex items-center px-1">
                          <div className="w-full h-2 bg-gradient-to-r from-blue-500 via-emerald-500 to-[#D8163F] opacity-75" />
                        </div>
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 font-bold ${
                          track.heatTag === 'Peak Weapon' ? 'text-red-400 bg-red-950/40 border border-red-900' :
                          track.heatTag === 'Secret Dub' ? 'text-purple-400 bg-purple-950/40 border border-purple-900' :
                          'text-blue-400 bg-blue-950/40 border border-blue-900'
                        }`}>
                          {track.heatTag}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${
                          track.clearance === 'Stream-Safe' ? 'text-emerald-400' : 'text-amber-500'
                        }`}>
                          {track.clearance === 'Stream-Safe' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                          {track.clearance}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            addToSetlist(track);
                          }}
                          className="p-1 border border-zinc-800 hover:border-[#D8163F] hover:text-[#D8163F] transition-colors rounded"
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
            <div className="border border-zinc-800 bg-zinc-950 p-3 flex flex-wrap items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 font-bold uppercase">HARMONIC RADAR:</span>
                <span>
                  Transitioning from <strong className="text-[#22d3ee]">{lastSetTrack.title} ({lastSetTrack.key})</strong> ➔ <strong className="text-white">{selectedClashTrack.title} ({selectedClashTrack.key})</strong>:
                </span>
                {isHarmonicMatch(lastSetTrack.key, selectedClashTrack.key) ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} /> PERFECT HARMONIC BLEND
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle size={13} /> HARMONIC CLASH RISK
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
                    className="px-2.5 py-1 bg-zinc-900 border border-amber-600 text-amber-300 font-bold text-[10px] hover:bg-amber-600 hover:text-black flex items-center gap-1"
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-5 space-y-4">
          
          {/* Crate Header Banner */}
          <div className="border border-zinc-900 bg-zinc-950 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-yellow-400" />
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase">
                  {currentMode === 'crate-kc4' && `CURATED CRATE // KNIGHT CLUB VOL 4 [${kc4Tracks.length} TRACKS]`}
                  {currentMode === 'crate-rc2' && `CURATED CRATE // ROYAL COURT 2 [${rc2Tracks.length} TRACKS]`}
                  {currentMode === 'crate-cn1' && `CURATED CRATE // CORNER N1 [${cn1Tracks.length} TRACKS]`}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {currentMode === 'crate-kc4' && '145-155 BPM • UKG / BREAKS / HARD GROOVE • CORSICA STUDIOS ROOM 2'}
                {currentMode === 'crate-rc2' && '134-138 BPM • DEEP HYPNOTIC TECHNO • VENUE MOT BERMONDSEY'}
                {currentMode === 'crate-cn1' && '138-142 BPM • SPEED GARAGE / 140 DUBS • CORNER NEW CROSS BASEMENT'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const tList = currentMode === 'crate-kc4' ? kc4Tracks : currentMode === 'crate-rc2' ? rc2Tracks : cn1Tracks;
                  handleLoadCrateToSetlist(tList, currentMode === 'crate-kc4' ? 'Knight Club 4' : currentMode === 'crate-rc2' ? 'Royal Court 2' : 'Corner N1');
                }}
                className="px-4 py-2 bg-[#D8163F] text-black font-bold text-xs hover:bg-white transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(216,22,63,0.4)]"
              >
                <Play size={12} className="fill-current" />
                <span>LOAD ALL TO ACTIVE SETLIST</span>
              </button>

              <button
                onClick={exportRekordboxXml}
                className="px-3 py-2 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-zinc-300 hover:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>EXPORT CRATE XML</span>
              </button>
            </div>
          </div>

          {/* Crate Tracks Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead className="bg-black sticky top-0 z-10 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 w-10 text-center">#</th>
                  <th className="p-2.5 w-10 text-center">PLAY</th>
                  <th className="p-2.5">TITLE</th>
                  <th className="p-2.5">ARTIST</th>
                  <th className="p-2.5 w-20">BPM</th>
                  <th className="p-2.5 w-20">KEY</th>
                  <th className="p-2.5 w-28">ENERGY</th>
                  <th className="p-2.5 w-32">MIX PRESENCE</th>
                  <th className="p-2.5 w-16 text-center">+SET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {(currentMode === 'crate-kc4' ? kc4Tracks : currentMode === 'crate-rc2' ? rc2Tracks : cn1Tracks).map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <tr key={track.id} className="hover:bg-zinc-900/60">
                      <td className="p-2.5 text-center text-zinc-500 font-bold">{idx + 1}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => isCurrent ? togglePlay() : playTrack(track)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                            isCurrent && isPlaying ? 'border-emerald-400 bg-emerald-950 text-emerald-400' : 'border-zinc-700 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isCurrent && isPlaying ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
                        </button>
                      </td>
                      <td className="p-2.5 font-bold text-white">{track.title}</td>
                      <td className="p-2.5 text-zinc-400">{track.artist}</td>
                      <td className="p-2.5 text-zinc-300 font-mono">{track.bpm.toFixed(1)}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 bg-black border border-zinc-800 text-[#22d3ee] font-bold text-[10px]">
                          {track.key}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-2 bg-zinc-900 overflow-hidden flex">
                            <div className="bg-[#D8163F] h-full" style={{ width: `${(track.energy / 10) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-zinc-400">{track.energy}/10</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-zinc-400 text-[11px]">{track.mixPresence}</td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => addToSetlist(track)}
                          className="p-1 border border-zinc-800 hover:border-[#D8163F] hover:text-[#D8163F]"
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-5 space-y-4">
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase flex items-center gap-2">
                  <Sliders size={18} className="text-[#D8163F]" />
                  SMART CRATES // DYNAMIC RULE ENGINE
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Auto-populating virtual crates matching tempo range, Camelot harmonic paths, and energy thresholds
                </p>
              </div>

              <button
                onClick={() => addToast({ title: 'SMART CRATE SYNCED', message: 'Mirrored rules to Rekordbox XML.', type: 'success' })}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-xs font-bold text-zinc-300 hover:text-emerald-400 flex items-center gap-1.5"
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
                  className={`px-3 py-2 rounded-sm border font-bold text-left transition-colors ${
                    smartCrateRule === rule.id 
                      ? 'bg-[#D8163F] text-white border-[#D8163F]' 
                      : 'bg-black border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div>{rule.label}</div>
                  <div className="text-[10px] text-zinc-300 font-normal">{rule.count} matching</div>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Matches Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-900 bg-zinc-950">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black sticky top-0 border-b border-zinc-800 text-zinc-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">PLAY</th>
                  <th className="p-2.5">MATCHING TRACK</th>
                  <th className="p-2.5">ARTIST</th>
                  <th className="p-2.5">BPM</th>
                  <th className="p-2.5">KEY</th>
                  <th className="p-2.5">SOURCE</th>
                  <th className="p-2.5">RULE MATCH REASON</th>
                  <th className="p-2.5 text-center">+SET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredTracks.map(t => (
                  <tr key={t.id} className="hover:bg-zinc-900/60">
                    <td className="p-2.5">
                      <button 
                        onClick={() => playTrack(t)}
                        className="w-6 h-6 rounded-full border border-zinc-700 flex items-center justify-center hover:border-white text-zinc-400"
                      >
                        <Play size={10} className="ml-0.5" />
                      </button>
                    </td>
                    <td className="p-2.5 font-bold text-white">{t.title}</td>
                    <td className="p-2.5 text-zinc-400">{t.artist}</td>
                    <td className="p-2.5 text-zinc-300">{t.bpm.toFixed(1)}</td>
                    <td className="p-2.5 text-[#22d3ee] font-bold">{t.key}</td>
                    <td className="p-2.5 text-zinc-500">{t.source}</td>
                    <td className="p-2.5 text-emerald-400 text-[10px]">
                      {smartCrateRule === '140-dub' ? 'Tempo inside 138-142 BPM window' : smartCrateRule === 'peak' ? 'Energy rating 8.5+ threshold' : 'Camelot ±1 Key Match'}
                    </td>
                    <td className="p-2.5 text-center">
                      <button onClick={() => addToSetlist(t)} className="p-1 border border-zinc-800 hover:border-[#D8163F]">
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-5 space-y-4">
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase flex items-center gap-2">
                  <Radio size={18} className="text-emerald-400" />
                  SYNCED SPOTIFY PLAYLISTS // ARTIST PRO
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Live connection with Henry IX Spotify for Artists account. Bi-directional track importing and public playlist curation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-950/60 border border-emerald-500 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>TOKEN ACTIVE</span>
                </span>
                <button
                  onClick={() => addToast({ title: 'SPOTIFY SYNC COMPLETE', message: 'Imported 8 new saved tracks into Rekordbox pool.', type: 'success' })}
                  className="px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs text-zinc-300 hover:text-white flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  <span>Sync New Saves</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-black border border-zinc-800 space-y-1">
                <div className="font-bold text-white">HENRY IX // SELECTS (Official)</div>
                <div className="text-zinc-500 text-[10px]">50 Tracks • 4,280 Followers</div>
                <button 
                  onClick={() => addToast({ title: 'PLAYLIST SYNCED', message: 'Updated public Spotify playlist.', type: 'info' })}
                  className="text-emerald-400 hover:underline text-[10px] block mt-1"
                >
                  + Push Setlist to Spotify
                </button>
              </div>
              <div className="p-3 bg-black border border-zinc-800 space-y-1">
                <div className="font-bold text-white">Late Night London 140</div>
                <div className="text-zinc-500 text-[10px]">38 Tracks • 1,840 Followers</div>
                <button 
                  onClick={() => addToast({ title: 'IMPORT COMPLETE', message: 'Imported 38 tracks to Crate.', type: 'info' })}
                  className="text-emerald-400 hover:underline text-[10px] block mt-1"
                >
                  + Import to Local Crate
                </button>
              </div>
              <div className="p-3 bg-black border border-zinc-800 space-y-1">
                <div className="font-bold text-white">Knight Club Heavy Rotation</div>
                <div className="text-zinc-500 text-[10px]">24 Tracks • 910 Followers</div>
                <button 
                  onClick={() => addToast({ title: 'IMPORT COMPLETE', message: 'Imported 24 tracks to Crate.', type: 'info' })}
                  className="text-emerald-400 hover:underline text-[10px] block mt-1"
                >
                  + Import to Local Crate
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-900 bg-zinc-950 p-4">
            <h4 className="font-bold text-xs text-zinc-400 uppercase mb-3">SPOTIFY IMPORT QUEUE (READY FOR REKORDBOX)</h4>
            <div className="space-y-2">
              {filteredTracks.slice(0, 4).map(t => (
                <div key={t.id} className="p-2.5 bg-black border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-zinc-400 text-[11px]">{t.artist} • {t.bpm} BPM • {t.key}</div>
                  </div>
                  <button 
                    onClick={() => {
                      addToSetlist(t);
                      addToast({ title: 'TRACK ADDED', message: `${t.title} imported from Spotify to Setlist.`, type: 'success' });
                    }}
                    className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 hover:border-[#D8163F] text-zinc-200 text-[11px]"
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-5 space-y-4">
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase flex items-center gap-2">
                  <Radio size={18} className="text-amber-500" />
                  SOUNDCLOUD PRO // UNRELEASED DUBS & LIVE ARCHIVE
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Lossless WAV upload pipeline, private secret dubs sharing, and automated chapter marker syncing.
                </p>
              </div>

              <span className="px-2.5 py-1 bg-amber-950/60 border border-amber-500 text-amber-400 text-xs font-bold">
                NEXT PRO UNLIMITED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-black border border-zinc-800 space-y-1">
                <div className="font-bold text-white">Secret Dubs (Private Playlist)</div>
                <div className="text-zinc-500 text-[10px]">12 Unreleased Tracks • Secret Token Link</div>
                <button 
                  onClick={() => addToast({ title: 'LINK COPIED', message: 'Secret dubs link copied to clipboard.', type: 'info' })}
                  className="text-amber-400 hover:underline text-[10px] block mt-1"
                >
                  Copy Private Inner Circle URL
                </button>
              </div>
              <div className="p-3 bg-black border border-zinc-800 space-y-1">
                <div className="font-bold text-white">Live at Corsica Studios (Room 2)</div>
                <div className="text-zinc-500 text-[10px]">02:14:20 • 24 Chapter Markers Sync</div>
                <button 
                  onClick={() => addToast({ title: 'METADATA SYNCED', message: 'Chapter markers pushed to SoundCloud.', type: 'info' })}
                  className="text-amber-400 hover:underline text-[10px] block mt-1"
                >
                  Sync Timestamps & Tracklist
                </button>
              </div>
              <div className="p-3 bg-black border border-zinc-800 space-y-1">
                <div className="font-bold text-white">Knight Club Session 03</div>
                <div className="text-zinc-500 text-[10px]">14,200 Plays • Public DJ Mix</div>
                <button 
                  onClick={() => addToast({ title: 'STATS PULLED', message: 'Analytics updated from SoundCloud API.', type: 'info' })}
                  className="text-amber-400 hover:underline text-[10px] block mt-1"
                >
                  Refresh Analytics
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-900 bg-zinc-950 p-4">
            <h4 className="font-bold text-xs text-zinc-400 uppercase mb-3">UNRELEASED DUBS INGESTION</h4>
            <div className="space-y-2 text-xs">
              {filteredTracks.map(t => (
                <div key={t.id} className="p-3 bg-black border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-zinc-400 text-[11px]">{t.artist} • 24-bit 48kHz WAV • {t.bpm} BPM</div>
                  </div>
                  <button 
                    onClick={() => addToast({ title: 'MASTER DOWNLOADED', message: `Downloaded ${t.title} master audio to local library.`, type: 'success' })}
                    className="px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-200 text-xs flex items-center gap-1.5"
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
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden p-4 gap-4">
          
          {/* Left Pane: Search Pool */}
          <div className="w-full md:w-1/2 flex flex-col border border-zinc-900 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="font-bold text-xs text-white uppercase">AVAILABLE CRATE TRACKS</span>
              <span className="text-[10px] text-zinc-500">{filteredTracks.length} Ready</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5">
              {filteredTracks.map(t => (
                <div key={t.id} className="p-2 bg-black border border-zinc-900 hover:border-zinc-700 flex items-center justify-between text-xs transition-colors">
                  <div>
                    <div className="font-bold text-white">{t.title}</div>
                    <div className="text-[10px] text-zinc-500">{t.artist} • <span className="text-[#22d3ee] font-bold">{t.key}</span> • {t.bpm} BPM</div>
                  </div>
                  <button
                    onClick={() => addToSetlist(t)}
                    className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-[#D8163F] hover:text-[#D8163F] text-[11px] font-bold"
                  >
                    + Add to Set
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pane: Planned Setlist Workbench */}
          <div className="w-full md:w-1/2 flex flex-col border border-zinc-900 bg-zinc-950 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div>
                <span className="font-bold text-xs text-white uppercase">ACTIVE LIVE SETLIST</span>
                <span className="text-[10px] text-zinc-500 ml-2">({activeSetlist.length} Tracks Planned)</span>
              </div>
              <button
                onClick={exportRekordboxXml}
                className="px-2.5 py-1 bg-emerald-950 border border-emerald-600 text-emerald-400 font-bold text-[10px] hover:bg-emerald-600 hover:text-black flex items-center gap-1"
              >
                <Download size={11} />
                <span>SAVE XML</span>
              </button>
            </div>

            {/* Set Flow Energy Profile Curve */}
            <div className="p-2.5 bg-black border border-zinc-900 space-y-1">
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>SET FLOW ENERGY PROFILE</span>
                <span className="text-[#D8163F]">Peak: 10.0 / 10</span>
              </div>
              <div className="h-8 flex items-end gap-1 pt-1">
                {activeSetlist.map((item, i) => (
                  <div key={i} className="flex-1 bg-zinc-900 rounded-t overflow-hidden flex flex-col justify-end">
                    <div 
                      className="w-full bg-[#D8163F]" 
                      style={{ height: `${(item.energy / 10) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
              {activeSetlist.map((item, idx) => (
                <div key={idx} className="p-3 bg-black border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-[#D8163F] font-bold w-4">#{item.pos}</span>
                    <div>
                      <div className="font-bold text-white">{item.track.title}</div>
                      <div className="text-[10px] text-zinc-400">
                        {item.track.artist} • <span className="text-[#22d3ee]">{item.track.key}</span> • {item.track.bpm} BPM • <span className="text-zinc-500">{item.note}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playTrack(item.track)}
                      className="p-1 text-zinc-400 hover:text-white"
                      title="Preview Track"
                    >
                      <Play size={12} />
                    </button>
                    <button
                      onClick={() => removeFromSetlist(idx)}
                      className="p-1 text-zinc-600 hover:text-red-500"
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-5 space-y-4">
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase flex items-center gap-2">
                  <Compass size={18} className="text-[#D8163F]" />
                  MUSIC RADAR // ARTIST & UNDERGROUND LABEL TRACKER
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Automated scraping & tracking of Bandcamp, Beatport, and SoundCloud secret accounts for unreleased weapons
                </p>
              </div>

              <button
                onClick={() => addToast({ title: 'RADAR REFRESHED', message: 'Scanned 14 label Bandcamp pages for new releases.', type: 'success' })}
                className="px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-[#D8163F] text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw size={12} />
                <span>Scan Labels Now</span>
              </button>
            </div>

            {/* Monitored Labels Bar */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-500 font-bold text-[10px]">MONITORED LABELS:</span>
              {['XL Recordings', 'Hessle Audio', 'Ilian Tape', 'PAN', 'SK_eleven', 'Time Is Now', 'Sneaker Social Club'].map(label => (
                <span key={label} className="px-2 py-0.5 bg-black border border-zinc-800 text-zinc-300 text-[10px]">
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Digging Wishlist & Lookalikes Table */}
          <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-900 bg-zinc-950 p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <h4 className="font-bold text-xs text-white uppercase">
                DIGGING RADAR WISHLIST ({diggingWishlist.length} RELEASES IDENTIFIED)
              </h4>
              <span className="text-[10px] text-zinc-500">1-CLICK PURCHASE ➔ LOG TO FINANCE EXPENSES</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {diggingWishlist.map(item => (
                <div key={item.id} className="p-3 bg-black border border-zinc-800 hover:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-white text-[13px]">{item.title}</div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">
                      {item.artist} • <span className="text-zinc-300">{item.label}</span> • <span className="text-[#22d3ee]">{item.key}</span> • {item.bpm} BPM
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold mr-2">{item.price}</span>
                    <a
                      href={item.storeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs flex items-center gap-1.5 transition-colors"
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
                      className="px-3 py-1.5 bg-[#D8163F] text-black font-bold text-xs hover:bg-white transition-colors"
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
