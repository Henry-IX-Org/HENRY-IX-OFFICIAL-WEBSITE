'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OverlayPage() {
  const [trackId, setTrackId] = useState('CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]');
  const [bpm, setBpm] = useState<number>(150);
  const [artist] = useState('HENRY IX');
  const [isVisible] = useState(true);

  // Poll live status endpoint
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/live-status');
        if (res.ok) {
          const data: any = await res.json();
          if (data?.state?.currentTrack) {
            setTrackId(data.state.currentTrack);
          }
          if (data?.state?.bpm) {
            setBpm(data.state.bpm);
          }
        }
      } catch {
        // Keep fallback
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-transparent flex flex-col justify-end p-12 pointer-events-none select-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: -20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-2xl bg-black/90 border border-[#D8163F] p-6 relative overflow-hidden shadow-[0_0_25px_rgba(216,22,63,0.45)]"
          >
            {/* Bayer Halftone Dither Texture */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bayer-dither" 
              style={{
                backgroundImage: 'radial-gradient(#D8163F 1px, transparent 1px)',
                backgroundSize: '4px 4px'
              }} 
            />
            
            <div className="relative z-10 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#D8163F] text-xs tracking-widest uppercase font-bold">
                  [LIVE AUDIO FEED // OBS OVERLAY]
                </span>
                <span className="text-zinc-400 text-xs font-bold">
                  {bpm} BPM
                </span>
              </div>

              <h1 className="text-3xl text-white font-bold tracking-tight uppercase font-avathe" style={{ fontFamily: 'var(--font-avathe), sans-serif' }}>
                {artist}
              </h1>

              <p className="text-white/95 text-base mt-1.5 flex items-center gap-2">
                <span className="text-[#D8163F] animate-pulse">▶</span>
                <span className="tracking-wide">{trackId}</span>
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-900 pt-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#D8163F] animate-pulse shadow-[0_0_8px_rgba(216,22,63,0.8)]" />
                  <span className="text-zinc-400 uppercase">
                    ON AIR // LIVE BROADCAST
                  </span>
                </div>
                <span className="text-zinc-500">HENRYIX.COM</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
