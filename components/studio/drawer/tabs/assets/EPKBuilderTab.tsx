'use client';

import React, { useState } from 'react';
import { FileCheck, CheckCircle2, Copy, Download } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function EPKBuilderTab() {
  const addToast = useStudioStore((s) => s.addToast);

  const [epkSlug, setEpkSlug] = useState('promoter-vip-2026');
  const [epkItems, setEpkItems] = useState({
    bio: true,
    photos: true,
    logos: true,
    rider: true,
    mix: true,
  });

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
          <FileCheck size={14} className="text-[#E53558]" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            Press Kit / EPK Generator
          </h4>
        </div>

        {/* Included Items Checklist */}
        <div className="space-y-1.5 text-[11px]">
          <span className="text-zinc-400 text-[10px] uppercase font-mono font-medium">Included in Bundle:</span>
          {[
            { key: 'bio' as const, label: 'Verified Artist Biography (Short & Full)' },
            { key: 'photos' as const, label: '3x 300dpi High-Res Press Photos' },
            { key: 'logos' as const, label: 'Downloadable Vector Brand Logos (SVG/AI)' },
            { key: 'rider' as const, label: 'Pioneer CDJ-3000 Technical Rider PDF' },
            { key: 'mix' as const, label: 'Flagship SoundCloud Mix Embed' },
          ].map((item) => {
            const isChecked = epkItems[item.key];
            return (
              <div
                key={item.key}
                onClick={() => setEpkItems((prev) => ({ ...prev, [item.key]: !prev[item.key] }))}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-white/[0.04] cursor-pointer text-zinc-300 transition-colors border border-transparent hover:border-white/[0.04]"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={13} className={isChecked ? 'text-emerald-400' : 'text-zinc-600'} />
                  <span className={isChecked ? 'text-zinc-200' : 'text-zinc-500 line-through'}>{item.label}</span>
                </div>
                <span className={`text-[9px] font-mono ${isChecked ? 'text-emerald-400' : 'text-zinc-600'}`}>
                  {isChecked ? 'ON' : 'OFF'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Secret Promoter Link */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
          <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase font-mono font-medium">
            <span>Secret Promoter Slug:</span>
            <button
              onClick={() => setEpkSlug(`promoter-${Math.random().toString(36).substring(2, 7)}-2026`)}
              className="text-[#E53558] hover:text-white transition-colors"
            >
              🎲 Randomize
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={epkSlug}
              onChange={(e) => setEpkSlug(e.target.value)}
              className="flex-1 bg-[#1b1c22] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#E53558]/50"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://henryix.com/press/${epkSlug}`);
                addToast({ title: 'SECRET LINK COPIED', message: 'Promoter one-pager link copied.', type: 'info' });
              }}
              className="px-3 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
              title="Copy URL"
            >
              <Copy size={13} />
            </button>
          </div>
        </div>

        {/* 1-Click ZIP Download */}
        <a
          href="/api/epk/zip"
          download="Henry_IX_Press_Kit_2026.zip"
          onClick={() => {
            addToast({ title: 'EPK ZIP GENERATING', message: 'Bundling hi-res press kit assets from R2.', type: 'info' });
          }}
          className="w-full py-2.5 rounded-xl bg-[#E53558] text-white font-semibold text-xs uppercase hover:bg-[#c92646] transition-colors flex items-center justify-center gap-2"
        >
          <Download size={13} />
          <span>Download Henry_IX_Press_Kit_2026.zip</span>
        </a>
      </div>
    </div>
  );
}
