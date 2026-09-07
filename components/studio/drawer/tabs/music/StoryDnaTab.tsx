'use client';

import React, { useState } from 'react';
import { BookOpen, Music, Copy } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function StoryDnaTab() {
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const addToast = useStudioStore((s) => s.addToast);

  const [vibeNoteText, setVibeNoteText] = useState(
    'Peak-time UK garage hybrid with hypnotic vocal chop. High-energy double-drop weapon with heavy sub-bass response on Funktion-One sound systems.'
  );

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
          <BookOpen size={14} className="text-[#E53558]" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            Cultural Track DNA & Set Context
          </h4>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black/50 border border-white/[0.08] rounded-xl flex-shrink-0 flex items-center justify-center">
            <Music size={22} className="text-[#E53558]" />
          </div>
          <div>
            <div className="font-semibold text-sm text-zinc-100 tracking-tight">{currentTrack.title}</div>
            <div className="text-zinc-400 text-xs">{currentTrack.artist}</div>
            <div className="text-cyan-400 text-[11px] font-mono mt-0.5">
              {currentTrack.key} • {currentTrack.bpm} BPM • {currentTrack.source}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
          <div className="flex justify-between">
            <span className="text-zinc-500">RECORD LABEL:</span>
            <span className="text-zinc-200 font-semibold">{currentTrack.label || 'XL Recordings // UK'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">RELEASE YEAR:</span>
            <span className="text-zinc-200">{currentTrack.year || 2021}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">ORIGIN:</span>
            <span className="text-zinc-200">London, United Kingdom</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">MIX PRESENCE:</span>
            <span className="text-amber-400 font-semibold">{currentTrack.mixPresence || 'Knight Club Vol 4'}</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
          <span className="text-zinc-400 text-[10px] uppercase block font-mono font-medium">
            Set Storytelling & Vibe Notes:
          </span>
          <textarea
            value={vibeNoteText}
            onChange={(e) => setVibeNoteText(e.target.value)}
            rows={3}
            className="w-full bg-[#1b1c22] border border-white/[0.08] rounded-lg p-2.5 text-zinc-300 text-[11px] leading-relaxed focus:outline-none focus:border-[#E53558]/50 resize-none font-sans"
          />
          <button
            onClick={() => {
              addToast({ title: 'VIBE NOTES SAVED', message: 'Updated set narrative in Notion Sets database.', type: 'success' });
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-zinc-300 text-[11px] hover:text-white transition-colors"
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
          className="w-full py-2.5 rounded-xl bg-[#1b1c22] border border-white/[0.08] hover:border-white/20 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Copy size={13} />
          <span>Copy Track Story for Show Notes</span>
        </button>
      </div>
    </div>
  );
}
