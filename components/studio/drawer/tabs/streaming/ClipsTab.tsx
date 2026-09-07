'use client';

import React, { useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function ClipsTab() {
  const addToast = useStudioStore((s) => s.addToast);
  const [newClipNote, setNewClipNote] = useState('Heavy 32-Bar Vocal Double');
  const [newClipEnergy, setNewClipEnergy] = useState(9.0);
  const [highlightClips, setHighlightClips] = useState([
    { id: 'clip-1', time: '00:24:18', title: 'Peak Bass Drop (MAJA - KEPT)', energy: 9.2, status: 'Ready for Reels' },
    { id: 'clip-2', time: '00:48:32', title: 'Unreleased Dubplate Reveal', energy: 10.0, status: '1080p Transcoded' },
    { id: 'clip-3', time: '01:12:05', title: 'Do It Diva Double Drop', energy: 8.8, status: 'Ready for Reels' },
    { id: 'clip-4', time: '01:24:18', title: 'Favela Funk Final Hook', energy: 9.5, status: 'Pending' },
  ]);

  const handleAddClip = () => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between">
        <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-medium font-mono">LIVESTREAM CLIP MARKERS &amp; EDL</h4>
        <span className="text-[#E53558] font-mono text-[10px] font-semibold">{highlightClips.length} CLIPS</span>
      </div>

      {/* Quick Marker Composer */}
      <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-2.5">
        <span className="text-[10px] text-zinc-400 font-medium uppercase font-mono">⚡ Quick Marker Tag</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={newClipNote}
            onChange={(e) => setNewClipNote(e.target.value)}
            placeholder="Clip note..."
            className="flex-1 rounded-lg bg-[#0c0d10] border border-white/[0.08] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#E53558]"
          />
          <button
            onClick={handleAddClip}
            className="px-4 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#d82a4d] text-white font-medium text-xs transition-colors shadow-sm"
          >
            Mark
          </button>
        </div>
      </div>

      {/* Clip List */}
      <div className="space-y-2 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
        {highlightClips.map((clip) => (
          <div key={clip.id} className="p-3 rounded-xl border border-white/[0.08] bg-[#1b1c22] flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold text-[#E53558] text-[11px]">{clip.time}</span>
                <span className="font-medium text-white text-xs truncate">{clip.title}</span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                Energy: {clip.energy}/10 • <span className="text-emerald-400">{clip.status}</span>
              </div>
            </div>
            <button
              onClick={() => {
                addToast({ title: 'CLIP STAGED', message: `Pushed ${clip.title} to Assets dropzone for Reels export.`, type: 'info' });
              }}
              className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-colors"
              title="Push to Dropzone"
            >
              <Share2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* EDL Export Button */}
      <button
        onClick={handleExportEDL}
        className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <Download size={13} />
        <span>Export EDL Marker Track (.edl)</span>
      </button>
    </div>
  );
}
