'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export default function StudioToasts() {
  const toasts = useStudioStore(s => s.toasts);
  const removeToast = useStudioStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';
        const isError = t.type === 'error';

        const borderColor = isSuccess 
          ? 'border-emerald-500 bg-zinc-950/95 text-emerald-400' 
          : isWarning 
          ? 'border-amber-500 bg-zinc-950/95 text-amber-400' 
          : isError 
          ? 'border-red-600 bg-zinc-950/95 text-red-500' 
          : 'border-[#22d3ee] bg-zinc-950/95 text-[#22d3ee]';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto border p-3 shadow-2xl backdrop-blur font-mono text-xs animate-in slide-in-from-right duration-200 flex items-start justify-between gap-3 relative overflow-hidden ${borderColor}`}
          >
            <div className="flex items-start gap-2.5">
              {isSuccess && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />}
              {isError && <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
              {!isSuccess && !isWarning && !isError && <Info size={16} className="text-[#22d3ee] flex-shrink-0 mt-0.5" />}
              <div>
                <div className="font-bold tracking-wider uppercase text-[11px]">{t.title}</div>
                <div className="text-zinc-300 text-[11px] mt-0.5 leading-relaxed">{t.message}</div>
              </div>
            </div>

            <button 
              onClick={() => removeToast(t.id)} 
              className="text-zinc-500 hover:text-white flex-shrink-0 p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
