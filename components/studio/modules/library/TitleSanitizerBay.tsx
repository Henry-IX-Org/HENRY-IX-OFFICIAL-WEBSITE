'use client';

import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function TitleSanitizerBay() {
  const addToast = useStudioStore((s) => s.addToast);

  const [dirtyTitles, setDirtyTitles] = useState([
    {
      id: '1',
      dirty: 'MAJA - CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK] [OUT NOW 2024] 320kbps.mp3',
      clean: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]',
      artist: 'MAJA',
    },
    {
      id: '2',
      dirty: 'dj g2g - rude boy tokyo drift [YouTube Rip Master].wav',
      clean: 'rude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend)',
      artist: 'dj g2g',
    },
    {
      id: '3',
      dirty: 'zpectrum - Do It Diva (Free Download SoundCloud).aiff',
      clean: 'Do It Diva (Don Omar x Heidi Montag)',
      artist: 'zpectrum',
    },
  ]);

  const handleCleanAllTitles = () => {
    const count = dirtyTitles.length;
    setDirtyTitles([]);
    addToast({
      title: 'TITLES SANITIZED',
      message: `Cleaned ${count} tracks. Stripped [Rip], [320kbps], and promotional suffixes.`,
      type: 'success',
    });
  };

  const handleCleanSingleTitle = (id: string, cleanTitle: string) => {
    setDirtyTitles((prev) => prev.filter((t) => t.id !== id));
    addToast({
      title: 'TITLE SANITIZED',
      message: `Updated to canonical title: "${cleanTitle}".`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div>
          <h3 className="font-semibold text-sm text-white uppercase tracking-wider">
            Bay 02 // Title &amp; Artist Sanitizer
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Strips 112 bootleg rip strings (&quot;[Free Download]&quot;, &quot;Out Now&quot;, &quot;320kbps&quot;,
            &quot;YouTube Rip&quot;) without altering audio masters.
          </p>
        </div>
        {dirtyTitles.length > 0 && (
          <button
            onClick={handleCleanAllTitles}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors shadow-sm"
          >
            ✓ Auto-Clean All ({dirtyTitles.length})
          </button>
        )}
      </div>

      {dirtyTitles.length === 0 ? (
        <div className="p-8 rounded-lg border border-dashed border-white/10 bg-[#0c0d10] text-center space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
          <div className="font-medium text-white text-xs">All Titles Sanitized &amp; Compliant</div>
          <div className="text-xs text-zinc-500">All metadata conforms to canonical Discogs standard.</div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {dirtyTitles.map((t) => (
            <div
              key={t.id}
              className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-1">
                <div className="text-red-400 line-through text-[11px] font-mono">{t.dirty}</div>
                <div className="text-emerald-400 font-medium flex items-center gap-2">
                  <span>→</span>
                  <span>
                    {t.artist} - {t.clean}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleCleanSingleTitle(t.id, t.clean)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition-colors"
              >
                Apply Clean Title
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
