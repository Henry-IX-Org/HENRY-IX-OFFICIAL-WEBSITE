'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';

export default function SmartTagBay() {
  const addToast = useStudioStore((s) => s.addToast);

  const [tagProposals, setTagProposals] = useState([
    {
      id: 'p-1',
      track: 'Favela Funk',
      genre: 'Baile Funk / Breaks',
      key: '7B',
      energy: '9.2 / 10',
      confidence: 94,
      committed: false,
    },
    {
      id: 'p-2',
      track: 'My Neck My Back [FREE DL]',
      genre: 'UK Bass / Hardgroove',
      key: '3A',
      energy: '8.8 / 10',
      confidence: 91,
      committed: false,
    },
  ]);

  const handleCommitTags = (id: string, track: string) => {
    setTagProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, committed: true } : p))
    );
    addToast({
      title: 'TAGS COMMITTED',
      message: `Wrote Camelot harmonic & set energy tags to "${track}".`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-white/[0.08] pb-3">
        <h3 className="font-semibold text-sm text-white uppercase tracking-wider">
          Bay 03 // Smart Tag Recommender
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Calculates genre lineage, Camelot harmonic key, and set energy rating with percentage confidence scores.
        </p>
      </div>

      <div className="space-y-2.5">
        {tagProposals.map((prop) => (
          <div
            key={prop.id}
            className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs"
          >
            <div>
              <div className="font-medium text-white mb-1">{prop.track}</div>
              <div className="flex flex-wrap gap-3 text-zinc-400 text-xs">
                <span>
                  Genre: <strong className="text-white">{prop.genre}</strong>
                </span>
                <span>
                  Key: <strong className="text-[#06b6d4] font-mono">{prop.key}</strong>
                </span>
                <span>
                  Energy: <strong className="text-[#E53558] font-mono">{prop.energy}</strong>
                </span>
                <span className="text-emerald-400 font-mono">({prop.confidence}% Confidence)</span>
              </div>
            </div>
            <button
              onClick={() => handleCommitTags(prop.id, prop.track)}
              disabled={prop.committed}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                prop.committed
                  ? 'border border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                  : 'bg-white/[0.06] border border-white/10 hover:border-[#E53558]/40 hover:text-white text-zinc-300'
              }`}
            >
              {prop.committed ? '✓ Tags Committed' : 'Commit Tags'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
