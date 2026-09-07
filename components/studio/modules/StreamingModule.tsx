'use client';

import React, { useEffect, useState } from 'react';
import { Radio, BarChart2, Scissors } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import LiveBroadcastView from './streaming/LiveBroadcastView';
import AnalyticsView from './streaming/AnalyticsView';
import ClipsView from './streaming/ClipsView';

export interface StreamingModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function StreamingModule({
  activeView = 'streaming-live',
  onNavigate,
}: StreamingModuleProps) {
  const addToast = useStudioStore((s) => s.addToast);

  const currentTab =
    activeView === 'streaming-analytics'
      ? 'analytics'
      : activeView === 'streaming-clips'
      ? 'clips'
      : 'live';

  // Shared stream duration counter simulation
  const [streamDuration, setStreamDuration] = useState<number>(3842); // in seconds (~1h 4m)
  useEffect(() => {
    const timer = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Shared highlight markers
  const [highlightMarkers, setHighlightMarkers] = useState<
    Array<{ id: string; time: string; seconds: number; note: string; energy: number }>
  >([
    { id: 'mark-1', time: '00:24:18', seconds: 1458, note: 'Peak Bass Drop (MAJA - KEPT)', energy: 9.2 },
    { id: 'mark-2', time: '00:48:32', seconds: 2912, note: 'Unreleased Dubplate Reveal', energy: 10.0 },
    { id: 'mark-3', time: '01:12:05', seconds: 4325, note: 'Do It Diva Double Drop', energy: 8.8 },
    { id: 'mark-4', time: '01:34:50', seconds: 5690, note: 'Favela Funk Peak Hook', energy: 9.5 },
  ]);

  const handleMarkHighlight = (note: string = 'Peak Drop Marker') => {
    const timeStr = formatDuration(streamDuration);
    const newMarker = {
      id: `mark-${Date.now()}`,
      time: timeStr,
      seconds: streamDuration,
      note,
      energy: Number((Math.random() * 2 + 8).toFixed(1)),
    };
    setHighlightMarkers((prev) => [newMarker, ...prev]);
    addToast({
      title: '60S HIGHLIGHT MARKED',
      message: `Captured at ${timeStr}. Staged for TikTok / Reels extraction.`,
      type: 'success',
    });
  };

  return (
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      {/* 1. TOP MODULE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E53558] animate-pulse shadow-[0_0_8px_rgba(229,53,88,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Streaming Suite</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                01
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Ultra-low latency OBS bridge • Transient musical director • Stream telemetry & highlight clips
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl">
          <button
            onClick={() => (onNavigate ? onNavigate('streaming-live') : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentTab === 'live'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Radio size={13} className={currentTab === 'live' ? 'text-[#E53558]' : ''} />
            <span>Live Broadcast</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('streaming-analytics') : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentTab === 'analytics'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BarChart2 size={13} className={currentTab === 'analytics' ? 'text-[#3b82f6]' : ''} />
            <span>History & Analytics</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('streaming-clips') : null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
              currentTab === 'clips'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Scissors size={13} className={currentTab === 'clips' ? 'text-[#8b5cf6]' : ''} />
            <span>Livestream Clips</span>
          </button>
        </div>
      </div>

      {/* 2. ACTIVE SUB-VIEW */}
      {currentTab === 'live' && (
        <LiveBroadcastView
          streamDuration={streamDuration}
          formatDuration={formatDuration}
          onMarkHighlight={handleMarkHighlight}
        />
      )}

      {currentTab === 'analytics' && (
        <AnalyticsView streamDuration={streamDuration} formatDuration={formatDuration} />
      )}

      {currentTab === 'clips' && (
        <ClipsView highlightMarkers={highlightMarkers} onMarkHighlight={handleMarkHighlight} />
      )}
    </div>
  );
}
