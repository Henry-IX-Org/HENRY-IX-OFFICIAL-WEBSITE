'use client';

import React, { useState, useMemo } from 'react';
import { Download, ShieldAlert, LayoutGrid, List, Smartphone } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { StudioAsset } from './types';

interface VaultViewProps {
  assets: StudioAsset[];
  selectedAsset: StudioAsset;
  onSelectAsset: (asset: StudioAsset) => void;
}

export default function VaultView({ assets, selectedAsset, onSelectAsset }: VaultViewProps) {
  const smartCropMode = useStudioStore((s) => s.smartCropMode);
  const setSmartCropMode = useStudioStore((s) => s.setSmartCropMode);
  const watermarkActive = useStudioStore((s) => s.watermarkActive);
  const setWatermarkActive = useStudioStore((s) => s.setWatermarkActive);
  const triggerEmergencyPurge = useStudioStore((s) => s.triggerEmergencyPurge);
  const addToast = useStudioStore((s) => s.addToast);

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState('All');

  const filteredAssets = useMemo(() => {
    if (filterType === 'All') return assets;
    if (filterType === 'Photos') return assets.filter((a) => a.type === 'photo');
    if (filterType === 'Videos') return assets.filter((a) => a.type === 'video');
    if (filterType === 'Flyers') return assets.filter((a) => a.type === 'flyer');
    return assets;
  }, [assets, filterType]);

  const publishedCount = assets.filter((a) => a.published).length;

  return (
    <div className="space-y-6">
      {/* Quick Actions & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-3.5 text-xs shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-zinc-400">
            EDGE STORAGE: <strong className="text-white font-mono">4.82 GB</strong>
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400">
            PUBLISHED ASSETS: <strong className="text-emerald-400 font-mono">{publishedCount} Live</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/epk/zip"
            download="Henry_IX_Press_Kit_2026.zip"
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:border-emerald-500/40 text-zinc-200 hover:text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download size={13} />
            <span>Download EPK (.ZIP)</span>
          </a>

          <button
            onClick={triggerEmergencyPurge}
            className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-300 hover:bg-red-900/30 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ShieldAlert size={13} />
            <span>Emergency Unpublish</span>
          </button>
        </div>
      </div>

      {/* Main Vault Workspace: Gallery & Smart Crop */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Assets List */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
            <div className="flex items-center gap-1 bg-[#14151a] p-1 rounded-lg border border-white/[0.08]">
              {(['All', 'Photos', 'Videos', 'Flyers'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterType(tab)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterType === tab
                      ? 'bg-white/[0.1] text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-[#14151a] p-1 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white/[0.1] text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white/[0.1] text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <List size={14} />
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className={`p-3 rounded-xl border bg-[#14151a] hover:border-white/20 cursor-pointer space-y-2.5 transition-all shadow-sm ${
                    selectedAsset?.id === asset.id
                      ? 'border-[#E53558] shadow-[0_0_20px_rgba(229,53,88,0.2)]'
                      : 'border-white/[0.08]'
                  }`}
                >
                  <div className="aspect-square rounded-lg bg-[#0c0d10] border border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                    <div className="text-[10px] text-zinc-500 uppercase font-mono text-center p-2">
                      {asset.type.toUpperCase()}
                      <br />
                      {asset.dimensions}
                    </div>
                    {asset.published && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono font-medium">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white truncate">{asset.title}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{asset.event}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.08] bg-[#14151a] overflow-x-auto custom-scrollbar shadow-sm">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-400 text-[10px] uppercase font-mono">
                    <th className="p-3 font-medium">Title</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Event</th>
                    <th className="p-3 font-medium">Dimensions</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 text-right font-medium">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredAssets.map((asset) => (
                    <tr
                      key={asset.id}
                      onClick={() => onSelectAsset(asset)}
                      className="hover:bg-white/[0.04] cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-medium text-white">{asset.title}</td>
                      <td className="p-3 uppercase text-zinc-400">{asset.type}</td>
                      <td className="p-3 text-zinc-400">{asset.event}</td>
                      <td className="p-3 font-mono text-[11px] text-zinc-300">{asset.dimensions}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border ${
                            asset.published
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                              : 'border-white/10 text-zinc-400'
                          }`}
                        >
                          {asset.published ? 'PUBLISHED' : 'VAULT ONLY'}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-zinc-400">{asset.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Smart Crop Guard Inspector */}
        <div className="w-full lg:w-96 rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone size={14} className="text-[#3b82f6]" />
              Smart Crop Guard // Safe Zones
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">Check UI overlay obstructions for TikTok & Instagram</p>
          </div>

          {/* Crop Mode Switcher */}
          <div className="grid grid-cols-4 gap-1.5 text-[11px] bg-[#0c0d10] p-1 rounded-lg border border-white/10">
            {[
              { id: 'none', label: 'OFF' },
              { id: 'tiktok', label: 'TIKTOK' },
              { id: 'reels', label: 'REELS' },
              { id: '4:5', label: '4:5 GRID' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setSmartCropMode(m.id as any)}
                className={`py-1 rounded font-medium transition-colors ${
                  smartCropMode === m.id
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Viewfinder Preview */}
          <div className="aspect-[9/16] rounded-lg bg-[#0c0d10] border border-white/10 relative overflow-hidden flex items-center justify-center p-4">
            <div className="text-center text-zinc-500 text-xs">
              <div className="font-medium text-zinc-300">{selectedAsset?.title || 'Select an Asset'}</div>
              <div className="text-[10px] mt-1 font-mono text-zinc-500">{selectedAsset?.dimensions || ''}</div>
            </div>

            {/* Simulated Watermark */}
            {watermarkActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-25deg]">
                <div className="text-white/20 text-lg font-bold tracking-widest font-mono border-2 border-white/20 px-4 py-2 rounded">
                  HENRY IX // PROMOTER PREVIEW
                </div>
              </div>
            )}

            {/* Smart Crop Overlays */}
            {smartCropMode === 'tiktok' && (
              <div className="absolute inset-0 pointer-events-none border border-red-500/40 p-3 flex flex-col justify-between font-mono">
                <div className="h-12 border-b border-dashed border-red-500/40 text-[9px] text-red-400">
                  TikTok Top Header Safe Zone
                </div>
                <div className="self-end w-12 h-48 border-l border-dashed border-red-500/40 text-[9px] text-red-400 p-1">
                  Action Icons
                </div>
                <div className="h-16 border-t border-dashed border-red-500/40 text-[9px] text-red-400">
                  Caption & Audio Area
                </div>
              </div>
            )}

            {smartCropMode === 'reels' && (
              <div className="absolute inset-0 pointer-events-none border border-cyan-500/40 p-3 flex flex-col justify-between font-mono">
                <div className="h-10 border-b border-dashed border-cyan-500/40 text-[9px] text-cyan-400">
                  Instagram Reels Top Margin
                </div>
                <div className="self-end w-12 h-44 border-l border-dashed border-cyan-500/40 text-[9px] text-cyan-400 p-1">
                  Like / Share Bar
                </div>
                <div className="h-14 border-t border-dashed border-cyan-500/40 text-[9px] text-cyan-400">
                  Bottom Profile & Caption
                </div>
              </div>
            )}

            {smartCropMode === '4:5' && (
              <div className="absolute inset-x-0 h-4/5 border-2 border-amber-400/60 pointer-events-none flex items-center justify-center font-mono">
                <span className="text-amber-400/80 text-[10px] font-bold">4:5 PORTRAIT GRID SAFE ZONE</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                setWatermarkActive(!watermarkActive);
                addToast({
                  title: watermarkActive ? 'WATERMARK REMOVED' : 'WATERMARK APPLIED',
                  message: watermarkActive
                    ? 'Clean original restored.'
                    : 'Burned HENRY IX PROMOTER PREVIEW watermark overlay.',
                  type: 'info',
                });
              }}
              className={`w-full py-2.5 rounded-lg text-xs font-medium border transition-colors ${
                watermarkActive
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:bg-white/[0.08]'
              }`}
            >
              {watermarkActive ? '✓ Watermark Overlay Active' : 'Burn-in Promoter Watermark'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
