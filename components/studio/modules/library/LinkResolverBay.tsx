'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';

export default function LinkResolverBay() {
  const addToast = useStudioStore((s) => s.addToast);

  return (
    <div className="space-y-4">
      <div className="border-b border-white/[0.08] pb-3">
        <h3 className="font-semibold text-sm text-white uppercase tracking-wider">
          Bay 05 // Multi-Link Finder &amp; Resolver
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Cross-references track library with streaming counterparts across SoundCloud, Spotify, and Beatport.
        </p>
      </div>
      <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center text-xs">
        <div>
          <div className="font-medium text-white">CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]</div>
          <div className="text-zinc-400 text-xs mt-0.5">
            SoundCloud (Matched) • Spotify (Matched) • Beatport (Matched)
          </div>
        </div>
        <button
          onClick={() =>
            addToast({
              title: 'EXTERNAL LINKS VERIFIED',
              message: 'SoundCloud / Spotify API links verified.',
              type: 'success',
            })
          }
          className="text-emerald-400 font-medium text-xs hover:underline"
        >
          ✓ Links Resolved
        </button>
      </div>
    </div>
  );
}
