'use client';

import React, { useState } from 'react';
import { CheckSquare, Copy } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function MixPipelineView() {
  const addToast = useStudioStore((s) => s.addToast);

  const [pipelineSteps, setPipelineSteps] = useState([
    {
      id: 1,
      name: 'Master Audio & Artwork',
      desc: 'Lossless 24-bit WAV audio + 3000x3000px cover artwork in Drive',
      completed: true,
    },
    {
      id: 2,
      name: 'Formatted Tracklist',
      desc: 'Minute-by-minute timestamps with Camelot keys & unreleased dub tags',
      completed: true,
    },
    {
      id: 3,
      name: 'SoundCloud Upload',
      desc: 'Audio uploaded with high-res cover, genre tags & private preview link',
      completed: true,
    },
    {
      id: 4,
      name: 'YouTube Video Render',
      desc: '1080p 60fps waveform visualizer video with automated chapter markers',
      completed: false,
    },
    {
      id: 5,
      name: 'Mixcloud Tagging',
      desc: 'Tracklist ingested with copyright-safe streaming monetization whitelist',
      completed: false,
    },
    {
      id: 6,
      name: 'Apple Podcasts RSS Feed',
      desc: 'Dynamic XML syndication feed pinged via /api/podcast/rss.xml',
      completed: false,
    },
    {
      id: 7,
      name: 'Publish to Website Archive',
      desc: 'One-click toggle to reflect on public henryix.com/mixes catalog',
      completed: false,
    },
    {
      id: 8,
      name: 'Social Teasers & Handoff',
      desc: '4-post sequence staged into 3x3 Instagram Grid and TikTok Reels',
      completed: false,
    },
  ]);

  const togglePipelineStep = (id: number) => {
    setPipelineSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const completedCount = pipelineSteps.filter((s) => s.completed).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
              <CheckSquare size={18} className="text-[#E53558]" />
              8-Stage Mix Making &amp; Omni-Release Pipeline
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              End-to-end release workflow: Audio mastering, artwork, platform distribution, and social promo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-mono mr-2">
              {completedCount} / {pipelineSteps.length} Steps Complete
            </span>
            <button
              onClick={() => {
                const tracklist =
                  '00:00 - CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK] [7A • 150 BPM]\n04:12 - rude boy tokyo drift - dj g2g [2A • 150 BPM]\n08:45 - Do It Diva - zpectrum [3A • 145 BPM]\n14:20 - Flori Pori - Favela Funk [7B • 150 BPM]';
                navigator.clipboard.writeText(tracklist);
                addToast({
                  title: 'TRACKLIST COPIED',
                  message: 'Formatted tracklist copied for SoundCloud/YouTube.',
                  type: 'success',
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Copy size={12} />
              <span>Copy Formatted Tracklist</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#0c0d10] h-2.5 rounded-full border border-white/10 overflow-hidden flex p-0.5">
          <div
            className="bg-[#E53558] h-full rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / pipelineSteps.length) * 100}%` }}
          />
        </div>

        {/* Pipeline Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pipelineSteps.map((step) => (
            <div
              key={step.id}
              onClick={() => togglePipelineStep(step.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors space-y-1.5 ${
                step.completed
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : 'border-white/[0.06] bg-[#0c0d10] hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${step.completed ? 'text-emerald-300' : 'text-white'}`}>
                  {step.id}. {step.name}
                </span>
                <input
                  type="checkbox"
                  checked={step.completed}
                  onChange={() => {}}
                  className="accent-[#E53558] h-4 w-4 rounded cursor-pointer"
                />
              </div>
              <p className="text-xs text-zinc-400">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center text-xs">
          <span className="text-zinc-400">
            Current Target Mix: <strong className="text-white">Knight Club Session 04</strong>
          </span>
          <button
            onClick={() =>
              addToast({
                title: 'MIX PUBLISHED',
                message: 'Knight Club Session 04 pushed to henryix.com/mixes.',
                type: 'success',
              })
            }
            className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm"
          >
            Publish to Website Archive Now
          </button>
        </div>
      </div>
    </div>
  );
}
