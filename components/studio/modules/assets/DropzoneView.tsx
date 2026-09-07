'use client';

import React, { useState } from 'react';
import { UploadCloud, RefreshCw, Film } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { DROPZONE_FILES } from './types';

export default function DropzoneView() {
  const addToast = useStudioStore((s) => s.addToast);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTranscoding, setIsTranscoding] = useState(false);

  const handleSyncDrive = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast({
        title: 'GOOGLE DRIVE SYNCED',
        message: 'Checked /Website Assets folder. Found 4 intake assets ready for triage.',
        type: 'success',
      });
    }, 1500);
  };

  const handleTranscodeProxy = () => {
    setIsTranscoding(true);
    setTimeout(() => {
      setIsTranscoding(false);
      addToast({
        title: 'BATCH TRANSCODE COMPLETE',
        message: 'Generated 1080p fast-start WebM/MP4 proxies for 4 pending media files.',
        type: 'success',
      });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
              <UploadCloud size={18} className="text-[#06b6d4]" />
              Google Drive Intake Dropzone // Safe Triage
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Raw uncompressed master folder watcher: Google Drive / Website Assets / Shoots & Gigs /
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncDrive}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium text-xs flex items-center gap-1.5 transition-colors border border-white/10 disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Scanning Drive...' : 'Scan Google Drive Now'}</span>
            </button>

            <button
              onClick={handleTranscodeProxy}
              disabled={isTranscoding}
              className="px-3.5 py-2 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Film size={12} />
              <span>{isTranscoding ? 'Transcoding...' : 'Batch Transcode 1080p'}</span>
            </button>
          </div>
        </div>

        {/* Ingestion Queue Table */}
        <div className="overflow-x-auto custom-scrollbar rounded-lg border border-white/[0.06] bg-[#0c0d10]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 text-[10px] uppercase font-mono">
                <th className="p-3 font-medium">Filename</th>
                <th className="p-3 font-medium">Source Event</th>
                <th className="p-3 font-medium">Format</th>
                <th className="p-3 font-medium">Raw Size</th>
                <th className="p-3 font-medium">Triage Status</th>
                <th className="p-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {DROPZONE_FILES.map((f) => (
                <tr key={f.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-3 font-medium text-white">{f.name}</td>
                  <td className="p-3 text-zinc-400 font-sans">{f.event}</td>
                  <td className="p-3 text-zinc-500">{f.format}</td>
                  <td className="p-3 text-zinc-300">{f.size}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border ${
                        f.status === 'Ready to Publish'
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                          : f.status === 'Requires Crop'
                          ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                          : 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        addToast({
                          title: 'ASSET PUSHED TO R2',
                          message: `Converted ${f.name} to WebP/MP4 proxy on assets.henryix.com.`,
                          type: 'success',
                        });
                      }}
                      className="px-3 py-1 rounded-lg bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 hover:text-emerald-300 text-[11px] font-sans transition-colors"
                    >
                      Approve & Push to R2
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
