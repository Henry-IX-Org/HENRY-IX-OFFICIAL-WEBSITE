'use client';

import React, { useState } from 'react';
import { useStudioStore } from '@/store/studioStore';

export default function HotCueAuditBay() {
  const addToast = useStudioStore((s) => s.addToast);

  const [cueAuditTracks, setCueAuditTracks] = useState([
    { id: 'c-1', title: 'MAJA - KEPT [REWORK]', status: 'Standardized (6 Cues: A-F)', colorChecked: true },
    { id: 'c-2', title: 'dj g2g - rude boy tokyo drift', status: 'Missing Cue C (Main Drop)', colorChecked: false },
    { id: 'c-3', title: 'zpectrum - Do It Diva', status: 'Non-Standard Cue Colors', colorChecked: false },
  ]);

  const handleApplyCueTemplate = (id: string, title: string) => {
    // Play sensory click
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    }

    setCueAuditTracks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, colorChecked: true, status: 'Standardized (6 Cues: A-F)' } : t
      )
    );
    addToast({
      title: 'PIONEER CUES APPLIED',
      message: `Standardized cues A-F on "${title}".`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-white/[0.08] pb-3">
        <h3 className="font-semibold text-sm text-white uppercase tracking-wider">
          Bay 06 // Pioneer CDJ-3000 Hot Cue Standardization
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Enforces the standardized 6-tier Pioneer color code: Cue A (Green), B (Cyan), C (Red Drop), D
          (Yellow), E (Purple), F (Orange Outro).
        </p>
      </div>
      <div className="space-y-2.5">
        {cueAuditTracks.map((tr) => (
          <div
            key={tr.id}
            className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex flex-wrap justify-between items-center gap-2 text-xs"
          >
            <div>
              <div className="font-medium text-white">{tr.title}</div>
              <div className="text-zinc-400 text-xs mt-0.5">{tr.status}</div>
            </div>
            <button
              onClick={() => handleApplyCueTemplate(tr.id, tr.title)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tr.colorChecked
                  ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10'
                  : 'bg-[#E53558] hover:bg-[#f43f5e] text-white shadow-sm'
              }`}
            >
              {tr.colorChecked ? '✓ Compliant' : 'Apply 6-Cue Template'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
