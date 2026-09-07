'use client';

import React, { useState } from 'react';
import { FileText, RotateCcw, Download } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function StoryCardTab() {
  const activeSetlist = useStudioStore((s) => s.activeSetlist);
  const addToast = useStudioStore((s) => s.addToast);

  const [storyEventTitle, setStoryEventTitle] = useState('HENRY IX // LONDON LIVE');
  const [storyTracksText, setStoryTracksText] = useState(
    '1. MAJA - KEPT [MAJA + OKTE REWORK]\n2. dj g2g - rude boy tokyo drift\n3. zpectrum - Do It Diva\n4. Sunshine Vendetta - My Neck My Back\n5. Flori Pori - Favela Funk'
  );

  const handleDownloadStoryCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark sleek background
    ctx.fillStyle = '#14151a';
    ctx.fillRect(0, 0, 1080, 1920);

    // Accent line
    ctx.fillStyle = '#E53558';
    ctx.fillRect(80, 140, 920, 12);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px monospace';
    ctx.fillText('HENRY IX', 80, 240);

    ctx.fillStyle = '#E53558';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(storyEventTitle.toUpperCase(), 80, 310);

    ctx.fillStyle = '#888888';
    ctx.font = '28px monospace';
    ctx.fillText('SET TRACKLIST REVEAL // DUBPLATE SELECTIONS', 80, 420);

    // Track rows
    const lines = storyTracksText.split('\n').filter((l) => l.trim().length > 0);
    let y = 520;
    ctx.fillStyle = '#eeeeee';
    ctx.font = '32px monospace';
    lines.forEach((line) => {
      ctx.fillText(line.substring(0, 48), 80, y);
      y += 68;
    });

    // Footer branding
    ctx.fillStyle = '#E53558';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('HENRYIX.COM • LIVE TOUR ARCHIVE', 80, 1800);

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

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-[#E53558]" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            9:16 Story Card Generator
          </h4>
        </div>
        <span className="text-[#E53558] font-mono text-[10px] font-semibold bg-[#E53558]/10 px-2 py-0.5 rounded-full border border-[#E53558]/20">
          1080x1920
        </span>
      </div>

      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3">
        <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium block">Event Title:</span>
        <input
          type="text"
          value={storyEventTitle}
          onChange={(e) => setStoryEventTitle(e.target.value)}
          className="w-full bg-[#14151a] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-[#E53558]/50"
        />

        <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase font-mono font-medium">
          <span>Tracklist Reveal:</span>
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
            className="text-[#E53558] hover:text-white flex items-center gap-1 font-mono normal-case text-[10px] transition-colors"
          >
            <RotateCcw size={11} />
            <span>Sync Setlist</span>
          </button>
        </div>
        <textarea
          rows={5}
          value={storyTracksText}
          onChange={(e) => setStoryTracksText(e.target.value)}
          className="w-full bg-[#14151a] border border-white/[0.08] rounded-lg p-2.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-[#E53558]/50 resize-none"
        />
      </div>

      <button
        onClick={handleDownloadStoryCard}
        className="w-full py-2.5 rounded-xl bg-[#E53558] text-white font-semibold text-xs uppercase hover:bg-[#c92646] transition-colors flex items-center justify-center gap-2"
      >
        <Download size={13} />
        <span>Download 9:16 Story Card (PNG)</span>
      </button>
    </div>
  );
}
