"use client";

import React, { useEffect, useRef, useCallback } from 'react';

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

export const ThreeBandColorWaveform: React.FC<ThreeBandColorWaveformProps> = ({
  audioBuffer,
  progress = 0,
  onScrub,
  width = 800,
  height = 120,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // If no buffer, draw mock 3-band waveform (CDJ-3000 style)
    // Lows: Blue, Mids: Amber/Orange, Highs: White/Grey
    const barWidth = 2;
    const gap = 1;
    const numBars = Math.floor(width / (barWidth + gap));

    const playheadX = progress * width;

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + gap);
      
      const lowHeight = Math.abs(Math.sin(i * 0.1)) * (height * 0.4) + 10;
      const midHeight = Math.abs(Math.cos(i * 0.15)) * (height * 0.3) + 5;
      const highHeight = Math.abs(Math.sin(i * 0.05 + 1)) * (height * 0.2) + 2;
      
      const totalHeight = lowHeight + midHeight + highHeight;
      const normalizedLows = (lowHeight / totalHeight) * height * 0.8;
      const normalizedMids = (midHeight / totalHeight) * height * 0.8;
      const normalizedHighs = (highHeight / totalHeight) * height * 0.8;

      const isPlayed = x < playheadX;
      
      const drawBand = (yBase: number, h: number, color: string, playedColor: string) => {
        ctx.fillStyle = isPlayed ? playedColor : color;
        ctx.fillRect(x, (height / 2) - yBase - h, barWidth, h);
        ctx.fillRect(x, (height / 2) + yBase, barWidth, h);
      };

      drawBand(normalizedLows + normalizedMids, normalizedHighs, '#444444', '#ffffff');
      drawBand(normalizedLows, normalizedMids, '#b45309', '#f59e0b');
      drawBand(0, normalizedLows, '#1d4ed8', '#3b82f6');
    }

    ctx.fillStyle = '#D8163F';
    ctx.fillRect(playheadX, 0, 2, height);
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(216, 22, 63, 0.45)';
    ctx.fillRect(playheadX - 1, 0, 4, height);
    ctx.shadowBlur = 0;

  }, [progress, width, height, audioBuffer]);

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
};

export default ThreeBandColorWaveform;
