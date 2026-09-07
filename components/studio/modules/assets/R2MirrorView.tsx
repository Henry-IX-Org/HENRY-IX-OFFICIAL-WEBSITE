'use client';

import React from 'react';
import { Copy } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function R2MirrorView() {
  const addToast = useStudioStore((s) => s.addToast);

  return (
    <div className="space-y-6">
      {/* R2 Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Total Storage</span>
          <div className="text-2xl font-bold font-mono text-white">4.82 GB</div>
          <span className="text-emerald-400 text-[11px] font-mono">Cloudflare R2 (0 Egress Fees)</span>
        </div>
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Monthly Requests</span>
          <div className="text-2xl font-bold font-mono text-white">384,210</div>
          <span className="text-zinc-400 text-[11px] font-mono">Edge CDN Cached</span>
        </div>
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Cache Hit Ratio</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">99.4%</div>
          <span className="text-zinc-400 text-[11px] font-mono">London LHR Edge Primary</span>
        </div>
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Egress Cost</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">£0.00</div>
          <span className="text-zinc-400 text-[11px] font-mono">100% Free Edge Delivery</span>
        </div>
      </div>

      {/* R2 Bucket Virtual Folder Explorer */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="font-semibold text-lg text-white tracking-tight">
              Cloudflare R2 Bucket: assets.henryix.com
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Root CDN endpoint delivering all high-fidelity images, audio masters, and proxy video streams
            </p>
          </div>

          <button
            onClick={() =>
              addToast({
                title: 'GLOBAL CDN PURGED',
                message: 'Flushed Cloudflare edge cache (<5s worldwide).',
                type: 'success',
              })
            }
            className="px-3.5 py-1.5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-900/30 transition-colors shadow-sm"
          >
            Purge All Edge Caches
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            {
              name: '/Hero/',
              desc: 'Optimized WebP/AVIF hero assets for henryix.com',
              files: 8,
              size: '24 MB',
              url: 'https://assets.henryix.com/Hero/',
            },
            {
              name: '/Gallery/',
              desc: 'High-res crowd & stage photography with dither maps',
              files: 42,
              size: '412 MB',
              url: 'https://assets.henryix.com/Gallery/',
            },
            {
              name: '/Mixes/',
              desc: 'Master mix covers & high-bitrate lossy/lossless streaming audio',
              files: 18,
              size: '2.84 GB',
              url: 'https://assets.henryix.com/Mixes/',
            },
            {
              name: '/Videos/',
              desc: '1080p fast-start MP4 and WebM video booth proxies',
              files: 14,
              size: '1.54 GB',
              url: 'https://assets.henryix.com/Videos/',
            },
          ].map((dir) => (
            <div
              key={dir.name}
              className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] hover:border-white/10 space-y-2.5 transition-all"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-white font-mono text-sm">{dir.name}</span>
                <span className="text-zinc-400 font-mono text-[11px]">
                  {dir.files} Files • {dir.size}
                </span>
              </div>
              <p className="text-zinc-400 text-xs">{dir.desc}</p>
              <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                <span className="text-[10px] text-zinc-500 truncate font-mono">{dir.url}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(dir.url);
                    addToast({ title: 'R2 URL COPIED', message: `Copied ${dir.url}`, type: 'info' });
                  }}
                  className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/[0.06] transition-colors"
                  title="Copy URL"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
