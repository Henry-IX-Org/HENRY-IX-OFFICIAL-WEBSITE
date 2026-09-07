'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Image as ImageIcon, FolderOpen, Activity, Share2 } from 'lucide-react';
import { StudioAsset, INITIAL_VAULT_ASSETS } from './assets/types';
import VaultView from './assets/VaultView';
import DropzoneView from './assets/DropzoneView';
import R2MirrorView from './assets/R2MirrorView';
import EPKHubView from './assets/EPKHubView';

export type { StudioAsset };
export { INITIAL_VAULT_ASSETS };

export interface AssetsModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function AssetsModule({
  activeView = 'assets-vault',
  onNavigate,
}: AssetsModuleProps) {
  const [assets, setAssets] = useState<StudioAsset[]>(INITIAL_VAULT_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<StudioAsset>(INITIAL_VAULT_ASSETS[0]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  const fetchLiveAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const res = await fetch('/api/studio/assets');
      if (res.ok) {
        const data: any = await res.json();
        if (data.success && Array.isArray(data.assets) && data.assets.length > 0) {
          setAssets(data.assets);
          setSelectedAsset((prev) => data.assets.find((a: StudioAsset) => a.id === prev?.id) || data.assets[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading live studio assets:', err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  useEffect(() => {
    fetchLiveAssets();
  }, []);

  const currentMode = useMemo(() => {
    switch (activeView) {
      case 'assets-dropzone':
        return 'dropzone';
      case 'assets-r2':
        return 'r2';
      case 'assets-epk':
        return 'epk';
      case 'assets-vault':
      default:
        return 'vault';
    }
  }, [activeView]);

  return (
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      {/* Top Module Header & Segmented Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Assets & Cloudflare R2</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                03
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            0-egress CDN • Google Drive intake • Smart crop guard • 1-click EPK builder
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl">
          <button
            onClick={() => (onNavigate ? onNavigate('assets-vault') : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentMode === 'vault'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <ImageIcon size={13} className={currentMode === 'vault' ? 'text-[#8b5cf6]' : ''} />
            <span>Asset Vault</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('assets-dropzone') : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentMode === 'dropzone'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FolderOpen size={13} className={currentMode === 'dropzone' ? 'text-[#3b82f6]' : ''} />
            <span>Intake Dropzone</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('assets-r2') : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentMode === 'r2'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Activity size={13} className={currentMode === 'r2' ? 'text-[#06b6d4]' : ''} />
            <span>R2 Storage Mirror</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('assets-epk') : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentMode === 'epk'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Share2 size={13} className={currentMode === 'epk' ? 'text-[#10b981]' : ''} />
            <span>Press Kit / EPK Hub</span>
          </button>
        </div>
      </div>

      {/* Dynamic Sub-View Dispatch */}
      {currentMode === 'vault' && (
        <VaultView
          assets={assets}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
        />
      )}
      {currentMode === 'dropzone' && <DropzoneView />}
      {currentMode === 'r2' && <R2MirrorView />}
      {currentMode === 'epk' && <EPKHubView />}
    </div>
  );
}
