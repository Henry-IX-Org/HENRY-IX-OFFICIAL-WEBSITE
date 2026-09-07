'use client';

import React from 'react';
import { CheckSquare, AlertTriangle } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function ChecklistTab() {
  const bagItems = useStudioStore((s) => s.bagItems);
  const toggleBagItem = useStudioStore((s) => s.toggleBagItem);
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const addToast = useStudioStore((s) => s.addToast);

  const activeGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || {
    departureTime: '22:30',
  };

  const uncheckedCritical = bagItems.filter((i) => !i.checked && i.critical);

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <CheckSquare size={14} className="text-amber-400" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            Smart DJ Bag Checklist
          </h4>
        </div>
        <span
          className={`font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            uncheckedCritical.length > 0
              ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
              : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
          }`}
        >
          {bagItems.filter((i) => i.checked).length} / {bagItems.length} PACKED
        </span>
      </div>

      {/* Departure Countdown Warning Banner */}
      {uncheckedCritical.length > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-amber-300 space-y-1 text-[11px]">
          <div className="flex items-center gap-2 font-semibold uppercase text-[10px] font-mono">
            <AlertTriangle size={14} className="text-amber-400 animate-pulse" />
            <span>Departure Warning // {activeGig.departureTime}</span>
          </div>
          <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
            {uncheckedCritical.length} critical item(s) unverified (e.g. 1/4&quot; Gold Jack Adapter). Verify hardware before departure.
          </p>
        </div>
      )}

      {/* Checklist items */}
      <div className="space-y-2">
        {bagItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleBagItem(item.id)}
            className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between ${
              item.checked
                ? 'bg-black/30 border-white/[0.04] text-zinc-500 line-through'
                : 'bg-[#1b1c22] border-white/[0.08] text-zinc-100 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {}}
                readOnly
                className="accent-[#E53558] pointer-events-none rounded"
              />
              <span className="text-[12px] font-medium">{item.name}</span>
            </div>
            {item.critical && (
              <span className="text-[9px] px-2 py-0.5 bg-red-950/40 border border-red-500/30 text-red-400 font-mono font-bold uppercase rounded-full">
                CRITICAL
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-white/[0.06] flex gap-2">
        <button
          onClick={() => {
            bagItems.forEach((item) => {
              if (!item.checked) toggleBagItem(item.id);
            });
            addToast({ title: 'ALL HARDWARE PACKED', message: 'Smart DJ Bag verified for transit.', type: 'success' });
          }}
          className="flex-1 py-2 rounded-xl bg-[#E53558] text-white font-semibold text-xs uppercase hover:bg-[#c92646] transition-colors"
        >
          Check All
        </button>
        <button
          onClick={() => {
            bagItems.forEach((item) => {
              if (item.checked) toggleBagItem(item.id);
            });
            addToast({ title: 'CHECKLIST RESET', message: 'Reset DJ bag for new gig.', type: 'info' });
          }}
          className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
