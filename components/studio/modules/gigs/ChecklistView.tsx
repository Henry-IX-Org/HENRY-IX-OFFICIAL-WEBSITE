'use client';

import React from 'react';
import { CheckSquare } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function ChecklistView() {
  const bagItems = useStudioStore((s) => s.bagItems);
  const toggleBagItem = useStudioStore((s) => s.toggleBagItem);
  const addToast = useStudioStore((s) => s.addToast);

  const uncheckedCount = bagItems.filter((i) => !i.checked).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
              <CheckSquare size={18} className="text-[#E53558]" />
              Smart DJ Bag // Booth Hardware Checklist
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Critical gear inspection with automated departure warning 2 hours before London TfL call-time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                bagItems.forEach((i) => {
                  if (!i.checked) toggleBagItem(i.id);
                });
                addToast({
                  title: 'ALL ITEMS CHECKED',
                  message: 'Smart DJ Bag is 100% packed.',
                  type: 'success',
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors shadow-sm"
            >
              Check All Items
            </button>

            <button
              onClick={() => {
                bagItems.forEach((i) => {
                  if (i.checked) toggleBagItem(i.id);
                });
                addToast({
                  title: 'CHECKLIST RESET',
                  message: 'Reset packing list for next gig.',
                  type: 'info',
                });
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-300"
            >
              Reset List
            </button>
          </div>
        </div>

        {/* Checklist items */}
        <div className="space-y-2">
          {bagItems.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleBagItem(item.id)}
              className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                item.checked
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                  : 'border-white/[0.06] bg-[#0c0d10] text-zinc-300 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => {}}
                  className="accent-[#E53558] h-4 w-4 rounded cursor-pointer"
                />
                <span
                  className={`text-xs ${
                    item.checked ? 'line-through text-zinc-500 font-normal' : 'font-medium text-white'
                  }`}
                >
                  {item.name}
                </span>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  item.critical
                    ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                    : 'bg-white/[0.06] border border-white/10 text-zinc-400'
                }`}
              >
                {item.critical ? 'CRITICAL BOOTH GEAR' : 'STANDARD'}
              </span>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center text-xs text-zinc-400 font-mono">
          <span>
            PACKING PROGRESS:{' '}
            <strong className="text-white">
              {bagItems.filter((i) => i.checked).length} / {bagItems.length} PACKED
            </strong>
          </span>
          <span className={uncheckedCount === 0 ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
            {uncheckedCount === 0 ? '✓ READY FOR DEPARTURE' : `⚠️ ${uncheckedCount} ITEMS UNCHECKED`}
          </span>
        </div>
      </div>
    </div>
  );
}
