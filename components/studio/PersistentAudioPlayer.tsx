'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Cast, 
  Disc,
  Layers,
  Sparkles,
  Maximize2,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  Trash2,
  X
} from 'lucide-react';
import ThreeBandColorWaveform from './ThreeBandColorWaveform';
import { useStudioStore, StudioTrack } from '@/store/studioStore';

export type PlayerDisplayState = 'minimised' | 'docked' | 'half-deck' | 'fullscreen';

export interface PersistentAudioPlayerProps {
  displayState: PlayerDisplayState;
  setDisplayState: (state: PlayerDisplayState) => void;
  activeModule?: string;
}

export default function PersistentAudioPlayer({
  displayState,
  setDisplayState,
  activeModule,
}: PersistentAudioPlayerProps) {
  const currentTrack = useStudioStore(s => s.currentTrack);
  const isPlaying = useStudioStore(s => s.isPlaying);
  const togglePlay = useStudioStore(s => s.togglePlay);
  const currentTime = useStudioStore(s => s.currentTime);
  const setCurrentTime = useStudioStore(s => s.setCurrentTime);
  const volume = useStudioStore(s => s.volume);
  const setVolume = useStudioStore(s => s.setVolume);
  const isMuted = useStudioStore(s => s.isMuted);
  const setIsMuted = useStudioStore(s => s.setIsMuted);
  const pitchSemitones = useStudioStore(s => s.pitchSemitones);
  const setPitchSemitones = useStudioStore(s => s.setPitchSemitones);
  const addToast = useStudioStore(s => s.addToast);

  // Queue & Transport Store Hooks
  const playbackQueue = useStudioStore(s => s.playbackQueue);
  const queueIndex = useStudioStore(s => s.queueIndex);
  const repeatMode = useStudioStore(s => s.repeatMode);
  const isShuffled = useStudioStore(s => s.isShuffled);
  const isQueueOpen = useStudioStore(s => s.isQueueOpen);
  const setIsQueueOpen = useStudioStore(s => s.setIsQueueOpen);
  const playNextTrack = useStudioStore(s => s.playNextTrack);
  const playPreviousTrack = useStudioStore(s => s.playPreviousTrack);
  const toggleRepeat = useStudioStore(s => s.toggleRepeat);
  const toggleShuffle = useStudioStore(s => s.toggleShuffle);
  const removeFromQueue = useStudioStore(s => s.removeFromQueue);
  const clearQueue = useStudioStore(s => s.clearQueue);
  const playQueueItem = useStudioStore(s => s.playQueueItem);

  const [airplayActive, setAirplayActive] = useState(false);
  const [devicePickerOpen, setDevicePickerOpen] = useState(false);

  // Real Audio Streaming (Dropbox)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isStreamingDropbox, setIsStreamingDropbox] = useState(false);

  // Web Audio Synth Engine (Fallback)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine stream URL for current track
  const streamUrl = currentTrack.streamUrl || (currentTrack.id ? `/api/studio/stream?trackId=${currentTrack.id}` : null);

  // Connect & load real Dropbox audio stream when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (streamUrl) {
      audio.src = streamUrl;
      audio.load();
      setIsStreamingDropbox(true);
    } else {
      audio.removeAttribute('src');
      setIsStreamingDropbox(false);
    }
  }, [streamUrl]);

  // Sync volume and mute to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  // Sync Play / Pause to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isStreamingDropbox) return;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('[Audio Stream Notice] Direct stream paused/fell back to synth:', err.message);
        setIsStreamingDropbox(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, isStreamingDropbox]);

  // Sync time updates from real audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (isStreamingDropbox && !isNaN(audio.currentTime) && isPlaying) {
        setCurrentTime(Math.floor(audio.currentTime));
      }
    };

    const onEnded = () => {
      playNextTrack();
    };

    const onError = () => {
      console.warn('[Audio Stream Error] Falling back to Web Audio synth preview');
      setIsStreamingDropbox(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [isStreamingDropbox, isPlaying, togglePlay, setCurrentTime]);

  // Initialize Web Audio (for synth preview fallback)
  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const gain = ctx.createGain();
      gain.gain.value = isMuted ? 0 : volume * 0.4; // Controlled preview volume

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 4;

      filter.connect(gain);
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      filterRef.current = filter;
    }
  }, [isMuted, volume]);

  // Start / Stop Web Audio Synth (only runs if NOT streaming Dropbox)
  useEffect(() => {
    if (isPlaying && !isStreamingDropbox) {
      initAudio();
      const ctx = audioCtxRef.current;
      if (!ctx || !filterRef.current) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Base pitch calculation based on track frequency and semitones
      const baseFreq = currentTrack.audioFrequency || 130.81;
      const pitchMultiplier = Math.pow(2, pitchSemitones / 12);
      const targetFreq = baseFreq * pitchMultiplier;

      // Stop prior osc
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
      }

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(targetFreq, ctx.currentTime);
      osc.connect(filterRef.current);
      osc.start();
      oscRef.current = osc;

      // Rhythmic 4/4 Beat Pulse
      const intervalMs = (60 / currentTrack.bpm) * 1000;
      beatIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || !filterRef.current) return;
        const now = audioCtxRef.current.currentTime;
        
        // Filter sweep per beat (acid pulse)
        filterRef.current.frequency.cancelScheduledValues(now);
        filterRef.current.frequency.setValueAtTime(2400, now);
        filterRef.current.frequency.exponentialRampToValueAtTime(600, now + 0.18);
      }, intervalMs);

    } else {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
        oscRef.current = null;
      }
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
        beatIntervalRef.current = null;
      }
    }

    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
        oscRef.current = null;
      }
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, [isPlaying, isStreamingDropbox, currentTrack.audioFrequency, currentTrack.bpm, pitchSemitones, initAudio]);

  // Volume & Mute Updates
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume * 0.4;
      gainNodeRef.current.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Broadcast Safeguard: auto-pause when entering streaming module
  useEffect(() => {
    if (activeModule?.startsWith('streaming')) {
      if (isPlaying) {
        togglePlay();
        setIsMuted(true);
      }
    }
  }, [activeModule, isPlaying, togglePlay, setIsMuted]);

  // Playback timer tick
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            togglePlay();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTrack.duration, setCurrentTime, togglePlay]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressFraction = currentTrack.duration > 0 ? currentTime / currentTrack.duration : 0;

  const handleSeek = (newFraction: number) => {
    const newSec = Math.round(newFraction * currentTrack.duration);
    setCurrentTime(newSec);
    if (audioRef.current && isStreamingDropbox) {
      audioRef.current.currentTime = newSec;
    }
  };

  const jumpSeconds = (delta: number) => {
    const newSec = Math.max(0, Math.min(currentTrack.duration, currentTime + delta));
    setCurrentTime(newSec);
    if (audioRef.current && isStreamingDropbox) {
      audioRef.current.currentTime = newSec;
    }
  };

  const handleCueClick = (cueTime: number) => {
    setCurrentTime(cueTime);
    if (audioRef.current && isStreamingDropbox) {
      audioRef.current.currentTime = cueTime;
    }
    if (!isPlaying) togglePlay();
  };

  // If minimised, return null
  if (displayState === 'minimised') {
    return (
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      />
    );
  }

  return (
    <>
      {/* Hidden HTML5 Audio Element for Direct Cloud Streaming */}
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        className="hidden"
      />
      {/* 1. FULLSCREEN CANVAS STATE */}
      {displayState === 'fullscreen' && (
        <div className="fixed inset-0 z-50 bg-[#0c0d10] text-zinc-100 flex flex-col justify-between p-8 font-sans animate-in fade-in duration-300 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E53558] shadow-[0_0_12px_rgba(229,53,88,0.8)] animate-pulse" />
              <span className="font-semibold text-sm tracking-wider text-white">HENRY IX // IMMERSIVE AUDIO CANVAS</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400 font-mono text-[11px]">
                SOURCE: {currentTrack.source.toUpperCase()}
              </span>
              <button 
                onClick={() => setDisplayState('docked')}
                className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white transition-colors"
              >
                Dock to Bar
              </button>
            </div>
          </div>

          {/* Central Visualizer & Artwork */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 py-8 relative">
            {/* Massive Album Artwork */}
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-2xl border border-white/[0.08] bg-[#14151a] relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex items-center justify-center">
              <Disc size={96} className={`text-zinc-700 transition-transform duration-1000 ${isPlaying ? 'rotate-180 animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-4 left-4 right-4 bg-[#0c0d10]/90 backdrop-blur-md border border-white/[0.08] rounded-xl p-3 text-xs">
                <div className="font-semibold text-white truncate">{currentTrack.title}</div>
                <div className="text-zinc-400 truncate mt-0.5">{currentTrack.artist} • {currentTrack.label || 'Dubplate'} ({currentTrack.year || 2026})</div>
              </div>
            </div>

            {/* Song DNA & Track Metrics */}
            <div className="w-full max-w-md space-y-4">
              <div className="p-5 border border-white/[0.08] bg-[#14151a] rounded-xl shadow-lg">
                <h3 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3 border-b border-white/[0.06] pb-2">SONG DNA & PERFORMANCE SPECS</h3>
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div><span className="text-zinc-500 font-sans">TEMPO:</span> <span className="text-white font-semibold">{currentTrack.bpm.toFixed(2)} BPM</span></div>
                  <div><span className="text-zinc-500 font-sans">KEY:</span> <span className="text-cyan-400 font-semibold">{currentTrack.key} ({pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} ST)</span></div>
                  <div><span className="text-zinc-500 font-sans">ENERGY:</span> <span className="text-[#E53558] font-semibold">{currentTrack.energy} / 10</span></div>
                  <div><span className="text-zinc-500 font-sans">CLEARANCE:</span> <span className="text-emerald-400 font-semibold">{currentTrack.clearance || 'STREAM-SAFE'}</span></div>
                </div>
              </div>

              {/* Hot Cues Grid */}
              <div className="p-5 border border-white/[0.08] bg-[#14151a] rounded-xl shadow-lg">
                <h3 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-3 border-b border-white/[0.06] pb-2">PIONEER CDJ HOT CUES</h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentTrack.cues?.map(cue => (
                    <button
                      key={cue.letter}
                      onClick={() => handleCueClick(cue.time)}
                      className="p-2.5 rounded-lg border border-white/[0.08] bg-[#1b1c22] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all text-left group"
                      style={{ borderLeftColor: cue.color, borderLeftWidth: '3px' }}
                    >
                      <div className="text-[10px] font-bold" style={{ color: cue.color }}>CUE {cue.letter}</div>
                      <div className="text-[10px] text-zinc-400 font-mono truncate">{formatTime(cue.time)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Waveform & Transport */}
          <div className="space-y-4 border-t border-white/[0.08] pt-4">
            <ThreeBandColorWaveform 
              progress={progressFraction} 
              onScrub={handleSeek} 
              height={100} 
            />
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 rounded-lg border transition-colors ${
                    isShuffled ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/40' : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                  title="Toggle Shuffle"
                >
                  <Shuffle size={14} />
                </button>

                <button 
                  onClick={playPreviousTrack} 
                  className="p-2 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-zinc-300 hover:text-white transition-colors"
                  title="Previous Track ( |◀ )"
                >
                  <SkipBack size={16} />
                </button>

                <button onClick={() => jumpSeconds(-10)} className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-zinc-400 hover:text-white">
                  <RotateCcw size={14} />
                </button>

                <button 
                  onClick={togglePlay} 
                  className="px-8 py-2.5 rounded-full bg-[#E53558] text-white font-semibold hover:bg-[#ff3b66] shadow-[0_0_20px_rgba(229,53,88,0.5)] flex items-center gap-2 transition-all"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  <span className="font-sans text-xs uppercase">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button onClick={() => jumpSeconds(10)} className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-zinc-400 hover:text-white">
                  <RotateCw size={14} />
                </button>

                <button 
                  onClick={playNextTrack} 
                  className="p-2 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-zinc-300 hover:text-white transition-colors"
                  title="Next Track ( ▶| )"
                >
                  <SkipForward size={16} />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`p-2 rounded-lg border transition-colors flex items-center gap-1 ${
                    repeatMode === 'one' 
                      ? 'border-[#E53558]/50 text-[#E53558] bg-[#E53558]/10' 
                      : repeatMode === 'all'
                      ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40'
                      : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                  title={`Repeat Mode: ${repeatMode.toUpperCase()}`}
                >
                  {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                  <span className="text-[10px] uppercase font-bold">{repeatMode}</span>
                </button>

                <button
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 ${
                    isQueueOpen ? 'border-[#E53558] text-white bg-[#E53558]/20' : 'border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title="Toggle Queue"
                >
                  <ListMusic size={15} />
                  <span className="text-[10px] font-bold text-cyan-400">{playbackQueue.length}</span>
                </button>
              </div>
              <span className="text-zinc-400">-{formatTime(currentTrack.duration - currentTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. HALF-SCREEN DECK STATE */}
      {displayState === 'half-deck' && (
        <div className="fixed bottom-0 left-0 right-0 h-1/2 z-40 bg-[#14151a]/98 backdrop-blur-2xl border-t border-white/[0.1] text-zinc-100 font-sans p-6 flex flex-col justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-200 select-none">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-white tracking-wide">DECK INSPECTOR // {currentTrack.title.toUpperCase()}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-cyan-400 font-mono font-medium">
                {currentTrack.key} • {currentTrack.bpm} BPM
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDisplayState('fullscreen')}
                className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 hover:text-white transition-colors"
              >
                Fullscreen
              </button>
              <button 
                onClick={() => setDisplayState('docked')}
                className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 hover:text-white transition-colors"
              >
                Dock Bar
              </button>
            </div>
          </div>

          {/* Waveform with Hot Cues */}
          <div className="my-auto space-y-3">
            <ThreeBandColorWaveform 
              progress={progressFraction} 
              onScrub={handleSeek} 
              height={140} 
            />

            {/* Hot Cues Bar */}
            <div className="grid grid-cols-6 gap-2">
              {currentTrack.cues?.map(cue => (
                <button
                  key={cue.letter}
                  onClick={() => handleCueClick(cue.time)}
                  className="p-2 rounded-lg bg-[#1b1c22] border border-white/[0.08] hover:border-white/[0.2] hover:bg-white/[0.06] text-left transition-colors"
                  style={{ borderTopColor: cue.color, borderTopWidth: '2px' }}
                >
                  <div className="text-[10px] font-bold" style={{ color: cue.color }}>CUE {cue.letter}</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">{cue.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transport Row */}
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[11px]">PITCH SHIFT:</span>
              <button 
                onClick={() => setPitchSemitones(p => Math.max(-2, p - 1))}
                className="px-2 py-1 rounded-md border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-mono"
              >
                ♭ -1
              </button>
              <span className="w-8 text-center font-bold text-[#E53558] font-mono">
                {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones}
              </span>
              <button 
                onClick={() => setPitchSemitones(p => Math.min(2, p + 1))}
                className="px-2 py-1 rounded-md border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-mono"
              >
                ♯ +1
              </button>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <span className="text-zinc-400">{formatTime(currentTime)}</span>
              
              <button
                onClick={toggleShuffle}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isShuffled ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/40' : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
                title="Toggle Shuffle"
              >
                <Shuffle size={13} />
              </button>

              <button 
                onClick={playPreviousTrack} 
                className="p-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-zinc-300 hover:text-white transition-colors"
                title="Previous Track ( |◀ )"
              >
                <SkipBack size={15} />
              </button>

              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#E53558] text-white flex items-center justify-center hover:bg-[#ff3b66] shadow-[0_0_15px_rgba(229,53,88,0.5)] transition-all"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>

              <button 
                onClick={playNextTrack} 
                className="p-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-zinc-300 hover:text-white transition-colors"
                title="Next Track ( ▶| )"
              >
                <SkipForward size={15} />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
                  repeatMode === 'one' 
                    ? 'border-[#E53558]/50 text-[#E53558] bg-[#E53558]/10' 
                    : repeatMode === 'all'
                    ? 'border-cyan-500/50 text-cyan-400 bg-cyan-950/40'
                    : 'border-white/[0.08] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                }`}
                title={`Repeat Mode: ${repeatMode.toUpperCase()}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={13} /> : <Repeat size={13} />}
                <span className="text-[9px] uppercase font-bold">{repeatMode}</span>
              </button>

              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
                  isQueueOpen ? 'border-[#E53558] text-white bg-[#E53558]/20' : 'border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
                title="Toggle Queue"
              >
                <ListMusic size={14} />
                <span className="text-[10px] font-bold text-cyan-400">{playbackQueue.length}</span>
              </button>

              <span className="text-zinc-400">-{formatTime(currentTrack.duration - currentTime)}</span>
            </div>

            <div className="text-zinc-500 text-[11px] font-mono hidden sm:block">
              AUDIO: <span className={isPlaying ? 'text-emerald-400 font-semibold' : 'text-zinc-600'}>{isStreamingDropbox ? 'DROPBOX CLOUD' : isPlaying ? 'DSP SYNTH' : 'STANDBY'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOCKED STANDARD BAR */}
      {displayState === 'docked' && (
        <div className="fixed bottom-0 left-0 right-0 h-16 z-30 bg-[#14151a]/95 backdrop-blur-xl border-t border-white/[0.08] text-zinc-100 font-sans flex items-center px-4 justify-between select-none shadow-[0_-4px_20px_rgba(0,0,0,0.6)]">
          
          {/* Zone 1: Track Identity */}
          <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
            <div className="w-10 h-10 bg-[#1b1c22] border border-white/[0.08] rounded-lg relative flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
              <Disc size={18} className={`text-zinc-500 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-semibold text-zinc-100 truncate">{currentTrack.title}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-cyan-400 font-mono font-medium flex-shrink-0">
                  {currentTrack.key}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                <span className="truncate">{currentTrack.artist}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 font-mono text-[10px] flex-shrink-0">{currentTrack.bpm} BPM</span>
                {isStreamingDropbox ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono font-medium flex items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    DROPBOX
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-500 font-mono flex-shrink-0">
                    DSP SYNTH
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Zone 2: Transport & Scrubbable Waveform */}
          <div className="flex-1 max-w-2xl px-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1 text-xs font-mono">
              <button 
                onClick={() => setPitchSemitones(p => Math.max(-2, p - 1))}
                className="text-[10px] px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                title="Key Shift Down 1 Semitone"
              >
                ♭ -1
              </button>

              <button 
                onClick={playPreviousTrack}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-white/[0.06]"
                title="Previous Track / Restart ( |◀ )"
              >
                <SkipBack size={14} />
              </button>
              
              <button 
                onClick={() => jumpSeconds(-10)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-white/[0.06]"
                title="Rewind 10 Seconds"
              >
                <RotateCcw size={12} />
              </button>

              <button 
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#E53558] text-white flex items-center justify-center hover:bg-[#ff3b66] shadow-[0_0_12px_rgba(229,53,88,0.45)] transition-all flex-shrink-0"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
              </button>

              <button 
                onClick={() => jumpSeconds(10)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 rounded hover:bg-white/[0.06]"
                title="Forward 10 Seconds"
              >
                <RotateCw size={12} />
              </button>

              <button 
                onClick={playNextTrack}
                className="text-zinc-400 hover:text-white transition-colors p-1 rounded hover:bg-white/[0.06]"
                title="Next Track ( ▶| )"
              >
                <SkipForward size={14} />
              </button>

              <button 
                onClick={() => setPitchSemitones(p => Math.min(2, p + 1))}
                className="text-[10px] px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                title="Key Shift Up 1 Semitone"
              >
                ♯ +1
              </button>

              <div className="w-[1px] h-3.5 bg-white/[0.08] mx-1 hidden sm:block" />

              {/* Repeat Toggle */}
              <button
                onClick={toggleRepeat}
                className={`p-1 rounded-md transition-all flex items-center gap-1 ${
                  repeatMode === 'one' 
                    ? 'text-[#E53558] bg-[#E53558]/10 border border-[#E53558]/40 shadow-[0_0_8px_rgba(229,53,88,0.3)]' 
                    : repeatMode === 'all'
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/40 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
                title={`Repeat Mode: ${repeatMode.toUpperCase()} (Click to cycle Off / All / One)`}
              >
                {repeatMode === 'one' ? <Repeat1 size={13} /> : <Repeat size={13} />}
                <span className="text-[9px] font-bold uppercase hidden md:inline">{repeatMode}</span>
              </button>

              {/* Shuffle Toggle */}
              <button
                onClick={toggleShuffle}
                className={`p-1 rounded-md transition-all flex items-center gap-1 ${
                  isShuffled 
                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
                title={isShuffled ? "Shuffle Enabled (Random without repeats)" : "Shuffle Off (Sequential)"}
              >
                <Shuffle size={13} />
              </button>

              {/* Queue Drawer Button */}
              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={`p-1 px-2 rounded-md transition-all flex items-center gap-1.5 text-xs border ${
                  isQueueOpen 
                    ? 'border-[#E53558] text-white bg-[#E53558]/20' 
                    : 'border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white hover:border-white/[0.15]'
                }`}
                title="Toggle Playback Queue Drawer"
              >
                <ListMusic size={13} />
                <span className="text-[10px] font-bold text-cyan-400">
                  {playbackQueue.length}
                </span>
              </button>
            </div>

            {/* Scrubbable Progress Line */}
            <div className="w-full flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
              <span className="w-8 text-right">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1.5 bg-white/[0.08] rounded-full relative cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  handleSeek(fraction);
                }}
              >
                <div 
                  className="h-full bg-[#E53558] rounded-full relative group-hover:bg-[#ff3b66] transition-colors"
                  style={{ width: `${progressFraction * 100}%` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white absolute right-0 top-1/2 -translate-y-1/2 shadow opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="w-8">-{formatTime(currentTrack.duration - currentTime)}</span>
            </div>
          </div>

          {/* Zone 3: Volume & Sizing Controls */}
          <div className="flex items-center gap-3 w-1/4 justify-end relative">
            {/* AirPlay / Cast Device Picker */}
            <div className="relative">
              <button 
                onClick={() => {
                  setAirplayActive(!airplayActive);
                  setDevicePickerOpen(!devicePickerOpen);
                }}
                className={`p-1.5 rounded-md border transition-colors ${
                  airplayActive ? 'border-cyan-400 text-cyan-400 bg-cyan-950/40' : 'border-white/[0.08] bg-white/[0.04] text-zinc-500 hover:text-zinc-300'
                }`}
                title="AirPlay / Google Cast Device Picker"
              >
                <Cast size={13} />
              </button>

              {devicePickerOpen && (
                <div className="absolute bottom-10 right-0 w-64 bg-[#14151a] border border-white/[0.08] shadow-2xl rounded-xl p-3 z-50 text-xs font-sans space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-white/[0.06] pb-1 font-mono">
                    Select Broadcast Route
                  </div>
                  {[
                    { name: 'MacBook Pro Speakers', active: !airplayActive },
                    { name: 'Pioneer DJM-A9 (USB-B)', active: false },
                    { name: 'Studio AirPlay Monitor', active: airplayActive },
                  ].map(dev => (
                    <button
                      key={dev.name}
                      onClick={() => {
                        setDevicePickerOpen(false);
                        addToast({
                          title: 'AUDIO ROUTE SWITCHED',
                          message: `Stream routed to ${dev.name}.`,
                          type: 'info',
                        });
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/[0.06] flex justify-between items-center text-zinc-300 hover:text-white transition-colors"
                    >
                      <span>{dev.name}</span>
                      {dev.active && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded hover:bg-white/[0.06]"
              >
                {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 accent-[#E53558] bg-white/[0.1] rounded-full cursor-pointer"
              />
            </div>

            {/* Sizing Switcher */}
            <div className="flex items-center gap-1 border-l border-white/[0.08] pl-2 text-xs">
              <button 
                onClick={() => setDisplayState('minimised')}
                className="text-zinc-500 hover:text-zinc-300 px-1.5 py-1 rounded hover:bg-white/[0.04] transition-colors"
                title="Minimise to Sidebar Rail"
              >
                Nav
              </button>
              <button 
                onClick={() => setDisplayState('half-deck')}
                className="text-zinc-500 hover:text-zinc-300 px-1.5 py-1 rounded hover:bg-white/[0.04] transition-colors"
                title="Half-Screen Deck (50%)"
              >
                Deck
              </button>
              <button 
                onClick={() => setDisplayState('fullscreen')}
                className="text-zinc-500 hover:text-zinc-300 px-1.5 py-1 rounded hover:bg-white/[0.04] transition-colors"
                title="Fullscreen Immersive Canvas"
              >
                Full
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 4. INTERACTIVE SLIDE-OVER QUEUE DRAWER */}
      {isQueueOpen && (
        <div className="fixed top-0 bottom-16 right-0 w-80 sm:w-96 bg-[#14151a]/98 backdrop-blur-2xl border-l border-white/[0.08] shadow-2xl z-40 flex flex-col font-sans animate-in slide-in-from-right duration-200 select-none">
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#14151a]">
            <div className="flex items-center gap-2">
              <ListMusic size={16} className="text-[#E53558]" />
              <span className="font-semibold text-xs text-white uppercase tracking-wider">Playback Queue</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-cyan-400 font-mono font-medium">
                {playbackQueue.length}
              </span>
            </div>
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-1 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-zinc-400 hover:text-white transition-colors"
              title="Close Queue Drawer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Queue Actions Bar */}
          <div className="px-4 py-2 border-b border-white/[0.06] bg-[#0c0d10]/40 flex items-center justify-between text-xs">
            <button
              onClick={toggleShuffle}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                isShuffled 
                  ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/40' 
                  : 'border-white/[0.08] bg-white/[0.04] text-zinc-400 hover:text-white hover:border-white/[0.15]'
              }`}
            >
              <Shuffle size={11} />
              <span>{isShuffled ? 'Shuffled' : 'Shuffle All'}</span>
            </button>

            <button
              onClick={clearQueue}
              className="flex items-center gap-1 px-2 py-1 text-[11px] text-zinc-500 hover:text-[#E53558] transition-colors"
              title="Clear upcoming tracks from queue"
            >
              <Trash2 size={11} />
              <span>Clear Upcoming</span>
            </button>
          </div>

          {/* Drawer Body: Now Playing + Up Next */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            
            {/* Active Track Card */}
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                <span>NOW PLAYING</span>
                {isPlaying && (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="p-3.5 border border-[#E53558]/30 bg-[#E53558]/5 relative overflow-hidden rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1b1c22] border border-white/[0.08] rounded-lg relative flex items-center justify-center flex-shrink-0">
                    <Disc size={20} className={`text-[#E53558] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">{currentTrack.title}</div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">{currentTrack.artist}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                      <span className="text-cyan-400 font-semibold">{currentTrack.key}</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-400">{currentTrack.bpm} BPM</span>
                      <span className="text-zinc-600">•</span>
                      <span className="text-zinc-500">{formatTime(currentTrack.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Up Next Section */}
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 flex items-center justify-between font-mono">
                <span>UP NEXT IN QUEUE</span>
                <span className="text-zinc-600">{Math.max(0, playbackQueue.length - (queueIndex + 1))} remaining</span>
              </div>

              {playbackQueue.length <= 1 ? (
                <div className="p-6 border border-dashed border-white/[0.08] bg-white/[0.01] text-center text-zinc-500 text-xs rounded-xl">
                  <ListMusic size={24} className="mx-auto mb-2 opacity-40 text-zinc-400" />
                  <p className="font-medium">Queue is empty</p>
                  <p className="text-[11px] text-zinc-600 mt-1">Click [+ Queue] on any track in your Library or Crates to add songs.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {playbackQueue.map((track, idx) => {
                    const isCurrent = idx === queueIndex;
                    const isPast = idx < queueIndex;
                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        className={`p-2.5 border text-xs flex items-center justify-between gap-2.5 group transition-all rounded-lg ${
                          isCurrent
                            ? 'border-[#E53558]/40 bg-[#E53558]/10'
                            : isPast
                            ? 'border-white/[0.03] bg-black/30 opacity-40'
                            : 'border-white/[0.04] bg-white/[0.02] hover:border-white/[0.1] hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-[10px] text-zinc-500 font-mono w-4 text-right flex-shrink-0">
                            {idx + 1}
                          </span>
                          <button
                            onClick={() => playQueueItem(idx)}
                            className="text-zinc-400 hover:text-white transition-colors p-0.5"
                            title="Play this track now"
                          >
                            {isCurrent && isPlaying ? (
                              <Pause size={12} className="text-[#E53558]" />
                            ) : (
                              <Play size={12} className="group-hover:text-[#E53558]" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className={`truncate font-medium ${isCurrent ? 'text-[#E53558]' : 'text-zinc-200'}`}>
                              {track.title}
                            </div>
                            <div className="text-[11px] text-zinc-400 truncate">{track.artist}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-cyan-400 font-medium">
                            {track.key}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {track.bpm.toFixed(0)}
                          </span>
                          {!isCurrent && (
                            <button
                              onClick={() => removeFromQueue(idx)}
                              className="text-zinc-600 hover:text-[#E53558] p-1 transition-colors opacity-0 group-hover:opacity-100"
                              title="Remove from queue"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
