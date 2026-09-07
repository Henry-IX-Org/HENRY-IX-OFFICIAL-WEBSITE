'use client';

import React from 'react';
import { Download, Play, Trash2 } from 'lucide-react';
import { useStudioStore, StudioTrack } from '@/store/studioStore';

interface SetPlanningWorkbenchViewProps {
  filteredTracks: StudioTrack[];
}

export default function SetPlanningWorkbenchView({
  filteredTracks,
}: SetPlanningWorkbenchViewProps) {
  const activeSetlist = useStudioStore((s) => s.activeSetlist);
  const addToSetlist = useStudioStore((s) => s.addToSetlist);
  const removeFromSetlist = useStudioStore((s) => s.removeFromSetlist);
  const exportRekordboxXml = useStudioStore((s) => s.exportRekordboxXml);
  const playTrack = useStudioStore((s) => s.playTrack);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden p-6 gap-5 font-sans">
      {/* Left Pane: Search Pool */}
      <div className="w-full md:w-1/2 flex flex-col border border-white/[0.08] bg-[#14151a] rounded-xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
          <span className="font-semibold text-xs text-white uppercase tracking-wider">
            AVAILABLE CRATE TRACKS
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">{filteredTracks.length} Ready</span>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {filteredTracks.map((t) => (
            <div
              key={t.id}
              className="p-2.5 bg-[#1b1c22]/40 border border-white/[0.04] hover:border-white/[0.1] rounded-lg flex items-center justify-between text-xs transition-colors"
            >
              <div>
                <div className="font-medium text-white">{t.title}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {t.artist} • <span className="text-cyan-400 font-mono font-medium">{t.key}</span> •{' '}
                  <span className="font-mono text-zinc-400">{t.bpm} BPM</span>
                </div>
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
            <span className="font-semibold text-xs text-white uppercase tracking-wider">
              ACTIVE LIVE SETLIST
            </span>
            <span className="text-[11px] text-zinc-400 font-mono ml-2">
              ({activeSetlist.length} Tracks Planned)
            </span>
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
              <div
                key={i}
                className="flex-1 bg-white/[0.06] rounded-t overflow-hidden flex flex-col justify-end"
              >
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
            <div
              key={idx}
              className="p-3 bg-[#1b1c22]/40 border border-white/[0.04] hover:border-white/[0.1] rounded-lg flex items-center justify-between text-xs transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-[#E53558] font-bold font-mono w-5 flex-shrink-0">#{item.pos}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white truncate">{item.track.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate mt-0.5">
                    {item.track.artist} •{' '}
                    <span className="text-cyan-400 font-mono font-medium">{item.track.key}</span> •{' '}
                    <span className="font-mono text-zinc-400">{item.track.bpm} BPM</span> •{' '}
                    <span className="text-zinc-500">{item.note}</span>
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
  );
}
