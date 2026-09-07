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
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-8 font-mono animate-in fade-in duration-300 select-none">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#D8163F] shadow-[0_0_12px_rgba(216,22,63,0.8)] animate-pulse" />
              <span className="font-avathe text-xl tracking-widest text-white">HENRY IX // IMMERSIVE AUDIO CANVAS</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400">
                SOURCE: {currentTrack.source.toUpperCase()}
              </span>
              <button 
                onClick={() => setDisplayState('docked')}
                className="px-3 py-1.5 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white transition-colors"
              >
                [? DOCK TO BAR]
              </button>
            </div>
          </div>

          {/* Central Visualizer & Artwork */}
          <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 py-8 relative">
            <div className="absolute inset-0 bayer-dither opacity-10 pointer-events-none" />
            
            {/* Massive Album Artwork */}
            <div className="w-72 h-72 sm:w-96 sm:h-96 border-2 border-zinc-800 bg-zinc-950 relative overflow-hidden shadow-[0_0_40px_rgba(216,22,63,0.25)] flex items-center justify-center">
              <div className="absolute inset-0 bayer-dither opacity-20 pointer-events-none" />
              <Disc size={96} className={`text-zinc-800 transition-transform duration-1000 ${isPlaying ? 'rotate-180 animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur border border-zinc-800 p-3 text-xs">
                <div className="font-bold text-white uppercase">{currentTrack.title}</div>
                <div className="text-zinc-400">{currentTrack.artist} • {currentTrack.label || 'Dubplate'} ({currentTrack.year || 2026})</div>
              </div>
            </div>

            {/* Song DNA & Track Metrics */}
            <div className="w-full max-w-md space-y-4">
              <div className="p-4 border border-zinc-800 bg-zinc-950">
                <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-900 pb-1">SONG DNA & PERFORMANCE SPECS</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-zinc-500">TEMPO:</span> <span className="text-white font-bold">{currentTrack.bpm.toFixed(2)} BPM</span></div>
                  <div><span className="text-zinc-500">KEY:</span> <span className="text-[#22d3ee] font-bold">{currentTrack.key} ({pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} ST)</span></div>
                  <div><span className="text-zinc-500">ENERGY:</span> <span className="text-[#D8163F] font-bold">{currentTrack.energy} / 10</span></div>
                  <div><span className="text-zinc-500">CLEARANCE:</span> <span className="text-emerald-400 font-bold">{currentTrack.clearance || 'STREAM-SAFE'}</span></div>
                </div>
              </div>

              {/* Hot Cues Grid */}
              <div className="p-4 border border-zinc-800 bg-zinc-950">
                <h3 className="text-xs text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-900 pb-1">PIONEER CDJ HOT CUES</h3>
                <div className="grid grid-cols-3 gap-2">
                  {currentTrack.cues?.map(cue => (
                    <button
                      key={cue.letter}
                      onClick={() => handleCueClick(cue.time)}
                      className="p-2 border border-zinc-800 bg-black hover:border-white transition-all text-left group"
                      style={{ borderLeftColor: cue.color, borderLeftWidth: '3px' }}
                    >
                      <div className="text-[10px] font-bold" style={{ color: cue.color }}>CUE {cue.letter}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{formatTime(cue.time)}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Waveform & Transport */}
          <div className="space-y-4 border-t border-zinc-900 pt-4">
            <ThreeBandColorWaveform 
              progress={progressFraction} 
              onScrub={handleSeek} 
              height={100} 
            />
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{formatTime(currentTime)}</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 border transition-colors ${
                    isShuffled ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Toggle Shuffle"
                >
                  <Shuffle size={14} />
                </button>

                <button 
                  onClick={playPreviousTrack} 
                  className="p-2 border border-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
                  title="Previous Track ( |◀ )"
                >
                  <SkipBack size={16} />
                </button>

                <button onClick={() => jumpSeconds(-10)} className="px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-500 text-zinc-400">
                  <RotateCcw size={14} />
                </button>

                <button 
                  onClick={togglePlay} 
                  className="px-8 py-2.5 bg-[#D8163F] text-white font-bold hover:bg-red-600 shadow-[0_0_15px_rgba(216,22,63,0.6)] flex items-center gap-2 transition-all"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button onClick={() => jumpSeconds(10)} className="px-2.5 py-1.5 border border-zinc-800 hover:border-zinc-500 text-zinc-400">
                  <RotateCw size={14} />
                </button>

                <button 
                  onClick={playNextTrack} 
                  className="p-2 border border-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
                  title="Next Track ( ▶| )"
                >
                  <SkipForward size={16} />
                </button>

                <button
                  onClick={toggleRepeat}
                  className={`p-2 border transition-colors flex items-center gap-1 ${
                    repeatMode === 'one' 
                      ? 'border-[#D8163F] text-[#D8163F] bg-red-950/40' 
                      : repeatMode === 'all'
                      ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                  title={`Repeat Mode: ${repeatMode.toUpperCase()}`}
                >
                  {repeatMode === 'one' ? <Repeat1 size={14} /> : <Repeat size={14} />}
                  <span className="text-[10px] uppercase font-bold">{repeatMode}</span>
                </button>

                <button
                  onClick={() => setIsQueueOpen(!isQueueOpen)}
                  className={`p-2 border transition-colors flex items-center gap-1.5 ${
                    isQueueOpen ? 'border-[#D8163F] text-white bg-[#D8163F]/20' : 'border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Toggle Queue"
                >
                  <ListMusic size={15} />
                  <span className="text-[10px] font-bold text-[#22d3ee]">{playbackQueue.length}</span>
                </button>
              </div>
              <span className="text-zinc-400">-{formatTime(currentTrack.duration - currentTime)}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. HALF-SCREEN DECK STATE */}
      {displayState === 'half-deck' && (
        <div className="fixed bottom-0 left-0 right-0 h-1/2 z-40 bg-black/95 backdrop-blur-md border-t-2 border-[#D8163F] text-white font-mono p-6 flex flex-col justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom duration-200 select-none">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-3">
              <span className="font-avathe text-lg text-white">DECK INSPECTOR // {currentTrack.title.toUpperCase()}</span>
              <span className="text-xs px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[#22d3ee] font-bold">
                {currentTrack.key} • {currentTrack.bpm} BPM
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setDisplayState('fullscreen')}
                className="px-2.5 py-1 border border-zinc-800 hover:border-zinc-600 text-xs text-zinc-400 hover:text-white"
              >
                [? FULLSCREEN]
              </button>
              <button 
                onClick={() => setDisplayState('docked')}
                className="px-2.5 py-1 border border-zinc-800 hover:border-zinc-600 text-xs text-zinc-400 hover:text-white"
              >
                [? DOCK BAR]
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
                  className="p-1.5 bg-zinc-950 border border-zinc-800 hover:border-white text-left transition-colors"
                  style={{ borderTopColor: cue.color, borderTopWidth: '2px' }}
                >
                  <div className="text-[10px] font-bold" style={{ color: cue.color }}>CUE {cue.letter}</div>
                  <div className="text-[9px] text-zinc-500 truncate">{cue.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Transport Row */}
          <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">PITCH SHIFT:</span>
              <button 
                onClick={() => setPitchSemitones(p => Math.max(-2, p - 1))}
                className="px-2 py-1 border border-zinc-800 hover:border-zinc-600 text-zinc-300"
              >
                ? -1
              </button>
              <span className="w-8 text-center font-bold text-[#D8163F]">
                {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones}
              </span>
              <button 
                onClick={() => setPitchSemitones(p => Math.min(2, p + 1))}
                className="px-2 py-1 border border-zinc-800 hover:border-zinc-600 text-zinc-300"
              >
                ? +1
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-zinc-400">{formatTime(currentTime)}</span>
              
              <button
                onClick={toggleShuffle}
                className={`p-1.5 border rounded transition-colors ${
                  isShuffled ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title="Toggle Shuffle"
              >
                <Shuffle size={13} />
              </button>

              <button 
                onClick={playPreviousTrack} 
                className="p-1.5 border border-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
                title="Previous Track ( |◀ )"
              >
                <SkipBack size={15} />
              </button>

              <button 
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#D8163F] text-white flex items-center justify-center hover:bg-red-600 shadow-[0_0_12px_rgba(216,22,63,0.5)] transition-all"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
              </button>

              <button 
                onClick={playNextTrack} 
                className="p-1.5 border border-zinc-800 hover:border-zinc-500 text-zinc-300 hover:text-white transition-colors"
                title="Next Track ( ▶| )"
              >
                <SkipForward size={15} />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-1.5 border rounded transition-colors flex items-center gap-1 ${
                  repeatMode === 'one' 
                    ? 'border-[#D8163F] text-[#D8163F] bg-red-950/40' 
                    : repeatMode === 'all'
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-950/40'
                    : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title={`Repeat Mode: ${repeatMode.toUpperCase()}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={13} /> : <Repeat size={13} />}
                <span className="text-[9px] uppercase font-bold">{repeatMode}</span>
              </button>

              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={`p-1.5 border rounded transition-colors flex items-center gap-1.5 ${
                  isQueueOpen ? 'border-[#D8163F] text-white bg-[#D8163F]/20' : 'border-zinc-800 text-zinc-400 hover:text-white'
                }`}
                title="Toggle Queue"
              >
                <ListMusic size={14} />
                <span className="text-[10px] font-bold text-[#22d3ee]">{playbackQueue.length}</span>
              </button>

              <span className="text-zinc-400">-{formatTime(currentTrack.duration - currentTime)}</span>
            </div>

            <div className="text-zinc-500 text-[11px] hidden sm:block">
              AUDIO: <span className={isPlaying ? 'text-emerald-400 font-bold' : 'text-zinc-600'}>{isStreamingDropbox ? 'DROPBOX CLOUD' : isPlaying ? 'DSP SYNTH' : 'STANDBY'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. DOCKED STANDARD BAR */}
      {displayState === 'docked' && (
        <div className="fixed bottom-0 left-0 right-0 h-16 z-30 bg-black/95 backdrop-blur-md border-t border-zinc-800 text-white font-mono flex items-center px-4 justify-between select-none shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
          
          {/* Zone 1: Track Identity */}
          <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
            <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 relative flex items-center justify-center overflow-hidden flex-shrink-0">
              <Disc size={18} className={`text-zinc-600 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-bold text-zinc-200 truncate">{currentTrack.title}</span>
                <span className="text-[9px] px-1 bg-zinc-900 border border-zinc-800 text-zinc-500 flex-shrink-0">
                  {currentTrack.key}
                </span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate flex items-center gap-1.5">
                <span className="truncate">{currentTrack.artist}</span>
                <span>•</span>
                <span className="text-cyan-400 text-[9px] flex-shrink-0">{currentTrack.bpm} BPM</span>
                {isStreamingDropbox ? (
                  <span className="text-[8px] px-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1 flex-shrink-0">
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                    DROPBOX
                  </span>
                ) : (
                  <span className="text-[8px] px-1 bg-zinc-900 border border-zinc-800 text-zinc-500 font-mono flex-shrink-0">
                    DSP SYNTH
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Zone 2: Transport & Scrubbable Waveform */}
          <div className="flex-1 max-w-2xl px-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1 text-xs">
              <button 
                onClick={() => setPitchSemitones(p => Math.max(-2, p - 1))}
                className="text-[10px] px-1.5 py-0.5 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white"
                title="Key Shift Down 1 Semitone"
              >
                ♭ -1
              </button>

              <button 
                onClick={playPreviousTrack}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title="Previous Track / Restart ( |◀ )"
              >
                <SkipBack size={14} />
              </button>
              
              <button 
                onClick={() => jumpSeconds(-10)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title="Rewind 10 Seconds"
              >
                <RotateCcw size={12} />
              </button>

              <button 
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-[#D8163F] text-white flex items-center justify-center hover:bg-red-600 shadow-[0_0_10px_rgba(216,22,63,0.5)] transition-all flex-shrink-0"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </button>

              <button 
                onClick={() => jumpSeconds(10)} 
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                title="Forward 10 Seconds"
              >
                <RotateCw size={12} />
              </button>

              <button 
                onClick={playNextTrack}
                className="text-zinc-400 hover:text-white transition-colors p-1"
                title="Next Track ( ▶| )"
              >
                <SkipForward size={14} />
              </button>

              <button 
                onClick={() => setPitchSemitones(p => Math.min(2, p + 1))}
                className="text-[10px] px-1.5 py-0.5 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white"
                title="Key Shift Up 1 Semitone"
              >
                ♯ +1
              </button>

              <div className="w-[1px] h-3.5 bg-zinc-800 mx-1 hidden sm:block" />

              {/* Repeat Toggle */}
              <button
                onClick={toggleRepeat}
                className={`p-1 rounded transition-all flex items-center gap-1 ${
                  repeatMode === 'one' 
                    ? 'text-[#D8163F] bg-red-950/40 border border-[#D8163F]/50 shadow-[0_0_8px_rgba(216,22,63,0.4)]' 
                    : repeatMode === 'all'
                    ? 'text-[#22d3ee] bg-cyan-950/40 border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)]'
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
                className={`p-1 rounded transition-all flex items-center gap-1 ${
                  isShuffled 
                    ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
                title={isShuffled ? "Shuffle Enabled (Random without repeats)" : "Shuffle Off (Sequential)"}
              >
                <Shuffle size={13} />
              </button>

              {/* Queue Drawer Button */}
              <button
                onClick={() => setIsQueueOpen(!isQueueOpen)}
                className={`p-1 px-1.5 rounded transition-all flex items-center gap-1.5 text-xs font-mono border ${
                  isQueueOpen 
                    ? 'border-[#D8163F] text-white bg-[#D8163F]/20' 
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
                title="Toggle Playback Queue Drawer"
              >
                <ListMusic size={13} />
                <span className="text-[10px] font-bold bg-zinc-900 px-1 py-0.2 rounded border border-zinc-800 text-[#22d3ee]">
                  {playbackQueue.length}
                </span>
              </button>
            </div>

            {/* Scrubbable Progress Line */}
            <div className="w-full flex items-center gap-2 text-[10px] text-zinc-500">
              <span className="w-8 text-right">{formatTime(currentTime)}</span>
              <div 
                className="flex-1 h-1.5 bg-zinc-900 border border-zinc-800 rounded-full relative cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  handleSeek(fraction);
                }}
              >
                <div 
                  className="h-full bg-[#D8163F] rounded-full relative group-hover:bg-red-500 transition-colors"
                  style={{ width: `${progressFraction * 100}%` }}
                >
                  <div className="w-2 h-2 rounded-full bg-white absolute right-0 top-1/2 -translate-y-1/2 shadow opacity-0 group-hover:opacity-100" />
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
                className={`p-1.5 border rounded transition-colors ${
                  airplayActive ? 'border-cyan-400 text-cyan-400' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                title="AirPlay / Google Cast Device Picker"
              >
                <Cast size={13} />
              </button>

              {devicePickerOpen && (
                <div className="absolute bottom-10 right-0 w-64 bg-zinc-950 border border-zinc-800 shadow-2xl p-3 z-50 text-xs font-mono space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider border-b border-zinc-900 pb-1">
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
                      className="w-full text-left p-1.5 rounded hover:bg-zinc-900 flex justify-between items-center text-zinc-300 hover:text-white"
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
                className="text-zinc-500 hover:text-zinc-300"
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
                className="w-16 h-1 accent-[#D8163F] bg-zinc-800 cursor-pointer"
              />
            </div>

            {/* Sizing Switcher */}
            <div className="flex items-center gap-1 border-l border-zinc-900 pl-2">
              <button 
                onClick={() => setDisplayState('minimised')}
                className="text-zinc-500 hover:text-zinc-300 p-1 text-[11px]"
                title="Minimise to Sidebar Rail"
              >
                [? Nav]
              </button>
              <button 
                onClick={() => setDisplayState('half-deck')}
                className="text-zinc-500 hover:text-zinc-300 p-1 text-[11px]"
                title="Half-Screen Deck (50%)"
              >
                [? Deck]
              </button>
              <button 
                onClick={() => setDisplayState('fullscreen')}
                className="text-zinc-500 hover:text-zinc-300 p-1 text-[11px]"
                title="Fullscreen Immersive Canvas"
              >
                [? Full]
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 4. INTERACTIVE SLIDE-OVER QUEUE DRAWER */}
      {isQueueOpen && (
        <div className="fixed top-0 bottom-16 right-0 w-80 sm:w-96 bg-black/95 backdrop-blur-md border-l border-zinc-800 shadow-2xl z-40 flex flex-col font-mono animate-in slide-in-from-right duration-200 select-none">
          {/* Drawer Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-2">
              <ListMusic size={16} className="text-[#D8163F]" />
              <span className="font-bold text-xs text-white uppercase tracking-wider">Playback Queue</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-zinc-900 border border-zinc-800 text-[#22d3ee] font-bold">
                {playbackQueue.length}
              </span>
            </div>
            <button
              onClick={() => setIsQueueOpen(false)}
              className="p-1 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded transition-colors"
              title="Close Queue Drawer"
            >
              <X size={14} />
            </button>
          </div>

          {/* Queue Actions Bar */}
          <div className="px-4 py-2 border-b border-zinc-900 bg-black/60 flex items-center justify-between text-xs">
            <button
              onClick={toggleShuffle}
              className={`flex items-center gap-1.5 px-2.5 py-1 border rounded text-[10px] font-bold transition-all ${
                isShuffled 
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40' 
                  : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Shuffle size={11} />
              <span>{isShuffled ? 'SHUFFLED' : 'SHUFFLE ALL'}</span>
            </button>

            <button
              onClick={clearQueue}
              className="flex items-center gap-1 px-2 py-1 text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
              title="Clear upcoming tracks from queue"
            >
              <Trash2 size={11} />
              <span>CLEAR UPCOMING</span>
            </button>
          </div>

          {/* Drawer Body: Now Playing + Up Next */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            
            {/* Active Track Card */}
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>NOW PLAYING</span>
                {isPlaying && (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                )}
              </div>
              <div className="p-3 border border-[#D8163F]/40 bg-[#D8163F]/5 relative overflow-hidden rounded-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black border border-zinc-800 relative flex items-center justify-center flex-shrink-0">
                    <Disc size={20} className={`text-[#D8163F] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-white truncate">{currentTrack.title}</div>
                    <div className="text-[11px] text-zinc-400 truncate mt-0.5">{currentTrack.artist}</div>
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      <span className="text-[#22d3ee] font-bold">{currentTrack.key}</span>
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
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>UP NEXT IN QUEUE</span>
                <span className="text-zinc-600">{Math.max(0, playbackQueue.length - (queueIndex + 1))} remaining</span>
              </div>

              {playbackQueue.length <= 1 ? (
                <div className="p-6 border border-dashed border-zinc-900 text-center text-zinc-600 text-xs rounded">
                  <ListMusic size={24} className="mx-auto mb-2 opacity-40 text-zinc-500" />
                  <p>Queue is empty.</p>
                  <p className="text-[10px] text-zinc-700 mt-1">Click [+ Queue] on any track in your Library or Crates to add songs.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {playbackQueue.map((track, idx) => {
                    const isCurrent = idx === queueIndex;
                    const isPast = idx < queueIndex;
                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        className={`p-2 border text-xs flex items-center justify-between gap-2 group transition-all rounded-sm ${
                          isCurrent
                            ? 'border-[#D8163F] bg-[#D8163F]/10'
                            : isPast
                            ? 'border-zinc-900 bg-black/40 opacity-50'
                            : 'border-zinc-900 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-[10px] text-zinc-600 font-mono w-4 text-right flex-shrink-0">
                            {idx + 1}
                          </span>
                          <button
                            onClick={() => playQueueItem(idx)}
                            className="text-zinc-500 hover:text-white transition-colors p-0.5"
                            title="Play this track now"
                          >
                            {isCurrent && isPlaying ? (
                              <Pause size={12} className="text-[#D8163F]" />
                            ) : (
                              <Play size={12} className="group-hover:text-[#D8163F]" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className={`truncate font-bold ${isCurrent ? 'text-[#D8163F]' : 'text-zinc-200'}`}>
                              {track.title}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate">{track.artist}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[9px] px-1 bg-zinc-900 border border-zinc-800 text-[#22d3ee] font-bold">
                            {track.key}
                          </span>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {track.bpm.toFixed(0)}
                          </span>
                          {!isCurrent && (
                            <button
                              onClick={() => removeFromQueue(idx)}
                              className="text-zinc-600 hover:text-red-400 p-1 transition-colors opacity-0 group-hover:opacity-100"
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
