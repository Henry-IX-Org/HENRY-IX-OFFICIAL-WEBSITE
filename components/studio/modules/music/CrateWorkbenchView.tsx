'use client';

import React from 'react';
import { Folder, Play, Pause, ListPlus, Plus, Download } from 'lucide-react';
import { useStudioStore, StudioTrack } from '@/store/studioStore';

interface CrateWorkbenchViewProps {
  currentMode: 'crate-kc4' | 'crate-rc2' | 'crate-cn1';
  kc4Tracks: StudioTrack[];
  rc2Tracks: StudioTrack[];
  cn1Tracks: StudioTrack[];
}

export default function CrateWorkbenchView({
  currentMode,
  kc4Tracks,
  rc2Tracks,
  cn1Tracks,
}: CrateWorkbenchViewProps) {
  const addToSetlist = useStudioStore((s) => s.addToSetlist);
  const addToQueue = useStudioStore((s) => s.addToQueue);
  const exportRekordboxXml = useStudioStore((s) => s.exportRekordboxXml);
  const playTrack = useStudioStore((s) => s.playTrack);
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const addToast = useStudioStore((s) => s.addToast);

  const tList =
    currentMode === 'crate-kc4'
      ? kc4Tracks
      : currentMode === 'crate-rc2'
      ? rc2Tracks
      : cn1Tracks;

  const handleLoadCrateToSetlist = (tracks: StudioTrack[], crateName: string) => {
    tracks.forEach((t) => addToSetlist(t));
    addToast({
      title: `${crateName.toUpperCase()} LOADED`,
      message: `Pushed ${tracks.length} tracks from ${crateName} into active live setlist.`,
      type: 'success',
    });
  };

  return (
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
            {currentMode === 'crate-kc4' &&
              '145-155 BPM • UKG / BREAKS / HARD GROOVE • CORSICA STUDIOS ROOM 2'}
            {currentMode === 'crate-rc2' &&
              '134-138 BPM • DEEP HYPNOTIC TECHNO • VENUE MOT BERMONDSEY'}
            {currentMode === 'crate-cn1' &&
              '138-142 BPM • SPEED GARAGE / 140 DUBS • CORNER NEW CROSS BASEMENT'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => addToQueue(tList)}
            className="px-3.5 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-cyan-500/40 text-cyan-400 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Append all crate tracks to playback queue"
          >
            <ListPlus size={13} />
            <span>Queue All</span>
          </button>

          <button
            onClick={() =>
              handleLoadCrateToSetlist(
                tList,
                currentMode === 'crate-kc4'
                  ? 'Knight Club 4'
                  : currentMode === 'crate-rc2'
                  ? 'Royal Court 2'
                  : 'Corner N1'
              )
            }
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
            {tList.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const isMinor = track.key?.endsWith('A');
              return (
                <tr key={track.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="p-3 text-center text-zinc-500 font-mono text-xs">{idx + 1}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => (isCurrent ? togglePlay() : playTrack(track))}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isCurrent && isPlaying
                          ? 'border-emerald-400 bg-emerald-950 text-emerald-400'
                          : 'border-white/[0.1] text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause size={10} />
                      ) : (
                        <Play size={10} className="ml-0.5" />
                      )}
                    </button>
                  </td>
                  <td className="p-3 font-medium text-white">{track.title}</td>
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
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/[0.08] rounded-full overflow-hidden flex">
                        <div
                          className="bg-[#E53558] h-full rounded-full"
                          style={{ width: `${(track.energy / 10) * 100}%` }}
                        />
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
  );
}
