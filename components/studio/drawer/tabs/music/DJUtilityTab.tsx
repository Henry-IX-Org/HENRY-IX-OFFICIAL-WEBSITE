'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Pause, Sliders } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function DJUtilityTab() {
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const pitchSemitones = useStudioStore((s) => s.pitchSemitones);
  const setPitchSemitones = useStudioStore((s) => s.setPitchSemitones);
  const addToast = useStudioStore((s) => s.addToast);

  const [scrubPosition, setScrubPosition] = useState(42);

  // Real-time Waveform Scrubbing Simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setScrubPosition((prev) => (prev >= currentTrack.duration ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.duration]);

  // Calculated shifted Camelot key based on real-time pitch vocoder semitones
  const shiftedCamelotKey = useMemo(() => {
    const rawKey = currentTrack.key || '8A';
    if (pitchSemitones === 0) return rawKey;
    const match = rawKey.match(/^(\d{1,2})([AB])$/);
    if (!match) return rawKey;
    const num = parseInt(match[1]);
    const letter = match[2];
    const shiftedNum = (((num - 1 + pitchSemitones * 7) % 12 + 12) % 12) + 1;
    return `${shiftedNum}${letter}`;
  }, [currentTrack.key, pitchSemitones]);

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Active Live Deck Track */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={13} className="text-cyan-400" />
            <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">Live Deck 1</h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-medium">
            ACTIVE DECK
          </span>
        </div>
        <div className="text-sm font-semibold text-zinc-100 tracking-tight">{currentTrack.title}</div>
        <div className="text-zinc-400 text-[11px] flex items-center flex-wrap gap-1.5 font-mono">
          <span>{currentTrack.artist}</span>
          <span>•</span>
          <span>{currentTrack.bpm.toFixed(1)} BPM</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">{currentTrack.key}</span>
          {pitchSemitones !== 0 && (
            <span className="text-amber-400 font-bold">
              ➔ {shiftedCamelotKey} ({pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones}st)
            </span>
          )}
        </div>
      </div>

      {/* Waveform Scrubber */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3">
        <div className="flex justify-between items-center text-[11px] font-mono">
          <span className="text-zinc-400 uppercase tracking-wider text-[10px]">3-Band Waveform & Scrubber</span>
          <span className="text-zinc-300">
            {Math.floor(scrubPosition / 60)}:{(Math.floor(scrubPosition) % 60).toString().padStart(2, '0')} / {Math.floor(currentTrack.duration / 60)}:{(currentTrack.duration % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const newPos = pct * currentTrack.duration;
            setScrubPosition(newPos);
            addToast({
              title: 'CUE SCRUB',
              message: `Jumped to ${Math.floor(newPos / 60)}:${(Math.floor(newPos) % 60).toString().padStart(2, '0')}.`,
              type: 'info',
            });
          }}
          className="h-14 bg-black/60 border border-white/[0.06] rounded-lg relative cursor-pointer group overflow-hidden flex items-center px-1.5"
          title="Click to seek playhead"
        >
          <div className="w-full h-10 flex items-center justify-between gap-0.5 opacity-80">
            {Array.from({ length: 48 }).map((_, i) => {
              const h = 25 + Math.sin(i * 0.4) * 20 + Math.cos(i * 0.8) * 15;
              const color = i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#10b981' : '#E53558';
              return (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${Math.max(15, h)}%`,
                    backgroundColor: color,
                  }}
                />
              );
            })}
          </div>

          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] z-10 transition-all"
            style={{ left: `${(scrubPosition / currentTrack.duration) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={togglePlay}
            className={`px-4 py-2 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors ${
              isPlaying
                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'bg-[#E53558] text-white hover:bg-[#c92646]'
            }`}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
            <span>{isPlaying ? 'PAUSE DECK' : 'PLAY DECK'}</span>
          </button>

          <span className="text-[10px] text-zinc-500 font-mono">
            {isPlaying ? 'TRANSPORT: ACTIVE' : 'TRANSPORT: STOPPED'}
          </span>
        </div>
      </div>

      {/* Real-Time Pitch Shifter */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="text-zinc-400 uppercase tracking-wider text-[10px] font-mono">Real-Time Pitch Shifter</h4>
          <span className="font-mono text-[#E53558] font-semibold text-[11px]">
            {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} SEMITONES
            {pitchSemitones !== 0 && (
              <span className="text-amber-400 ml-1.5">({shiftedCamelotKey})</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-1.5">
          {[-2, -1, 0, 1, 2].map((st) => (
            <button
              key={st}
              onClick={() => {
                setPitchSemitones(st);
                addToast({
                  title: 'KEY SHIFT APPLIED',
                  message: st === 0 ? 'Original key restored.' : `Pitch shifted by ${st > 0 ? `+${st}` : st} semitones.`,
                  type: 'info',
                });
              }}
              className={`flex-1 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors ${
                pitchSemitones === st
                  ? 'bg-[#E53558] text-white border-[#E53558]'
                  : 'bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:border-white/20'
              }`}
            >
              {st === 0 ? 'ORIG' : st > 0 ? `♯ +${st}` : `♭ ${st}`}
            </button>
          ))}
        </div>
      </div>

      {/* Hot Cues */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-2.5">
        <h4 className="text-zinc-400 uppercase tracking-wider text-[10px] font-mono">CDJ-3000 Performance Cues</h4>
        <div className="space-y-1.5 text-[11px]">
          {(currentTrack.cues || [
            { letter: 'A', name: 'Intro Beat', time: 0, color: '#10b981' },
            { letter: 'B', name: 'Vocal Breakdown', time: 64, color: '#06b6d4' },
            { letter: 'C', name: 'Main Bass Drop', time: 92, color: '#E53558' },
            { letter: 'D', name: 'Secondary Hook', time: 160, color: '#eab308' },
            { letter: 'E', name: 'Double Drop Bridge', time: 224, color: '#a855f7' },
            { letter: 'F', name: 'Outro Mix-Out', time: 288, color: '#f97316' },
          ]).map((cue: any) => (
            <div
              key={cue.letter}
              onClick={() => {
                setScrubPosition(cue.time);
                addToast({
                  title: `CUE ${cue.letter} TRIGGERED`,
                  message: `Jumped to ${cue.name} (${Math.floor(cue.time / 60)}:${(cue.time % 60).toString().padStart(2, '0')}).`,
                  type: 'info',
                });
              }}
              className="flex justify-between items-center p-2.5 rounded-lg border-l-3 bg-black/40 hover:bg-white/[0.04] cursor-pointer transition-colors border border-white/[0.04]"
              style={{ borderLeftColor: cue.color }}
            >
              <span className="font-medium text-zinc-200">
                <strong className="text-white font-mono mr-1.5">CUE {cue.letter}:</strong>
                {cue.name}
              </span>
              <span className="text-zinc-500 font-mono text-[10px]">
                {Math.floor(cue.time / 60)}:{(cue.time % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
