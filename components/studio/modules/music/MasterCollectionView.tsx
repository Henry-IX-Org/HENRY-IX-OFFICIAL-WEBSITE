'use client';

import React from 'react';
import {
  Search,
  Sparkles,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  ListPlus,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useStudioStore, StudioTrack } from '@/store/studioStore';
import { isHarmonicMatch } from './types';

interface MasterCollectionViewProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sourceFilter: 'All' | 'Rekordbox' | 'Spotify' | 'SoundCloud' | 'Local';
  setSourceFilter: (s: 'All' | 'Rekordbox' | 'Spotify' | 'SoundCloud' | 'Local') => void;
  filteredTracks: StudioTrack[];
  handleInspectClash: (t: StudioTrack) => void;
  selectedClashTrack: StudioTrack | null;
  lastSetTrack: StudioTrack | null;
  suggestedBridge: StudioTrack | null;
}

export default function MasterCollectionView({
  searchQuery,
  setSearchQuery,
  sourceFilter,
  setSourceFilter,
  filteredTracks,
  handleInspectClash,
  selectedClashTrack,
  lastSetTrack,
  suggestedBridge,
}: MasterCollectionViewProps) {
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const playTrack = useStudioStore((s) => s.playTrack);
  const cleanTrackTitle = useStudioStore((s) => s.cleanTrackTitle);
  const addToQueue = useStudioStore((s) => s.addToQueue);
  const addToSetlist = useStudioStore((s) => s.addToSetlist);

  return (
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
          {(['All', 'Rekordbox', 'Spotify', 'SoundCloud', 'Local'] as const).map((source) => (
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
            {filteredTracks.map((track) => {
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
                    <span
                      className={`text-[10px] px-2 py-0.5 border rounded-full font-medium ${
                        track.source === 'Rekordbox'
                          ? 'border-blue-500/30 text-blue-400 bg-blue-950/30'
                          : track.source === 'Spotify'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30'
                          : track.source === 'SoundCloud'
                          ? 'border-amber-500/30 text-amber-400 bg-amber-950/30'
                          : 'border-white/[0.08] text-zinc-400 bg-white/[0.04]'
                      }`}
                    >
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
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono font-medium text-[11px] border ${
                        isMinor
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}
                    >
                      {track.key}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="w-28 h-3.5 bg-white/[0.06] rounded-full overflow-hidden flex items-center px-1">
                      <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-[#E53558] opacity-80" />
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                        track.heatTag === 'Peak Weapon'
                          ? 'text-[#E53558] bg-[#E53558]/10 border-[#E53558]/30'
                          : track.heatTag === 'Secret Dub'
                          ? 'text-purple-400 bg-purple-950/30 border-purple-500/30'
                          : 'text-blue-400 bg-blue-950/30 border-blue-500/30'
                      }`}
                    >
                      {track.heatTag}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-medium flex items-center gap-1.5 ${
                        track.clearance === 'Stream-Safe' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {track.clearance === 'Stream-Safe' ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}
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
              Transitioning from{' '}
              <strong className="text-cyan-400 font-mono">
                {lastSetTrack.title} ({lastSetTrack.key})
              </strong>{' '}
              ➔{' '}
              <strong className="text-white font-mono">
                {selectedClashTrack.title} ({selectedClashTrack.key})
              </strong>
              :
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
                <span>
                  Insert {suggestedBridge.title} ({suggestedBridge.key})
                </span>
                <ArrowRight size={10} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
