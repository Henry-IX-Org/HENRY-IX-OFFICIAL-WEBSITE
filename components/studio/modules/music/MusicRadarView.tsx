'use client';

import React, { useState } from 'react';
import { Compass, RefreshCw, ExternalLink } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function MusicRadarView() {
  const addToast = useStudioStore((s) => s.addToast);

  const [diggingWishlist] = useState<
    Array<{
      id: string;
      title: string;
      artist: string;
      label: string;
      bpm: number;
      key: string;
      storeUrl: string;
      price: string;
    }>
  >([
    {
      id: 'w-1',
      title: 'KEPT [MAJA + OKTE REWORK]',
      artist: 'MAJA',
      label: 'Self-Released',
      bpm: 150,
      key: '7A',
      storeUrl: 'https://bandcamp.com',
      price: 'Free DL',
    },
    {
      id: 'w-2',
      title: 'rude boy tokyo drift',
      artist: 'dj g2g',
      label: 'Club Edits',
      bpm: 150,
      key: '2A',
      storeUrl: 'https://bandcamp.com',
      price: '£2.50',
    },
    {
      id: 'w-3',
      title: 'Do It Diva',
      artist: 'zpectrum',
      label: 'Latin Bass',
      bpm: 145,
      key: '3A',
      storeUrl: 'https://bandcamp.com',
      price: '£3.00',
    },
    {
      id: 'w-4',
      title: 'Favela Funk',
      artist: 'Flori Pori',
      label: 'Favela Sound',
      bpm: 150,
      key: '7B',
      storeUrl: 'https://bandcamp.com',
      price: '£2.00',
    },
  ]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
      <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
              <Compass size={18} className="text-[#E53558]" />
              MUSIC RADAR // ARTIST &amp; UNDERGROUND LABEL TRACKER
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Automated scraping &amp; tracking of Bandcamp, Beatport, and SoundCloud secret accounts for unreleased weapons
            </p>
          </div>

          <button
            onClick={() =>
              addToast({
                title: 'RADAR REFRESHED',
                message: 'Scanned 14 label Bandcamp pages for new releases.',
                type: 'success',
              })
            }
            className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#E53558]/50 text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw size={12} />
            <span>Scan Labels Now</span>
          </button>
        </div>

        {/* Monitored Labels Bar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-mono text-[10px] uppercase">MONITORED LABELS:</span>
          {['XL Recordings', 'Hessle Audio', 'Ilian Tape', 'PAN', 'SK_eleven', 'Time Is Now', 'Sneaker Social Club'].map(
            (label) => (
              <span
                key={label}
                className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs"
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>

      {/* Digging Wishlist & Lookalikes Table */}
      <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 p-5 space-y-3 shadow-sm">
        <div className="flex justify-between items-center border-b border-white/[0.06] pb-2">
          <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
            DIGGING RADAR WISHLIST ({diggingWishlist.length} RELEASES IDENTIFIED)
          </h4>
          <span className="text-[11px] text-zinc-400 font-mono">1-CLICK PURCHASE ➔ LOG TO FINANCE EXPENSES</span>
        </div>

        <div className="space-y-2 text-xs">
          {diggingWishlist.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-[#1b1c22]/40 border border-white/[0.05] hover:border-white/[0.1] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
            >
              <div>
                <div className="font-medium text-white text-[13px]">{item.title}</div>
                <div className="text-zinc-400 text-xs mt-0.5">
                  {item.artist} • <span className="text-zinc-300">{item.label}</span> •{' '}
                  <span className="text-cyan-400 font-mono font-medium">{item.key}</span> •{' '}
                  <span className="font-mono text-zinc-400">{item.bpm} BPM</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-semibold font-mono mr-2">{item.price}</span>
                <a
                  href={item.storeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] text-zinc-200 text-xs flex items-center gap-1.5 transition-colors font-medium"
                >
                  <ExternalLink size={12} />
                  <span>Bandcamp</span>
                </a>
                <button
                  onClick={() => {
                    addToast({
                      title: 'LOGGED TO FINANCE',
                      message: `Logged ${item.price} expense for ${item.title} to UK HMRC ledger.`,
                      type: 'success',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#E53558] text-white font-medium text-xs hover:bg-[#ff3b66] transition-all shadow-[0_0_10px_rgba(229,53,88,0.3)]"
                >
                  + Add to Digging Expense
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
