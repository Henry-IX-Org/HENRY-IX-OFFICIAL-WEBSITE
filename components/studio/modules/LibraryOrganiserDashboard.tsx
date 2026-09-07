'use client';

import React, { useState } from 'react';
import {
  Layers,
  Wand2,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import DuplicateDetectiveBay from './library/DuplicateDetectiveBay';
import TitleSanitizerBay from './library/TitleSanitizerBay';
import SmartTagBay from './library/SmartTagBay';
import ArtworkEmbedderBay from './library/ArtworkEmbedderBay';
import LinkResolverBay from './library/LinkResolverBay';
import HotCueAuditBay from './library/HotCueAuditBay';

export interface LibraryOrganiserDashboardProps {
  onNavigate?: (view: string) => void;
}

export default function LibraryOrganiserDashboard({
  onNavigate,
}: LibraryOrganiserDashboardProps = {}) {
  const addToast = useStudioStore((s) => s.addToast);
  const trackCount = useStudioStore((s) => s.trackCollection.length);

  const [activeBay, setActiveBay] = useState<number>(1);
  const [isScanning, setIsScanning] = useState(false);

  const runBayScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      addToast({
        title: 'HEALTH AUDIT COMPLETE',
        message: `Scanned ${trackCount} tracks in local library. 1 duplicate, 3 sanitization candidates identified.`,
        type: 'success',
      });
    }, 1200);
  };

  return (
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      {/* Repair Suite Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Library Organiser</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                6 Bays
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Duplicate detective • Bootleg title sanitization • Smart tag recommender • Pioneer cue audit
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl text-xs">
          <button
            onClick={() => (onNavigate ? onNavigate('music-all') : null)}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>Master Collection</span>
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('music-set-planning') : null)}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>Set Planning</span>
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('music-organiser') : null)}
            className="px-3 py-1.5 rounded-lg font-medium transition-all bg-white/[0.1] text-white shadow-sm"
          >
            <span>Organiser (6 Bays)</span>
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('music-radar') : null)}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>Music Radar</span>
          </button>
          <button
            onClick={() => (onNavigate ? onNavigate('music-hardware') : null)}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>USB Redundancy</span>
          </button>

          <button
            onClick={runBayScan}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm flex items-center gap-1.5 ml-2"
          >
            <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scanning...' : 'Run Health Audit'}</span>
          </button>
        </div>
      </div>

      {/* Six Repair Bays Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        {[
          { id: 1, name: '1. Duplicates', icon: Layers, desc: 'Levenshtein ±0.5s' },
          { id: 2, name: '2. Sanitizer', icon: Wand2, desc: '112 Bootleg Strings' },
          { id: 3, name: '3. Smart Tags', icon: Sparkles, desc: 'Camelot & Energy' },
          { id: 4, name: '4. Artwork', icon: ImageIcon, desc: '3000x3000px Hi-Res' },
          { id: 5, name: '5. Link Resolver', icon: LinkIcon, desc: 'SC / Spotify / Beatport' },
          { id: 6, name: '6. Hot Cue Audit', icon: Sliders, desc: 'Pioneer 6-Tier Colors' },
        ].map((bay) => {
          const Icon = bay.icon;
          const isActive = activeBay === bay.id;
          return (
            <button
              key={bay.id}
              onClick={() => setActiveBay(bay.id)}
              className={`p-3.5 rounded-xl border text-left transition-all shadow-sm ${
                isActive
                  ? 'border-white/20 bg-white/[0.08] text-white shadow-md'
                  : 'border-white/[0.06] bg-[#14151a] text-zinc-400 hover:text-zinc-200 hover:bg-[#1b1c22]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-xs text-white">{bay.name}</span>
                <Icon size={13} className={isActive ? 'text-[#E53558]' : 'text-zinc-500'} />
              </div>
              <div className="text-[11px] text-zinc-400 truncate">{bay.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Active Repair Bay Workbench */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-5 shadow-sm">
        {activeBay === 1 && <DuplicateDetectiveBay />}
        {activeBay === 2 && <TitleSanitizerBay />}
        {activeBay === 3 && <SmartTagBay />}
        {activeBay === 4 && <ArtworkEmbedderBay />}
        {activeBay === 5 && <LinkResolverBay />}
        {activeBay === 6 && <HotCueAuditBay />}
      </div>
    </div>
  );
}
