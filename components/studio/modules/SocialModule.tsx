'use client';

import React, { useMemo, useEffect } from 'react';
import { Compass, Grid, CheckSquare, Send } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import SceneScoutView from './social/SceneScoutView';
import GridWorkbenchView from './social/GridWorkbenchView';
import MixPipelineView from './social/MixPipelineView';
import VipDispatchView from './social/VipDispatchView';

export interface SocialModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function SocialModule({
  activeView = 'social-scout',
  onNavigate,
}: SocialModuleProps) {
  const fetchContentPosts = useStudioStore((s) => s.fetchContentPosts);

  useEffect(() => {
    fetchContentPosts();
  }, [fetchContentPosts]);

  const currentMode = useMemo(() => {
    switch (activeView) {
      case 'social-grid':
        return 'grid';
      case 'social-pipeline':
        return 'pipeline';
      case 'social-vip':
        return 'vip';
      case 'social-scout':
      default:
        return 'scout';
    }
  }, [activeView]);

  return (
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      {/* Top Header & Sub-View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Social &amp; Scene Scout</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                05
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Universal event parser • 3x3 Instagram grid • Mix release pipeline • VIP SMS alerts
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl text-xs">
          <button
            onClick={() => (onNavigate ? onNavigate('social-scout') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'scout'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Compass size={13} className={currentMode === 'scout' ? 'text-amber-400' : ''} />
            <span>Scene Scout &amp; Parser</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('social-grid') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'grid'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Grid size={13} className={currentMode === 'grid' ? 'text-[#8b5cf6]' : ''} />
            <span>3x3 Instagram Grid</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('social-pipeline') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'pipeline'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <CheckSquare size={13} className={currentMode === 'pipeline' ? 'text-emerald-400' : ''} />
            <span>Mix Release Pipeline</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('social-vip') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'vip'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Send size={13} className={currentMode === 'vip' ? 'text-[#06b6d4]' : ''} />
            <span>VIP SMS Alert Dispatch</span>
          </button>
        </div>
      </div>

      {/* Dynamic Sub-View Dispatch */}
      {currentMode === 'scout' && <SceneScoutView onNavigate={onNavigate} />}
      {currentMode === 'grid' && <GridWorkbenchView onNavigate={onNavigate} />}
      {currentMode === 'pipeline' && <MixPipelineView />}
      {currentMode === 'vip' && <VipDispatchView />}
    </div>
  );
}
