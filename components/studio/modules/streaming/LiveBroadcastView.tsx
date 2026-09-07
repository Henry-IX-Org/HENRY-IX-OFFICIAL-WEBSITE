'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Tv,
  Clock,
  ShieldAlert,
  Mic,
  MicOff,
  Sparkles,
  Activity,
  Layers,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { OBSWebSocketManager } from './obsManager';

interface LiveBroadcastViewProps {
  streamDuration: number;
  formatDuration: (seconds: number) => string;
  onMarkHighlight: (note: string) => void;
}

export default function LiveBroadcastView({
  streamDuration,
  formatDuration,
  onMarkHighlight,
}: LiveBroadcastViewProps) {
  const addToast = useStudioStore((s) => s.addToast);
  const currentTrack = useStudioStore((s) => s.currentTrack);

  // OBS Connection State
  const [obsConnected, setObsConnected] = useState(false);
  const [obsMode, setObsMode] = useState<'local' | 'tunnel' | null>(null);
  const obsRef = useRef<OBSWebSocketManager | null>(null);

  // Video Director State
  const [activeCam, setActiveCam] = useState<'Cam 1' | 'Cam 2' | 'Cam 3' | 'Blackout'>('Cam 1');
  const [naturalDirector, setNaturalDirector] = useState(false);
  const [intermissionCountdown, setIntermissionCountdown] = useState<number | null>(null);

  // Audio & Transient Engine
  const [audioLevel, setAudioLevel] = useState<number>(45);
  const [isMicLive, setIsMicLive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize OBS WebSocket connection
  useEffect(() => {
    const obs = new OBSWebSocketManager();
    obs.onConnect = (mode) => {
      setObsConnected(true);
      setObsMode(mode);
      addToast({
        title: 'OBS WEBSOCKET CONNECTED',
        message: `Linked via ${mode === 'local' ? 'Local Port 4455 (0ms)' : 'Cloudflare Secure Tunnel'}.`,
        type: 'success',
      });
    };
    obs.onDisconnect = () => {
      setObsConnected(false);
      setObsMode(null);
    };
    obs.connect();
    obsRef.current = obs;

    return () => {
      obs.disconnect();
    };
  }, [addToast]);

  // Handle Scene Switching
  const handleSceneSwitch = useCallback((cam: 'Cam 1' | 'Cam 2' | 'Cam 3' | 'Blackout') => {
    setActiveCam(cam);
    if (obsRef.current?.connected) {
      obsRef.current.setScene(cam);
    }
  }, []);

  // 1.5s Emergency Blackout
  const handleEmergencyBlackout = useCallback(() => {
    handleSceneSwitch('Blackout');
    addToast({
      title: 'EMERGENCY BLACKOUT TRIGGERED',
      message: 'Immediate cut to black screen. Program audio muted.',
      type: 'error',
    });
  }, [handleSceneSwitch, addToast]);

  // Intermission Timer Switcher
  const triggerIntermission = useCallback(() => {
    if (intermissionCountdown !== null) {
      setIntermissionCountdown(null);
      handleSceneSwitch('Cam 1');
      if (obsRef.current?.connected) {
        obsRef.current.setScene('Cam 1');
      }
      addToast({
        title: 'INTERMISSION CANCELLED',
        message: 'Resumed Master Program feed.',
        type: 'info',
      });
    } else {
      setIntermissionCountdown(300); // 5 minutes
      handleSceneSwitch('Cam 3');
      if (obsRef.current?.connected) {
        obsRef.current.setScene('Intermission');
      }
      addToast({
        title: 'BOOTH STANDBY ENGAGED',
        message: '5:00 countdown clock active. Booth mics muted.',
        type: 'warning',
      });
    }
  }, [intermissionCountdown, handleSceneSwitch, addToast]);

  // Intermission Countdown Timer
  useEffect(() => {
    if (intermissionCountdown === null) return;
    if (intermissionCountdown <= 0) {
      setIntermissionCountdown(null);
      handleSceneSwitch('Cam 1');
      addToast({
        title: 'STANDBY COMPLETE',
        message: 'Resumed Master Program feed. Mic unmuted.',
        type: 'info',
      });
      return;
    }

    const interval = setInterval(() => {
      setIntermissionCountdown((prev) => (prev ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [intermissionCountdown, handleSceneSwitch, addToast]);

  // Keyboard Shortcuts (1, 2, 3 for Cams, Esc for Blackout, Space+Shift for Intermission)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === '1') {
        handleSceneSwitch('Cam 1');
      } else if (e.key === '2') {
        handleSceneSwitch('Cam 2');
      } else if (e.key === '3') {
        handleSceneSwitch('Cam 3');
      } else if (e.key === 'Escape') {
        handleEmergencyBlackout();
      } else if (e.code === 'Space' && e.shiftKey) {
        e.preventDefault();
        triggerIntermission();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSceneSwitch, handleEmergencyBlackout, triggerIntermission]);

  // Web MIDI API Listener (Pioneer DDJ/CDJ & MIDI Controllers)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !(navigator as any).requestMIDIAccess) return;

    let midiAccess: any = null;

    const onMIDIMessage = (event: any) => {
      const [status, note] = event.data;
      if (status === 144) {
        if (note === 36) handleSceneSwitch('Cam 1');
        else if (note === 37) handleSceneSwitch('Cam 2');
        else if (note === 38) handleSceneSwitch('Cam 3');
        else if (note === 40) handleEmergencyBlackout();
        else if (note === 42) triggerIntermission();
      }
    };

    (navigator as any).requestMIDIAccess().then(
      (access: any) => {
        midiAccess = access;
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = onMIDIMessage;
        }
      },
      () => {
        console.log('[MIDI] No MIDI devices connected or permission denied.');
      }
    );

    return () => {
      if (midiAccess) {
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = null;
        }
      }
    };
  }, [handleSceneSwitch, handleEmergencyBlackout, triggerIntermission]);

  // Multi-Signal Musical Director (Audio Ingest Transient Engine)
  const toggleLiveMic = async () => {
    if (isMicLive) {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      audioContextRef.current?.close();
      audioContextRef.current = null;
      setIsMicLive(false);
      addToast({
        title: 'BOOTH MIC DISCONNECTED',
        message: 'Audio input monitor disabled.',
        type: 'info',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      setIsMicLive(true);

      addToast({
        title: 'BOOTH MIC LIVE',
        message: 'Transient detector engaged. Spectral flux listening for bass drops.',
        type: 'success',
      });

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let lastSwitchTime = Date.now();

      const checkTransients = () => {
        if (!analyserRef.current || !micStreamRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let bassSum = 0;
        for (let i = 0; i < 8; i++) {
          bassSum += dataArray[i];
        }
        const avgBass = bassSum / 8;
        setAudioLevel(Math.min(100, Math.round((avgBass / 255) * 100)));

        if (naturalDirector && avgBass > 220 && Date.now() - lastSwitchTime > 14000) {
          lastSwitchTime = Date.now();
          const cams: Array<'Cam 1' | 'Cam 2' | 'Cam 3'> = ['Cam 1', 'Cam 2', 'Cam 3'];
          const randomCam = cams[Math.floor(Math.random() * cams.length)];
          handleSceneSwitch(randomCam);
        }

        requestAnimationFrame(checkTransients);
      };

      requestAnimationFrame(checkTransients);
    } catch (e) {
      console.warn('Microphone permission denied or device unavailable.', e);
      addToast({
        title: 'MIC ACCESS DENIED',
        message: 'Unable to access input device. Simulated VU level active.',
        type: 'warning',
      });
    }
  };

  const handleCopyOverlayUrl = () => {
    const url = `${window.location.origin}/api/live-status/overlay`;
    navigator.clipboard.writeText(url);
    addToast({
      title: 'OVERLAY URL COPIED',
      message: 'Paste into OBS Browser Source (1920x1080, 60fps).',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Telemetry & Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-3.5 text-xs shadow-sm">
        <div className="flex items-center gap-4">
          {/* OBS Socket Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                obsConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span className="text-zinc-400 font-sans">
              OBS:{' '}
              <span className="text-white font-medium font-mono">
                {obsConnected
                  ? obsMode === 'local'
                    ? 'LOCAL PORT 4455 (0ms)'
                    : 'CLOUDFLARE WSS'
                  : 'STANDBY (READY)'}
              </span>
            </span>
          </div>

          {/* Master Stream Uptime */}
          <div className="flex items-center gap-2 border-l border-white/[0.08] pl-4">
            <Clock size={13} className="text-[#E53558]" />
            <span className="text-zinc-400 font-sans">ON AIR UPTIME:</span>
            <span className="text-white font-medium font-mono tracking-wider">
              {formatDuration(streamDuration)}
            </span>
          </div>
        </div>

        {/* Mic Ingest Toggle */}
        <button
          onClick={toggleLiveMic}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
            isMicLive
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          {isMicLive ? <Mic size={13} className="text-emerald-400" /> : <MicOff size={13} />}
          <span>{isMicLive ? 'Booth Mic Active' : 'Connect Booth Mic'}</span>
        </button>
      </div>

      {/* ACTIVE PROGRAM MONITOR */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 shadow-xl shadow-black/40 relative overflow-hidden">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E53558] text-white font-medium text-[11px] tracking-wide shadow-[0_0_10px_rgba(229,53,88,0.4)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              PROGRAM (ON AIR)
            </span>
            <span className="text-xs font-medium text-zinc-200">
              {activeCam === 'Blackout'
                ? 'BLACKOUT // EMERGENCY CUT'
                : `${activeCam}: ${
                    activeCam === 'Cam 1'
                      ? 'DJ Booth & Face'
                      : activeCam === 'Cam 2'
                      ? 'CDJ-3000 Overhead Platter'
                      : 'Crowd Room Monitor'
                  }`}
            </span>
          </div>

          {/* Audio Transient Level Meter */}
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>VU INGEST:</span>
            <div className="w-32 h-2.5 rounded-full bg-[#0c0d10] border border-white/10 overflow-hidden flex p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#E53558] transition-all duration-75"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            <span className="text-zinc-400 w-8 text-right">{audioLevel}%</span>
          </div>
        </div>

        {/* Main Stage Video Canvas Preview */}
        <div className="aspect-video w-full rounded-lg bg-[#0c0d10] border border-white/[0.06] relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />

          {activeCam === 'Blackout' ? (
            <div className="text-center space-y-2 z-10">
              <ShieldAlert size={48} className="mx-auto text-red-500 animate-pulse" />
              <div className="font-semibold text-xl text-red-400 tracking-tight">
                EMERGENCY BLACKOUT ACTIVE
              </div>
              <p className="text-xs text-zinc-400">PROGRAM CUT TO BLACK • AUDIO MUTED</p>
            </div>
          ) : (
            <div className="text-center space-y-2.5 z-10">
              <Tv size={44} className="mx-auto text-zinc-600 animate-pulse" />
              <div className="font-semibold text-lg text-white tracking-tight">
                {activeCam === 'Cam 1'
                  ? 'CAM 1 // FACE & DJ BOOTH'
                  : activeCam === 'Cam 2'
                  ? 'CAM 2 // CDJ-3000 OVERHEAD PLATTER'
                  : 'CAM 3 // CROWD & ROOM MONITOR'}
              </div>
              <div className="text-xs text-zinc-400 font-mono">
                1080P60 H.264 // 6,240 KBPS // DIRECT HDMI INGEST
              </div>
            </div>
          )}

          {/* Intermission Overlay if active */}
          {intermissionCountdown !== null && (
            <div className="absolute inset-0 bg-[#0c0d10]/95 backdrop-blur-md flex flex-col items-center justify-center text-center z-30">
              <span className="text-zinc-400 text-xs tracking-wider uppercase mb-2 font-mono">
                AUTO-STANDBY INTERMISSION
              </span>
              <span className="font-mono text-5xl text-[#E53558] font-bold drop-shadow-[0_0_20px_rgba(229,53,88,0.6)]">
                {Math.floor(intermissionCountdown / 60)}:
                {(intermissionCountdown % 60).toString().padStart(2, '0')}
              </span>
              <span className="text-xs text-zinc-400 mt-3">Booth mics muted • Ambient dither loop active</span>
              <button
                onClick={triggerIntermission}
                className="mt-4 px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-medium text-white transition-colors"
              >
                End Intermission Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* THREE PREVIEW MONITORS & DIRECT CUT BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preview 1 */}
        <div
          onClick={() => handleSceneSwitch('Cam 1')}
          className={`p-4 rounded-xl border transition-all cursor-pointer bg-[#14151a] ${
            activeCam === 'Cam 1'
              ? 'border-[#E53558] shadow-[0_0_20px_rgba(229,53,88,0.2)]'
              : 'border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-center mb-2.5 text-xs">
            <span className="font-medium text-zinc-200">Cam 1: Face / DJ Booth</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 text-[10px] font-mono">
              1
            </kbd>
          </div>
          <div className="aspect-video rounded-lg bg-[#0c0d10] border border-white/[0.06] flex items-center justify-center text-zinc-500 text-xs relative overflow-hidden">
            <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
            <span className="font-mono text-[11px]">[PREVIEW 1080P]</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSceneSwitch('Cam 1');
            }}
            className={`w-full mt-3 py-2 rounded-lg transition-all text-xs font-medium ${
              activeCam === 'Cam 1'
                ? 'bg-[#E53558] text-white shadow-[0_0_12px_rgba(229,53,88,0.3)]'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300'
            }`}
          >
            {activeCam === 'Cam 1' ? '● On Air' : 'Cut to Cam 1'}
          </button>
        </div>

        {/* Preview 2 */}
        <div
          onClick={() => handleSceneSwitch('Cam 2')}
          className={`p-4 rounded-xl border transition-all cursor-pointer bg-[#14151a] ${
            activeCam === 'Cam 2'
              ? 'border-[#E53558] shadow-[0_0_20px_rgba(229,53,88,0.2)]'
              : 'border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-center mb-2.5 text-xs">
            <span className="font-medium text-zinc-200">Cam 2: CDJ Overhead</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 text-[10px] font-mono">
              2
            </kbd>
          </div>
          <div className="aspect-video rounded-lg bg-[#0c0d10] border border-white/[0.06] flex items-center justify-center text-zinc-500 text-xs relative overflow-hidden">
            <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
            <span className="font-mono text-[11px]">[PREVIEW 1080P]</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSceneSwitch('Cam 2');
            }}
            className={`w-full mt-3 py-2 rounded-lg transition-all text-xs font-medium ${
              activeCam === 'Cam 2'
                ? 'bg-[#E53558] text-white shadow-[0_0_12px_rgba(229,53,88,0.3)]'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300'
            }`}
          >
            {activeCam === 'Cam 2' ? '● On Air' : 'Cut to Cam 2'}
          </button>
        </div>

        {/* Preview 3 */}
        <div
          onClick={() => handleSceneSwitch('Cam 3')}
          className={`p-4 rounded-xl border transition-all cursor-pointer bg-[#14151a] ${
            activeCam === 'Cam 3'
              ? 'border-[#E53558] shadow-[0_0_20px_rgba(229,53,88,0.2)]'
              : 'border-white/[0.08] hover:border-white/20'
          }`}
        >
          <div className="flex justify-between items-center mb-2.5 text-xs">
            <span className="font-medium text-zinc-200">Cam 3: Crowd / Room</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 text-[10px] font-mono">
              3
            </kbd>
          </div>
          <div className="aspect-video rounded-lg bg-[#0c0d10] border border-white/[0.06] flex items-center justify-center text-zinc-500 text-xs relative overflow-hidden">
            <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
            <span className="font-mono text-[11px]">[PREVIEW 1080P]</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSceneSwitch('Cam 3');
            }}
            className={`w-full mt-3 py-2 rounded-lg transition-all text-xs font-medium ${
              activeCam === 'Cam 3'
                ? 'bg-[#E53558] text-white shadow-[0_0_12px_rgba(229,53,88,0.3)]'
                : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300'
            }`}
          >
            {activeCam === 'Cam 3' ? '● On Air' : 'Cut to Cam 3'}
          </button>
        </div>
      </div>

      {/* MACRO TOOLBAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onMarkHighlight('Manual Drop Highlight')}
          className="p-3.5 rounded-xl bg-[#14151a] border border-white/[0.08] hover:border-white/20 text-xs font-medium text-zinc-200 hover:text-white flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Sparkles size={14} className="text-[#E53558]" />
          <span>Mark 60s Highlight</span>
        </button>

        <button
          onClick={() => {
            const nextState = !naturalDirector;
            setNaturalDirector(nextState);
            addToast({
              title: 'NATURAL DIRECTOR',
              message: `Auto-switcher ${nextState ? 'ENGAGED (14s dynamic dwell)' : 'DISABLED'}.`,
              type: 'info',
            });
          }}
          className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm ${
            naturalDirector
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-[#14151a] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Activity size={14} className={naturalDirector ? 'text-emerald-400' : ''} />
          <span>Director: {naturalDirector ? 'Auto-Cut On' : 'Manual'}</span>
        </button>

        <button
          onClick={triggerIntermission}
          className="p-3.5 rounded-xl bg-[#14151a] border border-white/[0.08] hover:border-amber-500/30 text-xs font-medium text-zinc-300 hover:text-amber-300 flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <Clock size={14} className="text-amber-400" />
          <span>Standby (Shift+Space)</span>
        </button>

        <button
          onClick={handleEmergencyBlackout}
          className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 hover:bg-red-900/30 text-red-400 hover:text-red-300 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <ShieldAlert size={14} />
          <span>Emergency Blackout (ESC)</span>
        </button>
      </div>

      {/* OBS BROWSER SOURCE OVERLAY TOOL */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <Layers size={15} className="text-[#3b82f6]" />
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
              Dynamic Track ID Lower-Third OBS Overlay
            </h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyOverlayUrl}
              className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Copy size={12} />
              <span>Copy Browser Source URL</span>
            </button>
            <a
              href="/api/live-status/overlay"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#E53558] text-white font-medium text-xs flex items-center gap-1.5 hover:bg-[#f43f5e] transition-colors shadow-sm"
            >
              <ExternalLink size={12} />
              <span>Preview Overlay Tab</span>
            </a>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#0c0d10] flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-500 uppercase text-[10px] font-mono block">Current Live Track ID</span>
            <span className="text-white font-medium">{currentTrack.title}</span>
            <span className="text-zinc-400 ml-2 font-mono text-[11px]">
              — {currentTrack.artist} ({currentTrack.key} • {currentTrack.bpm} BPM)
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Auto-Synced With Player
          </span>
        </div>
      </div>
    </div>
  );
}
