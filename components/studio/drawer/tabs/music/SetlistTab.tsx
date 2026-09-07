'use client';

import React from 'react';
import { Music, Play, Trash2, Download, Copy } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function SetlistTab() {
  const activeSetlist = useStudioStore((s) => s.activeSetlist);
  const playTrack = useStudioStore((s) => s.playTrack);
  const removeFromSetlist = useStudioStore((s) => s.removeFromSetlist);
  const exportRekordboxXml = useStudioStore((s) => s.exportRekordboxXml);
  const addToast = useStudioStore((s) => s.addToast);

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex justify-between items-center pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Music size={14} className="text-[#E53558]" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            Active Setlist ({activeSetlist.length})
          </h4>
        </div>
        <span className="text-emerald-400 text-[10px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          NOTION SYNCED
        </span>
      </div>

      <div className="space-y-2">
        {activeSetlist.length === 0 ? (
          <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] text-center text-zinc-500 font-mono text-[11px]">
            No tracks in active setlist. Queue from Library or Harmonic Radar.
          </div>
        ) : (
          activeSetlist.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-white/[0.08] bg-[#1b1c22] hover:border-white/20 transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-zinc-100 truncate text-[12px]">
                  <span className="text-zinc-500 font-mono mr-1.5">{item.pos}.</span>
                  {item.track.title}
                </div>
                <div className="text-[11px] text-zinc-400 truncate font-mono mt-0.5">
                  {item.track.artist} • <span className="text-cyan-400">{item.track.key}</span> • {item.track.bpm} BPM
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playTrack(item.track);
                    addToast({
                      title: 'TRACK LOADED',
                      message: `Loaded ${item.track.title} into persistent deck.`,
                      type: 'info',
                    });
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors"
                  title="Play Track"
                >
                  <Play size={13} />
                </button>
                <button
                  onClick={() => {
                    removeFromSetlist(idx);
                    addToast({
                      title: 'SETLIST UPDATED',
                      message: `Removed ${item.track.title} from setlist.`,
                      type: 'info',
                    });
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors"
                  title="Remove"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex gap-2">
        <button
          onClick={exportRekordboxXml}
          className="flex-1 py-2 rounded-xl bg-[#1b1c22] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <Download size={13} />
          <span>Export XML</span>
        </button>
        <button
          onClick={() => {
            const text = activeSetlist.map((s) => `${s.pos}. ${s.track.artist} - ${s.track.title} [${s.track.key}]`).join('\n');
            navigator.clipboard.writeText(text);
            addToast({ title: 'SETLIST COPIED', message: 'Copied tracklist with keys and order.', type: 'success' });
          }}
          className="flex-1 py-2 rounded-xl bg-[#E53558] text-white font-semibold text-xs hover:bg-[#c92646] transition-colors flex items-center justify-center gap-1.5"
        >
          <Copy size={13} />
          <span>Copy Text</span>
        </button>
      </div>
    </div>
  );
}
