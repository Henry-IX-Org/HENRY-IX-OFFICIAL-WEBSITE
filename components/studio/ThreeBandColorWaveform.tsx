"use client";

import React, { useEffect, useRef, useCallback, useMemo } from 'react';

interface ThreeBandColorWaveformProps {
  audioBuffer?: AudioBuffer | null;
  progress?: number; // 0 to 1
  onScrub?: (progress: number) => void;
  width?: number;
  height?: number;
  className?: string;
}

// Hot Cue Colors
export const HOT_CUE_COLORS = {
  Drop: 'rgba(211,15,49,1)', // Red
  Breakdown: 'rgba(34,211,238,1)', // Blue
  Vocal: 'rgba(234,179,8,1)' // Yellow
};

const BAR_WIDTH = 2;
const GAP = 1;

export const ThreeBandColorWaveform: React.FC<ThreeBandColorWaveformProps> = React.memo(({
  audioBuffer,
  progress = 0,
  onScrub,
  width = 800,
  height = 120,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const numBars = Math.floor(width / (BAR_WIDTH + GAP));

  // Precompute static 3-band bar heights once per canvas dimension resize
  const bars = useMemo(() => {
    return Array.from({ length: numBars }, (_, i) => {
      const x = i * (BAR_WIDTH + GAP);
      const lowHeight = Math.abs(Math.sin(i * 0.1)) * (height * 0.4) + 10;
      const midHeight = Math.abs(Math.cos(i * 0.15)) * (height * 0.3) + 5;
      const highHeight = Math.abs(Math.sin(i * 0.05 + 1)) * (height * 0.2) + 2;

      const totalHeight = lowHeight + midHeight + highHeight;
      return {
        x,
        lows: (lowHeight / totalHeight) * height * 0.8,
        mids: (midHeight / totalHeight) * height * 0.8,
        highs: (highHeight / totalHeight) * height * 0.8,
      };
    });
  }, [numBars, height]);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const playheadX = progress * width;
    const centerY = height / 2;
    const splitIndex = Math.min(bars.length, Math.max(0, Math.floor(playheadX / (BAR_WIDTH + GAP))));

    // Batch Highs - Played (White/Light Grey)
    ctx.beginPath();
    for (let i = 0; i < splitIndex; i++) {
      const b = bars[i];
      const yBase = b.lows + b.mids;
      ctx.rect(b.x, centerY - yBase - b.highs, BAR_WIDTH, b.highs);
      ctx.rect(b.x, centerY + yBase, BAR_WIDTH, b.highs);
    }
    ctx.fillStyle = '#e4e4e7';
    ctx.fill();

    // Batch Highs - Unplayed (Zinc Dark Grey)
    ctx.beginPath();
    for (let i = splitIndex; i < bars.length; i++) {
      const b = bars[i];
      const yBase = b.lows + b.mids;
      ctx.rect(b.x, centerY - yBase - b.highs, BAR_WIDTH, b.highs);
      ctx.rect(b.x, centerY + yBase, BAR_WIDTH, b.highs);
    }
    ctx.fillStyle = '#3f3f46';
    ctx.fill();

    // Batch Mids - Played (Bright Cyan)
    ctx.beginPath();
    for (let i = 0; i < splitIndex; i++) {
      const b = bars[i];
      ctx.rect(b.x, centerY - b.lows - b.mids, BAR_WIDTH, b.mids);
      ctx.rect(b.x, centerY + b.lows, BAR_WIDTH, b.mids);
    }
    ctx.fillStyle = '#06b6d4';
    ctx.fill();

    // Batch Mids - Unplayed (Deep Cyan)
    ctx.beginPath();
    for (let i = splitIndex; i < bars.length; i++) {
      const b = bars[i];
      ctx.rect(b.x, centerY - b.lows - b.mids, BAR_WIDTH, b.mids);
      ctx.rect(b.x, centerY + b.lows, BAR_WIDTH, b.mids);
    }
    ctx.fillStyle = '#0891b2';
    ctx.fill();

    // Batch Lows - Played (Vibrant Blue)
    ctx.beginPath();
    for (let i = 0; i < splitIndex; i++) {
      const b = bars[i];
      ctx.rect(b.x, centerY - b.lows, BAR_WIDTH, b.lows);
      ctx.rect(b.x, centerY, BAR_WIDTH, b.lows);
    }
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    // Batch Lows - Unplayed (Dark Blue)
    ctx.beginPath();
    for (let i = splitIndex; i < bars.length; i++) {
      const b = bars[i];
      ctx.rect(b.x, centerY - b.lows, BAR_WIDTH, b.lows);
      ctx.rect(b.x, centerY, BAR_WIDTH, b.lows);
    }
    ctx.fillStyle = '#2563eb';
    ctx.fill();

    // Playhead Needle
    ctx.fillStyle = '#E53558';
    ctx.fillRect(playheadX, 0, 2, height);

    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(229, 53, 88, 0.4)';
    ctx.fillRect(playheadX - 1, 0, 4, height);
    ctx.shadowBlur = 0;
  }, [progress, width, height, bars]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onScrub || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let clientX = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }
    
    const x = clientX - rect.left;
    const newProgress = Math.max(0, Math.min(1, x / rect.width));
    onScrub(newProgress);
  };

  return (
    <div 
      ref={containerRef}
      className="relative bg-black border border-[#D8163F]/20 cursor-pointer overflow-hidden"
      style={{ height }}
      onMouseDown={(e) => {
        handleInteraction(e);
        const handleMouseMove = (ev: MouseEvent) => handleInteraction(ev as any);
        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
      onTouchStart={(e) => {
        handleInteraction(e);
        const handleTouchMove = (ev: TouchEvent) => handleInteraction(ev as any);
        const handleTouchEnd = () => {
          document.removeEventListener('touchmove', handleTouchMove);
          document.removeEventListener('touchend', handleTouchEnd);
        };
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full block"
      />
      <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}>
      </div>
    </div>
  );
});

ThreeBandColorWaveform.displayName = 'ThreeBandColorWaveform';

export default ThreeBandColorWaveform;
