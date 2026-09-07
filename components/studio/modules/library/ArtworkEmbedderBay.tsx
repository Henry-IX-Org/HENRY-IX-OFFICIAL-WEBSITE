'use client';

import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function ArtworkEmbedderBay() {
  const addToast = useStudioStore((s) => s.addToast);

  return (
    <div className="space-y-4">
      <div className="border-b border-white/[0.08] pb-3">
        <h3 className="font-semibold text-sm text-white uppercase tracking-wider">
          Bay 04 // 3000x3000px Hi-Res Artwork Embedder
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Scans Spotify, Beatport, and Discogs databases to embed verified square covers directly into ID3 tags.
        </p>
      </div>
      <div className="p-8 rounded-lg border border-dashed border-white/10 text-center space-y-2 bg-[#0c0d10]">
        <ImageIcon size={32} className="mx-auto text-zinc-600" />
        <div className="text-xs text-zinc-300 font-medium">All Tracks Audited for Artwork Integrity</div>
        <div className="text-xs text-emerald-400 font-mono font-medium">99.4% COVER ART SATURATION</div>
        <button
          onClick={() =>
            addToast({
              title: 'ARTWORK RETRIEVAL VERIFIED',
              message: 'Embedded 14 missing hi-res covers.',
              type: 'success',
            })
          }
          className="mt-3 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-200 transition-colors"
        >
          Scan Remaining 0.6%
        </button>
      </div>
    </div>
  );
}
