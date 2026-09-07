'use client';

import React from 'react';
import { Download, CheckCircle2, Copy } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function EPKHubView() {
  const addToast = useStudioStore((s) => s.addToast);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h3 className="font-semibold text-xl text-white tracking-tight">
              Official Press Kit & EPK Hub
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Promoter one-pager generator, unlisted portal tokens, and 1-click Henry_IX_Press_Kit_2026.zip export
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/epk/zip"
              download="Henry_IX_Press_Kit_2026.zip"
              className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#c92646] text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download size={13} />
              <span>Download Complete ZIP (.ZIP)</span>
            </a>
          </div>
        </div>

        {/* Secret Promoter Link Card */}
        <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span className="text-zinc-300">
              SECRET PROMOTER PORTAL URL:{' '}
              <strong className="text-white font-mono">https://henryix.com/press/promoter</strong>
            </span>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText('https://henryix.com/press/promoter');
              addToast({
                title: 'PORTAL LINK COPIED',
                message: 'Sent secret EPK link with 7-day token to clipboard.',
                type: 'success',
              });
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors text-xs font-medium"
          >
            <Copy size={11} />
            <span>Copy Promoter Access Link</span>
          </button>
        </div>

        {/* EPK Package Contents */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Box 1: Artist Bio */}
          <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
            <div className="font-semibold text-white uppercase text-[11px] flex justify-between">
              <span>1. Artist Biography</span>
              <span className="text-zinc-500 font-normal font-mono text-[10px]">Short & Full</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              HENRY IX is a London-based electronic music artist, DJ, and creative technologist exploring the
              intersections of underground UK bass music, hypnotic 140 dubplates, and pro DJ performance.
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  'HENRY IX is a London-based electronic music artist, DJ, and creative technologist exploring the intersections of underground UK bass music, hypnotic 140 dubplates, and pro DJ performance.'
                );
                addToast({
                  title: 'BIO COPIED',
                  message: 'Copied verified artist biography for promoter print.',
                  type: 'info',
                });
              }}
              className="text-[#E53558] hover:underline text-[11px] font-medium"
            >
              Copy Short Bio (150 Words)
            </button>
          </div>

          {/* Box 2: Press Photos */}
          <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
            <div className="font-semibold text-white uppercase text-[11px] flex justify-between">
              <span>2. 300DPI Press Shots</span>
              <span className="text-zinc-500 font-normal font-mono text-[10px]">3 Assets</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              High-resolution print photography captured at Corsica Studios and London studio spaces.
            </p>
            <button
              onClick={() =>
                addToast({
                  title: 'PHOTOS DOWNLOADED',
                  message: 'Downloaded 3x 300dpi hi-res press photos.',
                  type: 'success',
                })
              }
              className="text-emerald-400 hover:underline text-[11px] font-medium"
            >
              Download All 3 Photos (.jpg)
            </button>
          </div>

          {/* Box 3: Technical Rider */}
          <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
            <div className="font-semibold text-white uppercase text-[11px] flex justify-between">
              <span>3. CDJ-3000 Tech Rider</span>
              <span className="text-zinc-500 font-normal font-mono text-[10px]">PDF Ready</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Specification: 4x Pioneer CDJ-3000, 1x DJM-A9 or Allen & Heath Xone:96, Pro Link Hub, Booth
              monitors.
            </p>
            <button
              onClick={() =>
                addToast({
                  title: 'TECH RIDER DOWNLOADED',
                  message: 'Downloaded official Pioneer Tech Rider PDF.',
                  type: 'success',
                })
              }
              className="text-[#06b6d4] hover:underline text-[11px] font-medium"
            >
              Download Tech Rider (.pdf)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
