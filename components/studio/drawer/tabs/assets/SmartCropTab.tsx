'use client';

import React, { useState } from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function SmartCropTab() {
  const smartCropMode = useStudioStore((s) => s.smartCropMode);
  const setSmartCropMode = useStudioStore((s) => s.setSmartCropMode);
  const watermarkActive = useStudioStore((s) => s.watermarkActive);
  const setWatermarkActive = useStudioStore((s) => s.setWatermarkActive);
  const addToast = useStudioStore((s) => s.addToast);

  const [watermarkOpacity, setWatermarkOpacity] = useState(85);
  const [watermarkPos, setWatermarkPos] = useState<'bottom-right' | 'center' | 'top-right'>('bottom-right');

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
          <Smartphone size={14} className="text-cyan-400" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            Smart Crop Guard // Safe-Zone
          </h4>
        </div>

        {/* Aspect Ratio Buttons */}
        <div className="space-y-1.5">
          <span className="text-zinc-400 text-[10px] uppercase font-mono font-medium">Target Aspect Ratio:</span>
          <div className="grid grid-cols-4 gap-1.5">
            {(['none', 'tiktok', 'reels', '4:5'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setSmartCropMode(mode);
                  addToast({ title: 'CROP MODE UPDATED', message: `Overlay set to ${mode.toUpperCase()}.`, type: 'info' });
                }}
                className={`py-2 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                  smartCropMode === mode
                    ? 'bg-[#E53558] text-white border-[#E53558]'
                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-white/20'
                }`}
              >
                {mode === 'none' ? 'ORIG' : mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Safe Zone HUD Wireframe */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2 font-mono text-[10px]">
          <div className="p-2 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 flex justify-between">
            <span>▲ TOP 10% DANGER ZONE</span>
            <span className="text-zinc-500">(Status / Search)</span>
          </div>
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 flex justify-between items-center h-12">
            <span className="font-semibold">[ 4:5 FEED SAFE BOX ]</span>
            <span className="text-[9px] text-zinc-400">DJ Hands & Track ID Clear</span>
          </div>
          <div className="p-2 rounded-lg border border-red-500/30 bg-red-950/20 text-red-400 flex justify-between">
            <span>▼ BOTTOM 20% DANGER ZONE</span>
            <span className="text-zinc-500">(Captions & Audio)</span>
          </div>
        </div>

        <div className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1.5 font-mono">
          <CheckCircle2 size={13} />
          <span>[✓ SAFE] Visual focal point clear of UI occlusion.</span>
        </div>
      </div>

      {/* Promoter Preview Watermark Burn-in */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            Promoter Preview Watermark
          </h4>
          <button
            onClick={() => {
              const nextState = !watermarkActive;
              setWatermarkActive(nextState);
              addToast({
                title: nextState ? 'WATERMARK ENGAGED' : 'WATERMARK DISABLED',
                message: nextState ? 'Promoter preview stamp active on exports.' : 'Clean master mode.',
                type: 'info',
              });
            }}
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold transition-colors ${
              watermarkActive
                ? 'bg-[#E53558] text-white'
                : 'bg-white/[0.06] border border-white/[0.08] text-zinc-400'
            }`}
          >
            {watermarkActive ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Stamps <strong className="text-zinc-200">&ldquo;HENRY IX // PROMOTER PREVIEW&rdquo;</strong> to safeguard unreleased dubs and set cuts before announcements.
        </p>

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06] text-[11px] font-mono">
          <span className="text-zinc-400">OPACITY: {watermarkOpacity}%</span>
          <input
            type="range"
            min={20}
            max={100}
            value={watermarkOpacity}
            onChange={(e) => setWatermarkOpacity(parseInt(e.target.value))}
            className="w-32 accent-[#E53558]"
          />
        </div>

        <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-[11px]">
          <span className="text-zinc-400 uppercase font-mono text-[10px] font-medium">Position:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {(['bottom-right', 'center', 'top-right'] as const).map((pos) => (
              <button
                key={pos}
                onClick={() => {
                  setWatermarkPos(pos);
                  addToast({ title: 'WATERMARK POSITION', message: `Anchor set to ${pos.replace('-', ' ')}.`, type: 'info' });
                }}
                className={`py-1.5 rounded-lg border text-[11px] font-mono capitalize transition-colors ${
                  watermarkPos === pos
                    ? 'bg-[#E53558] text-white border-[#E53558] font-bold'
                    : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:border-white/20'
                }`}
              >
                {pos.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
