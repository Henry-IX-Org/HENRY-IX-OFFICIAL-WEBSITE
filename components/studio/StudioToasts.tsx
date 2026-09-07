'use client';

import React from 'react';
import { useStudioStore } from '@/store/studioStore';
import { CheckCircle2, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

export default function StudioToasts() {
  const toasts = useStudioStore(s => s.toasts);
  const removeToast = useStudioStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-6 z-50 flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isWarning = t.type === 'warning';
        const isError = t.type === 'error';

        const accentBg = isSuccess
          ? 'bg-emerald-500'
          : isWarning
          ? 'bg-amber-500'
          : isError
          ? 'bg-[#E53558]'
          : 'bg-cyan-500';

        return (
          <div
            key={t.id}
            className="pointer-events-auto rounded-xl border border-white/[0.08] bg-[#14151a]/95 backdrop-blur-md p-3.5 shadow-2xl font-sans text-xs animate-in slide-in-from-right-4 duration-200 flex items-start justify-between gap-3 relative overflow-hidden group"
          >
            {/* Left accent indicator strip */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBg}`} />

            <div className="flex items-start gap-3 pl-1.5 min-w-0">
              {isSuccess && <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />}
              {isError && <AlertCircle size={16} className="text-[#E53558] flex-shrink-0 mt-0.5" />}
              {!isSuccess && !isWarning && !isError && <Info size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />}
              <div className="min-w-0">
                <div className="font-semibold text-white text-xs tracking-tight truncate">{t.title}</div>
                <div className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed break-words">{t.message}</div>
              </div>
            </div>

            <button 
              onClick={() => removeToast(t.id)} 
              className="text-zinc-500 hover:text-zinc-200 rounded-md p-1 hover:bg-white/[0.05] transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
