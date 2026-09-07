'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function DuplicateDetectiveBay() {
  const addToast = useStudioStore((s) => s.addToast);

  const [duplicates, setDuplicates] = useState([
    {
      id: 'dup-1',
      original: {
        title: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK] (Master).wav',
        duration: '03:37.1',
        bitrate: '1411 kbps WAV',
      },
      duplicate: {
        title: 'MAJA - Kept [Free DL 320k Rip].mp3',
        duration: '03:37.4',
        bitrate: '320 kbps MP3',
      },
      confidence: 98,
    },
  ]);

  const handleResolveDuplicate = (action: 'delete' | 'merge') => {
    setDuplicates([]);
    if (action === 'delete') {
      addToast({
        title: 'DUPLICATE PURGED',
        message: 'Deleted 320kbps MP3 copy. Preserved Master 1411kbps WAV.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'CRATES MERGED',
        message: 'Mapped playlist occurrences to Master 1411kbps WAV.',
        type: 'success',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
        <div>
          <h3 className="font-semibold text-sm text-white uppercase tracking-wider">
            Bay 01 // Duplicate Detective
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Smart Fingerprinting matching duration (within ±0.5s), fuzzy Levenshtein distance &amp; bitrates.
          </p>
        </div>
        <span className="text-xs text-[#E53558] font-mono font-medium">
          {duplicates.length > 0 ? `${duplicates.length} MATCH DETECTED` : 'ALL DUPLICATES RESOLVED'}
        </span>
      </div>

      {duplicates.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed border-white/10 bg-[#0c0d10] text-center space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
          <div className="font-medium text-white text-xs">No Duplicate Copies Found</div>
          <div className="text-xs text-zinc-500">
            Collection is 100% de-duplicated across Rekordbox &amp; local folders.
          </div>
        </div>
      ) : (
        duplicates.map((dup) => (
          <div key={dup.id} className="p-4 rounded-lg bg-[#0c0d10] border border-amber-500/30 space-y-3">
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
              <span className="text-amber-400 font-medium font-mono">
                Warning: High Confidence Match ({dup.confidence}%)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResolveDuplicate('delete')}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs text-zinc-200 transition-colors"
                >
                  Keep Original Only (Delete MP3)
                </button>
                <button
                  onClick={() => handleResolveDuplicate('merge')}
                  className="px-3 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm"
                >
                  Safe Merge Crate Presence
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <div className="text-emerald-400 font-medium mb-1 font-sans">Primary Master:</div>
                <div className="text-white font-medium">{dup.original.title}</div>
                <div className="text-zinc-400 text-[11px] mt-1">
                  {dup.original.duration} • {dup.original.bitrate}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#14151a]">
                <div className="text-zinc-400 font-medium mb-1 font-sans">Duplicate Copy:</div>
                <div className="text-zinc-300">{dup.duplicate.title}</div>
                <div className="text-zinc-500 text-[11px] mt-1">
                  {dup.duplicate.duration} • {dup.duplicate.bitrate}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
