'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function TelemetryTab() {
  const addToast = useStudioStore((s) => s.addToast);
  const [streamDuration, setStreamDuration] = useState(5058); // 01:24:18

  useEffect(() => {
    const timer = setInterval(() => {
      setStreamDuration((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMarkClip = () => {
    const timestamp = formatTime(streamDuration);
    addToast({
      title: 'STREAM CLIP MARKED',
      message: `Marked 60s highlight at ${timestamp}.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-zinc-400 uppercase tracking-wider text-[11px] font-medium font-mono">OBS Telemetry</span>
          </div>
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            LIVE ON AIR
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-[11px] font-mono">
          <div className="p-2.5 bg-[#0c0d10] border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[10px] uppercase">FRAMERATE</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">60.0 FPS</div>
          </div>
          <div className="p-2.5 bg-[#0c0d10] border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[10px] uppercase">BITRATE</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">6,240 kbps</div>
          </div>
          <div className="p-2.5 bg-[#0c0d10] border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[10px] uppercase">DROPPED FRAMES</div>
            <div className="text-white font-bold text-sm mt-0.5">0 (0.0%)</div>
          </div>
          <div className="p-2.5 bg-[#0c0d10] border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[10px] uppercase">RECORD TIME</div>
            <div className="text-white font-bold text-sm mt-0.5">{formatTime(streamDuration)}</div>
          </div>
        </div>

        {/* Audio VU Monitor */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>BOOTH MASTER REC OUT</span>
            <span className="text-emerald-400 font-medium">-3.2 dB (Clean)</span>
          </div>
          <div className="h-2.5 bg-[#0c0d10] border border-white/[0.06] rounded-full overflow-hidden flex items-center px-0.5">
            <div className="h-1.5 w-[75%] bg-gradient-to-r from-emerald-500 via-amber-500 to-[#E53558] rounded-full" />
          </div>
        </div>

        {/* Action Macros */}
        <div className="pt-2 border-t border-white/[0.08] flex flex-wrap gap-2">
          <button
            onClick={handleMarkClip}
            className="flex-1 min-w-[120px] py-2 rounded-lg bg-[#E53558] text-white font-medium text-xs hover:bg-[#d82a4d] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Sparkles size={13} />
            <span>Mark 60s Clip</span>
          </button>
          <button
            onClick={() => {
              addToast({
                title: 'STANDBY SCENE ENGAGED',
                message: 'Auto-switched OBS to 5-minute countdown intermission.',
                type: 'warning',
              });
            }}
            className="flex-1 min-w-[120px] py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
          >
            ☕ Standby Break
          </button>
        </div>
      </div>
    </div>
  );
}
