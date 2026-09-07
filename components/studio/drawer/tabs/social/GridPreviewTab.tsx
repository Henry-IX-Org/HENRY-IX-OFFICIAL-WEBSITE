'use client';

import React, { useState } from 'react';
import { LayoutGrid, Plus } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function GridPreviewTab() {
  const instagramGrid = useStudioStore((s) => s.instagramGrid);
  const reorderInstagramGrid = useStudioStore((s) => s.reorderInstagramGrid);
  const addInstagramPost = useStudioStore((s) => s.addInstagramPost);
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const addToast = useStudioStore((s) => s.addToast);

  const [selectedGridIdx, setSelectedGridIdx] = useState<number | null>(null);

  const activeGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || {
    venue: 'London Venue',
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <LayoutGrid size={14} className="text-cyan-400" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            3x3 Instagram Profile Grid
          </h4>
        </div>
        <span className="text-emerald-400 font-mono text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          94% BALANCE
        </span>
      </div>

      {/* 3x3 Visual Grid */}
      <div className="grid grid-cols-3 gap-2 bg-black/40 p-3 rounded-xl border border-white/[0.08]">
        {instagramGrid.slice(0, 9).map((post, idx) => (
          <div
            key={post.id}
            onClick={() => setSelectedGridIdx(idx)}
            className={`aspect-square rounded-lg border relative cursor-pointer group overflow-hidden transition-all ${
              selectedGridIdx === idx
                ? 'border-[#E53558] ring-2 ring-[#E53558]/50 shadow-[0_0_12px_rgba(229,53,88,0.25)]'
                : 'border-white/[0.08] hover:border-white/30'
            }`}
          >
            <div className="absolute inset-0 bg-[#1b1c22] flex flex-col justify-between p-2 text-[8px] font-mono select-none">
              <span className="text-zinc-500 font-bold">#{idx + 1}</span>
              <span className="font-semibold text-zinc-200 truncate text-[9px]">{post.type}</span>
              <span className="text-[8px] text-[#E53558] truncate">{post.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reorder controls for selected tile */}
      {selectedGridIdx !== null && (
        <div className="p-3.5 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-2.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-zinc-100">
              Tile #{selectedGridIdx + 1}: {instagramGrid[selectedGridIdx]?.title}
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">{instagramGrid[selectedGridIdx]?.type}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (selectedGridIdx > 0) {
                  reorderInstagramGrid(selectedGridIdx, selectedGridIdx - 1);
                  setSelectedGridIdx(selectedGridIdx - 1);
                }
              }}
              disabled={selectedGridIdx === 0}
              className="flex-1 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-zinc-200 disabled:opacity-30 transition-colors"
            >
              ▲ Move Earlier
            </button>
            <button
              onClick={() => {
                if (selectedGridIdx < instagramGrid.length - 1) {
                  reorderInstagramGrid(selectedGridIdx, selectedGridIdx + 1);
                  setSelectedGridIdx(selectedGridIdx + 1);
                }
              }}
              disabled={selectedGridIdx >= instagramGrid.length - 1}
              className="flex-1 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-zinc-200 disabled:opacity-30 transition-colors"
            >
              ▼ Move Later
            </button>
          </div>
        </div>
      )}

      {/* Stage New Tile Button */}
      <div className="pt-2 border-t border-white/[0.06]">
        <button
          onClick={() => {
            const sampleTypes: Array<'Gig Flyer' | 'Video Clip' | 'Track Reveal' | 'Artwork'> = [
              'Gig Flyer', 'Video Clip', 'Track Reveal', 'Artwork'
            ];
            const randomType = sampleTypes[Math.floor(Math.random() * sampleTypes.length)];
            const gigVenue = activeGig.venue;
            addInstagramPost({
              title: `${gigVenue.toUpperCase()} // LIVE REEL`,
              date: new Date().toISOString().split('T')[0],
              type: randomType,
              scheduled: true,
              image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
              caption: `Live from ${gigVenue}. Unreleased UKG / Speed Garage dubs incoming. Link in bio for ticket bookings. #henryix #${gigVenue.toLowerCase().replace(/\s+/g, '')}`,
            });
            addToast({
              title: 'TILE STAGED',
              message: `Staged new ${randomType} tile into 3x3 Instagram grid.`,
              type: 'success',
            });
          }}
          className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={13} />
          <span>+ Stage New Tile to Grid</span>
        </button>
      </div>
    </div>
  );
}
