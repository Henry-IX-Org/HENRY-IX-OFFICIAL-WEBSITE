'use client';

import React, { useState } from 'react';
import { Sliders, RefreshCw, Play, Plus } from 'lucide-react';
import { useStudioStore, StudioTrack } from '@/store/studioStore';

interface SmartCratesViewProps {
  filteredTracks: StudioTrack[];
}

export default function SmartCratesView({ filteredTracks }: SmartCratesViewProps) {
  const addToSetlist = useStudioStore((s) => s.addToSetlist);
  const playTrack = useStudioStore((s) => s.playTrack);
  const addToast = useStudioStore((s) => s.addToast);

  const [smartCrateRule, setSmartCrateRule] = useState<'140-dub' | 'peak' | 'harmonic-8a'>('140-dub');

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
      <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
              <Sliders size={18} className="text-[#E53558]" />
              SMART CRATES // DYNAMIC RULE ENGINE
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Auto-populating virtual crates matching tempo range, Camelot harmonic paths, and energy thresholds
            </p>
          </div>

          <button
            onClick={() =>
              addToast({
                title: 'SMART CRATE SYNCED',
                message: 'Mirrored rules to Rekordbox XML.',
                type: 'success',
              })
            }
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/50 text-xs font-medium text-zinc-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            <span>Sync to Rekordbox Smart Crates</span>
          </button>
        </div>

        {/* Rule Filter Tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: '140-dub', label: 'RULE 1: 140 BPM DUBS (138 - 142 BPM)', count: '14 Tracks' },
            { id: 'peak', label: 'RULE 2: PEAK WEAPONS (ENERGY >= 8.5)', count: '28 Tracks' },
            { id: 'harmonic-8a', label: 'RULE 3: HARMONIC 8A FLOW (7A / 8A / 9A)', count: '42 Tracks' },
          ].map((rule) => (
            <button
              key={rule.id}
              onClick={() => setSmartCrateRule(rule.id as any)}
              className={`px-3.5 py-2 rounded-xl border text-left transition-all ${
                smartCrateRule === rule.id
                  ? 'bg-white/[0.1] text-white border-white/[0.15] shadow-sm'
                  : 'bg-[#1b1c22]/50 border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="font-medium text-xs">{rule.label}</div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">{rule.count} matching</div>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Matches Table */}
      <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 shadow-sm">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#14151a] sticky top-0 border-b border-white/[0.08] text-zinc-400 font-medium uppercase text-[11px]">
            <tr>
              <th className="p-3">PLAY</th>
              <th className="p-3">MATCHING TRACK</th>
              <th className="p-3">ARTIST</th>
              <th className="p-3">BPM</th>
              <th className="p-3">KEY</th>
              <th className="p-3">SOURCE</th>
              <th className="p-3">RULE MATCH REASON</th>
              <th className="p-3 text-center">+SET</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredTracks.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.03] transition-colors">
                <td className="p-3">
                  <button
                    onClick={() => playTrack(t)}
                    className="w-6 h-6 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center hover:border-white text-zinc-400"
                  >
                    <Play size={10} className="ml-0.5" />
                  </button>
                </td>
                <td className="p-3 font-medium text-white">{t.title}</td>
                <td className="p-3 text-zinc-400">{t.artist}</td>
                <td className="p-3 text-zinc-300 font-mono">{t.bpm.toFixed(1)}</td>
                <td className="p-3 text-cyan-400 font-mono font-medium">{t.key}</td>
                <td className="p-3 text-zinc-400">{t.source}</td>
                <td className="p-3 text-emerald-400 text-xs">
                  {smartCrateRule === '140-dub'
                    ? 'Tempo inside 138-142 BPM window'
                    : smartCrateRule === 'peak'
                    ? 'Energy rating 8.5+ threshold'
                    : 'Camelot ±1 Key Match'}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => addToSetlist(t)}
                    className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:border-[#E53558]/50 hover:text-[#E53558] transition-colors"
                  >
                    <Plus size={11} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
