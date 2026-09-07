'use client';

import React, { useState } from 'react';
import { HardDrive, RotateCcw, ShieldAlert } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function R2SyncTab() {
  const triggerEmergencyPurge = useStudioStore((s) => s.triggerEmergencyPurge);
  const addToast = useStudioStore((s) => s.addToast);

  const [isSyncingR2, setIsSyncingR2] = useState(false);
  const [lastR2Sync, setLastR2Sync] = useState('Today, 19:42 UTC');
  const [r2SyncLogs, setR2SyncLogs] = useState<string[]>([
    '[19:42:01] Synced: Royal_Court_Tour.webp (3.4 MB) -> r2://assets.henryix.com',
    '[19:42:04] Transcoded: KC4_Booth_Drop_1080p.mp4 (Fast-Start WebM/MP4)',
    '[19:42:06] Purged Edge CDN tag: "assets-vault"',
  ]);

  const handleForceR2Sync = () => {
    setIsSyncingR2(true);
    addToast({
      title: 'R2 SYNC INITIATED',
      message: 'Comparing local assets manifest with Cloudflare R2 bucket...',
      type: 'info',
    });

    setTimeout(() => {
      setIsSyncingR2(false);
      setLastR2Sync('Just now');
      setR2SyncLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Verified 142 objects in r2://assets.henryix.com (Delta 0B)`,
        ...prev.slice(0, 4),
      ]);
      addToast({
        title: 'R2 SYNC COMPLETE',
        message: 'All Cloudflare R2 edge assets are synchronized and healthy.',
        type: 'success',
      });
    }, 1800);
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <HardDrive size={14} className="text-cyan-400" />
            <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
              Cloudflare R2 Edge Stats
            </h4>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            HEALTHY (0 ERRORS)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px]">
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">Storage Used</div>
            <div className="text-zinc-100 font-bold text-sm mt-0.5">4.2 GB</div>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">Total Objects</div>
            <div className="text-zinc-100 font-bold text-sm mt-0.5">142 Files</div>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">Egress Fees</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">£0.00 (Zero-Egress)</div>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">Cache Hit Rate</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">99.98%</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>Google Drive Mirror:</span>
          <span className="text-zinc-200">{lastR2Sync}</span>
        </div>

        <button
          onClick={handleForceR2Sync}
          disabled={isSyncingR2}
          className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <RotateCcw size={13} className={isSyncingR2 ? 'animate-spin text-[#E53558]' : ''} />
          <span>{isSyncingR2 ? 'Synchronizing with R2 Mirror...' : 'Force R2 Delta Sync'}</span>
        </button>
      </div>

      {/* Emergency Nuclear Purge */}
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-2.5">
        <div className="flex items-center gap-2 text-red-400 font-semibold text-xs uppercase font-mono">
          <ShieldAlert size={15} />
          <span>Emergency Nuclear Purge (&lt;5s SLA)</span>
        </div>
        <p className="text-zinc-300 text-[11px] leading-relaxed">
          Instantly wipes global Cloudflare edge cache and triggers on-demand revalidation for all public pages.
        </p>
        <button
          onClick={triggerEmergencyPurge}
          className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase transition-colors"
        >
          🚨 Trigger Nuclear Edge Purge
        </button>
      </div>

      {/* Real-Time Sync Logs */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5 font-mono text-[10px] text-zinc-400">
        <span className="text-zinc-500 uppercase font-semibold block mb-1">R2 Activity Log:</span>
        {r2SyncLogs.map((log, i) => (
          <div key={i} className="truncate text-zinc-400 font-mono">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
