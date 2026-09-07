'use client';

import React, { useState } from 'react';
import { FolderOpen, Copy } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function AssetInspectorTab() {
  const addToast = useStudioStore((s) => s.addToast);

  const [selectedAssetId, setSelectedAssetId] = useState('asset-1');
  const [vaultAssets, setVaultAssets] = useState([
    { id: 'asset-1', title: 'Corner N1 - Crowd Reaction 04', type: 'Photo', dimensions: '2160x3840 (9:16)', size: '1.8 MB', codec: 'WebP 300dpi', r2Key: 'Gigs/Corner_N1/Crowd_04.webp', published: true },
    { id: 'asset-2', title: 'Booth Drop Overhead (0:45s)', type: 'Video', dimensions: '1080x1920 (9:16)', size: '24.2 MB', codec: 'Fast-Start MP4 H.264', r2Key: 'Videos/KC4_Booth_Drop_1080p.mp4', published: true },
    { id: 'asset-3', title: 'Official London Tour Poster', type: 'Flyer', dimensions: '2400x3000 (4:5)', size: '3.4 MB', codec: 'WebP Lossless', r2Key: 'Flyers/Royal_Court_Tour.webp', published: false },
    { id: 'asset-4', title: 'CDJ-3000 Macro Hands', type: 'Photo', dimensions: '3840x2160 (16:9)', size: '2.1 MB', codec: 'WebP High-Q', r2Key: 'Gallery/CDJ_Hands_Macro.webp', published: true },
    { id: 'asset-5', title: 'Press Shot 2026 // Studio Red', type: 'Photo', dimensions: '3000x3000 (1:1)', size: '4.5 MB', codec: 'WebP 300dpi', r2Key: 'EPK/Henry_IX_Press_01_300dpi.webp', published: true },
  ]);

  const selectedAsset = vaultAssets.find((a) => a.id === selectedAssetId) || vaultAssets[0];

  const handleTogglePublishAsset = (id: string) => {
    setVaultAssets((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const nextPub = !a.published;
          addToast({
            title: nextPub ? 'ASSET PUBLISHED' : 'ASSET UNPUBLISHED',
            message: nextPub
              ? `Pushed ${a.title} to live CDN.`
              : `Triggered <5s purge for ${a.r2Key}.`,
            type: nextPub ? 'success' : 'warning',
          });
          return { ...a, published: nextPub };
        }
        return a;
      })
    );
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <FolderOpen size={14} className="text-purple-400" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            Asset Metadata Inspector
          </h4>
        </div>
        <span className="text-purple-400 font-mono text-[10px] font-semibold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
          R2 MIRROR
        </span>
      </div>

      {/* Asset Selector */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-2">
        <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium">Select Vault Asset:</span>
        <select
          value={selectedAssetId}
          onChange={(e) => setSelectedAssetId(e.target.value)}
          className="w-full bg-[#1b1c22] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-[#E53558]/50"
        >
          {vaultAssets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.title} ({a.type})
            </option>
          ))}
        </select>
      </div>

      {/* Selected Asset Metadata Card */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-zinc-100 text-sm tracking-tight">{selectedAsset.title}</div>
            <div className="text-zinc-500 text-[10px] font-mono mt-0.5">{selectedAsset.r2Key}</div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-zinc-300 font-mono font-medium uppercase">
            {selectedAsset.type}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono pt-2 border-t border-white/[0.06]">
          <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
            <span className="text-zinc-500 text-[9px] block uppercase">Dimensions</span>
            <span className="text-zinc-200 font-semibold">{selectedAsset.dimensions}</span>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
            <span className="text-zinc-500 text-[9px] block uppercase">File Size</span>
            <span className="text-zinc-200 font-semibold">{selectedAsset.size}</span>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
            <span className="text-zinc-500 text-[9px] block uppercase">Codec / Format</span>
            <span className="text-zinc-200 font-semibold">{selectedAsset.codec}</span>
          </div>
          <div className="p-2 rounded-lg bg-black/30 border border-white/[0.04]">
            <span className="text-zinc-500 text-[9px] block uppercase">CDN Status</span>
            <span className={`font-semibold ${selectedAsset.published ? 'text-emerald-400' : 'text-amber-400'}`}>
              {selectedAsset.published ? 'Live on CDN' : 'Vault Only'}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex gap-2">
          <button
            onClick={() => handleTogglePublishAsset(selectedAsset.id)}
            className={`flex-1 py-2 rounded-xl font-semibold text-xs uppercase transition-colors ${
              selectedAsset.published
                ? 'bg-white/[0.05] border border-white/[0.1] text-zinc-300 hover:border-red-500/50 hover:text-red-400'
                : 'bg-emerald-500 text-black hover:bg-emerald-400'
            }`}
          >
            {selectedAsset.published ? 'Unpublish (<5s Purge)' : 'Publish to Website'}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://assets.henryix.com/${selectedAsset.r2Key}`);
              addToast({ title: 'R2 URL COPIED', message: 'Copied edge CDN link to clipboard.', type: 'info' });
            }}
            className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white transition-colors"
            title="Copy URL"
          >
            <Copy size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
