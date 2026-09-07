'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Tv, 
  Video, 
  Activity, 
  Flame, 
  MessageSquare, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  Mic, 
  MicOff,
  Sparkles,
  Download,
  Copy,
  ExternalLink,
  Layers,
  Radio,
  Sliders,
  Scissors,
  Share2,
  FileText,
  BarChart2,
  TrendingUp,
  Play,
  RotateCcw
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

// --- Dual-Mode OBS WebSocket Bridge ---
class OBSWebSocketManager {
  private ws: WebSocket | null = null;
  private messageId = 1;
  public onConnect?: (mode: 'local' | 'tunnel') => void;
  public onDisconnect?: () => void;
  public connected = false;
  public mode: 'local' | 'tunnel' | null = null;

  connect() {
    // 1. Attempt direct 0ms local port first
    try {
      this.ws = new WebSocket('ws://localhost:4455');
      
      this.ws.onopen = () => {
        console.log('[OBS] Connected to local OBS (ws://localhost:4455).');
        this.connected = true;
        this.mode = 'local';
        if (this.onConnect) this.onConnect('local');
      };

      this.ws.onerror = () => {
        console.warn('[OBS] Local connection failed. Falling back to Cloudflare tunnel...');
        this.ws?.close();
        
        // 2. Fallback to Cloudflare Encrypted WSS Tunnel
        try {
          this.ws = new WebSocket('wss://obs.henryix.com');
          this.ws.onopen = () => {
            console.log('[OBS] Connected to Cloudflare WSS tunnel (wss://obs.henryix.com).');
            this.connected = true;
            this.mode = 'tunnel';
            if (this.onConnect) this.onConnect('tunnel');
          };
          this.ws.onerror = (err) => {
            console.warn('[OBS] Cloudflare tunnel offline (Simulated standby).', err);
          };
          this.ws.onclose = () => {
            this.connected = false;
            this.mode = null;
            if (this.onDisconnect) this.onDisconnect();
          };
        } catch (e) {
          console.warn('[OBS] Tunnel initialization error:', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.mode = null;
        if (this.onDisconnect) this.onDisconnect();
      };
    } catch (err) {
      console.warn('[OBS] Connection init exception:', err);
    }
  }

  send(requestType: string, requestData?: any) {
    if (!this.ws || !this.connected) return;
    try {
      this.ws.send(JSON.stringify({
        op: 6,
        d: {
          requestType,
          requestId: (this.messageId++).toString(),
          requestData,
        }
      }));
    } catch (e) {
      console.warn('[OBS] Error sending command:', e);
    }
  }

  setScene(sceneName: string) {
    this.send('SetCurrentProgramScene', { sceneName });
  }

  disconnect() {
    this.ws?.close();
  }
}

export interface StreamingModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function StreamingModule({
  activeView = 'streaming-live',
  onNavigate,
}: StreamingModuleProps) {
  const addToast = useStudioStore((s) => s.addToast);
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const addInstagramPost = useStudioStore((s) => s.addInstagramPost);

  const currentTab = activeView === 'streaming-analytics' 
    ? 'analytics' 
    : activeView === 'streaming-clips' 
    ? 'clips' 
    : 'live';

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

  // Markers & Stream Metadata
  const [streamDuration, setStreamDuration] = useState<number>(3842); // in seconds (~1h 4m)
  const [highlightMarkers, setHighlightMarkers] = useState<Array<{ id: string; time: string; seconds: number; note: string; energy: number }>>([
    { id: 'mark-1', time: '00:24:18', seconds: 1458, note: 'Peak Bass Drop (MAJA - KEPT)', energy: 9.2 },
    { id: 'mark-2', time: '00:48:32', seconds: 2912, note: 'Unreleased Dubplate Reveal', energy: 10.0 },
    { id: 'mark-3', time: '01:12:05', seconds: 4325, note: 'Do It Diva Double Drop', energy: 8.8 },
    { id: 'mark-4', time: '01:34:50', seconds: 5690, note: 'Favela Funk Peak Hook', energy: 9.5 },
  ]);

  // Telemetry simulation
  const [chatVelocity, setChatVelocity] = useState(42);
  const [extractingClipId, setExtractingClipId] = useState<string | null>(null);
  const [previewClipRatio, setPreviewClipRatio] = useState<'9:16' | '16:9'>('9:16');

  // Past Broadcasts State for Analytics
  const pastBroadcasts = [
    {
      id: 'bc-1',
      title: 'Knight Club Session 4 // Live Stream',
      date: '2026-10-18',
      duration: '02:14:20',
      peakViewers: 1240,
      avgRetention: '48m 12s',
      tracksPlayed: 24,
      fileSize: '10.4 GB MKV',
      health: '100% (0 Dropped)',
    },
    {
      id: 'bc-2',
      title: 'Knight Club Warm-Up Broadcast // 145-155 BPM',
      date: '2026-10-11',
      duration: '01:45:00',
      peakViewers: 890,
      avgRetention: '42m 30s',
      tracksPlayed: 18,
      fileSize: '7.8 GB MKV',
      health: '99.8% (12 Dropped)',
    },
    {
      id: 'bc-3',
      title: 'Corner N1 Bass Pressure Stream // UKG & Dubplates',
      date: '2026-10-04',
      duration: '02:30:15',
      peakViewers: 1520,
      avgRetention: '54m 00s',
      tracksPlayed: 31,
      fileSize: '12.1 GB MKV',
      health: '100% (0 Dropped)',
    },
    {
      id: 'bc-4',
      title: 'Boiler Room Style Showcase // Vinyl & CDJ-3000',
      date: '2026-09-27',
      duration: '01:15:00',
      peakViewers: 2100,
      avgRetention: '59m 10s',
      tracksPlayed: 15,
      fileSize: '5.9 GB MKV',
      health: '100% (0 Dropped)',
    },
  ];

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

  // Stream duration counter simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setStreamDuration((prev) => prev + 1);
      // Simulate slight VU fluctuations
      setAudioLevel((prev) => {
        const delta = Math.floor(Math.random() * 15) - 7;
        return Math.max(20, Math.min(95, prev + delta));
      });
      // Simulate chat velocity fluctuations
      setChatVelocity((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(10, Math.min(85, prev + delta));
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
  }, [intermissionCountdown]);

  // Handle Scene Switching
  const handleSceneSwitch = useCallback((cam: 'Cam 1' | 'Cam 2' | 'Cam 3' | 'Blackout') => {
    setActiveCam(cam);
    if (obsRef.current?.connected) {
      obsRef.current.setScene(cam);
    }
  }, []);

  // Keyboard Shortcuts (1, 2, 3 for Cams, Esc for Blackout, Space+I for Intermission)
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
  }, [handleSceneSwitch]);

  // Web MIDI API Listener (Pioneer DDJ/CDJ & MIDI Controllers)
  useEffect(() => {
    if (typeof navigator === 'undefined' || !(navigator as any).requestMIDIAccess) return;

    let midiAccess: any = null;

    const onMIDIMessage = (event: any) => {
      const [status, note] = event.data;
      // 144 = Note On
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
  }, [handleSceneSwitch]);

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

      // Transient loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      let lastSwitchTime = Date.now();

      const checkTransients = () => {
        if (!analyserRef.current || !micStreamRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate low-end energy (bass bins 0-8)
        let bassSum = 0;
        for (let i = 0; i < 8; i++) {
          bassSum += dataArray[i];
        }
        const avgBass = bassSum / 8;
        setAudioLevel(Math.min(100, Math.round((avgBass / 255) * 100)));

        // If Natural Director enabled and peak detected after 14s dwell
        if (naturalDirector && avgBass > 220 && Date.now() - lastSwitchTime > 14000) {
          lastSwitchTime = Date.now();
          const cams: Array<'Cam 1' | 'Cam 2' | 'Cam 3'> = ['Cam 1', 'Cam 2', 'Cam 3'];
          const nextCam = cams[Math.floor(Math.random() * cams.length)];
          handleSceneSwitch(nextCam);
          markHighlight(`Bass Drop Transient (${Math.round(avgBass)} VU)`);
        }

        requestAnimationFrame(checkTransients);
      };

      requestAnimationFrame(checkTransients);
    } catch (err) {
      console.warn('[MIC] Mic permission error:', err);
      addToast({
        title: 'MIC INGEST ERROR',
        message: 'Could not access audio input device.',
        type: 'error',
      });
    }
  };

  // Mark 60s Highlight Clip
  const markHighlight = (note = 'Manual Highlight Marker') => {
    const hrs = Math.floor(streamDuration / 3600);
    const mins = Math.floor((streamDuration % 3600) / 60);
    const secs = streamDuration % 60;
    const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

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
      message: `Captured stream timestamp at ${timeStr}. Staged for EDL export.`,
      type: 'success',
    });
  };

  // Intermission Mode (5:00 Standby Clock + Mute)
  const triggerIntermission = () => {
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
  };

  // 1.5s Emergency Blackout
  const handleEmergencyBlackout = () => {
    handleSceneSwitch('Blackout');
    addToast({
      title: 'EMERGENCY BLACKOUT TRIGGERED',
      message: 'Immediate cut to black screen. Program audio muted.',
      type: 'error',
    });
  };

  // Copy Browser Source Overlay URL
  const handleCopyOverlayUrl = () => {
    const url = `${window.location.origin}/api/live-status/overlay`;
    navigator.clipboard.writeText(url);
    addToast({
      title: 'OVERLAY URL COPIED',
      message: 'Paste into OBS Browser Source (1920x1080, 60fps).',
      type: 'success',
    });
  };

  // Export DaVinci / Premiere EDL file
  const handleExportEDL = () => {
    let edlContent = `TITLE: HENRY_IX_BROADCAST_HIGHLIGHTS\nFCM: NON-DROP FRAME\n\n`;
    highlightMarkers.forEach((m, idx) => {
      const clipIndex = (idx + 1).toString().padStart(3, '0');
      edlContent += `${clipIndex}  AX       V     C        ${m.time}:00 ${m.time}:00 ${m.time}:00 ${m.time}:00\n* FROM CLIP NAME: MASTER_STREAM_CAPTURE.MKV\n* COMMENT: ${m.note}\n\n`;
    });

    const blob = new Blob([edlContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Henry_IX_Stream_Highlights_${Date.now()}.edl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'EDL TIMELINE EXPORTED',
      message: 'Loaded markers exported for DaVinci Resolve & Premiere Pro.',
      type: 'success',
    });
  };

  // Extract Single Clip simulation
  const handleExtractSingleClip = (marker: typeof highlightMarkers[0]) => {
    setExtractingClipId(marker.id);
    setTimeout(() => {
      setExtractingClipId(null);
      addToast({
        title: '60S PROXY EXTRACTED',
        message: `Clip at ${marker.time} packaged as 1080p MP4. Ready for social handoff.`,
        type: 'success',
      });
    }, 1400);
  };

  // Send Clip to Social Grid
  const handleSendClipToSocial = (marker: typeof highlightMarkers[0]) => {
    addInstagramPost({
      title: `Live Drop // ${marker.note}`,
      date: 'Day of Show',
      type: 'Video Clip',
      scheduled: true,
      image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
      caption: `Unreleased pressure tested live on stream at ${marker.time}. #HENRYIX #LondonUnderground`,
    });
    addToast({
      title: 'STAGED TO SOCIAL GRID',
      message: `Clip at ${marker.time} queued into 3x3 Instagram Grid.`,
      type: 'success',
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

        {/* Sub-navigation Switcher Pills (Notion Segmented Control) */}
        <div className="flex items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl">
          <button
            onClick={() => onNavigate ? onNavigate('streaming-live') : null}
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
            onClick={() => onNavigate ? onNavigate('streaming-analytics') : null}
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
            onClick={() => onNavigate ? onNavigate('streaming-clips') : null}
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

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: LIVE BROADCAST DECK                                           */}
      {/* ========================================================================= */}
      {currentTab === 'live' && (
        <div className="space-y-6">
          
          {/* Quick Telemetry & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-3.5 text-xs shadow-sm">
            <div className="flex items-center gap-4">
              {/* OBS Socket Status */}
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${obsConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-400 animate-pulse'}`} />
                <span className="text-zinc-400 font-sans">
                  OBS: <span className="text-white font-medium font-mono">{obsConnected ? (obsMode === 'local' ? 'LOCAL PORT 4455 (0ms)' : 'CLOUDFLARE WSS') : 'STANDBY (READY)'}</span>
                </span>
              </div>

              {/* Master Stream Uptime */}
              <div className="flex items-center gap-2 border-l border-white/[0.08] pl-4">
                <Clock size={13} className="text-[#E53558]" />
                <span className="text-zinc-400 font-sans">ON AIR UPTIME:</span>
                <span className="text-white font-medium font-mono tracking-wider">{formatDuration(streamDuration)}</span>
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
                  {activeCam === 'Blackout' ? 'BLACKOUT // EMERGENCY CUT' : `${activeCam}: ${activeCam === 'Cam 1' ? 'DJ Booth & Face' : activeCam === 'Cam 2' ? 'CDJ-3000 Overhead Platter' : 'Crowd Room Monitor'}`}
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
                    {activeCam === 'Cam 1' ? 'CAM 1 // FACE & DJ BOOTH' : activeCam === 'Cam 2' ? 'CAM 2 // CDJ-3000 OVERHEAD PLATTER' : 'CAM 3 // CROWD & ROOM MONITOR'}
                  </div>
                  <div className="text-xs text-zinc-400 font-mono">1080P60 H.264 // 6,240 KBPS // DIRECT HDMI INGEST</div>
                </div>
              )}

              {/* Intermission Overlay if active */}
              {intermissionCountdown !== null && (
                <div className="absolute inset-0 bg-[#0c0d10]/95 backdrop-blur-md flex flex-col items-center justify-center text-center z-30">
                  <span className="text-zinc-400 text-xs tracking-wider uppercase mb-2 font-mono">AUTO-STANDBY INTERMISSION</span>
                  <span className="font-mono text-5xl text-[#E53558] font-bold drop-shadow-[0_0_20px_rgba(229,53,88,0.6)]">
                    {Math.floor(intermissionCountdown / 60)}:{(intermissionCountdown % 60).toString().padStart(2, '0')}
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
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 text-[10px] font-mono">1</kbd>
              </div>
              <div className="aspect-video rounded-lg bg-[#0c0d10] border border-white/[0.06] flex items-center justify-center text-zinc-500 text-xs relative overflow-hidden">
                <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
                <span className="font-mono text-[11px]">[PREVIEW 1080P]</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSceneSwitch('Cam 1'); }}
                className={`w-full mt-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeCam === 'Cam 1' ? 'bg-[#E53558] text-white shadow-[0_0_12px_rgba(229,53,88,0.3)]' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300'
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
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 text-[10px] font-mono">2</kbd>
              </div>
              <div className="aspect-video rounded-lg bg-[#0c0d10] border border-white/[0.06] flex items-center justify-center text-zinc-500 text-xs relative overflow-hidden">
                <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
                <span className="font-mono text-[11px]">[PREVIEW 1080P]</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSceneSwitch('Cam 2'); }}
                className={`w-full mt-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeCam === 'Cam 2' ? 'bg-[#E53558] text-white shadow-[0_0_12px_rgba(229,53,88,0.3)]' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300'
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
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 text-zinc-400 text-[10px] font-mono">3</kbd>
              </div>
              <div className="aspect-video rounded-lg bg-[#0c0d10] border border-white/[0.06] flex items-center justify-center text-zinc-500 text-xs relative overflow-hidden">
                <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
                <span className="font-mono text-[11px]">[PREVIEW 1080P]</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); handleSceneSwitch('Cam 3'); }}
                className={`w-full mt-3 py-2 rounded-lg transition-all text-xs font-medium ${
                  activeCam === 'Cam 3' ? 'bg-[#E53558] text-white shadow-[0_0_12px_rgba(229,53,88,0.3)]' : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300'
                }`}
              >
                {activeCam === 'Cam 3' ? '● On Air' : 'Cut to Cam 3'}
              </button>
            </div>

          </div>

          {/* MACRO TOOLBAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              onClick={() => markHighlight('Manual Drop Highlight')}
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
                <span className="text-zinc-400 ml-2 font-mono text-[11px]">— {currentTrack.artist} ({currentTrack.key} • {currentTrack.bpm} BPM)</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Auto-Synced With Player
              </span>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: STREAM HISTORY & ANALYTICS                                    */}
      {/* ========================================================================= */}
      {currentTab === 'analytics' && (
        <div className="space-y-6">
          
          {/* Live Telemetry Health Matrix */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] font-mono uppercase block">Framerate</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">60.0 FPS</div>
              <span className="text-[11px] text-zinc-500">Zero Jitter Lock</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] font-mono uppercase block">Video Bitrate</span>
              <div className="text-2xl font-bold font-mono text-white">6,240 <span className="text-xs font-normal text-zinc-400">KBPS</span></div>
              <span className="text-[11px] text-emerald-400">Constant (CBR)</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] font-mono uppercase block">Dropped Frames</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">0 <span className="text-xs font-normal text-zinc-400">(0.0%)</span></div>
              <span className="text-[11px] text-zinc-500">0 ms network stall</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] font-mono uppercase block">Audio Lossless</span>
              <div className="text-2xl font-bold font-mono text-white">320 <span className="text-xs font-normal text-zinc-400">KBPS</span></div>
              <span className="text-[11px] text-zinc-400">Stereo 48kHz AAC</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] font-mono uppercase block">Encoder Load</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">14.2%</div>
              <span className="text-[11px] text-zinc-500">NVENC RTX Hardware</span>
            </div>
          </div>

          {/* Real-time Audience Retention & Chat Velocity Curve */}
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-xs font-semibold text-white tracking-wider uppercase flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#3b82f6]" />
                  Audience Retention Curve & Chat Flame Telemetry
                </h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Real-time viewer density synchronized with track transitions and peak drops
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E53558]" />
                  <span className="text-zinc-400">Live Viewers: <strong className="text-white font-mono">842 Peak</strong></span>
                </div>
                <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-3">
                  <Flame size={13} className="text-amber-400" />
                  <span className="text-zinc-400">Chat Velocity: <strong className="text-white font-mono">{chatVelocity} msgs/min</strong></span>
                </div>
              </div>
            </div>

            {/* Simulated 2-Hour Timeline Curve */}
            <div className="h-44 rounded-lg bg-[#0c0d10] border border-white/[0.06] p-4 relative flex flex-col justify-between overflow-hidden">
              <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />

              {/* Peak Annotation Markers */}
              <div className="relative z-10 flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>00:00 (Warm-up)</span>
                <span>00:30 (Build-up)</span>
                <span className="text-[#E53558] font-semibold">01:00 (⚡ Peak Drop: 1,240 Viewers)</span>
                <span>01:30 (Deep Dubs)</span>
                <span>02:00 (Closing)</span>
              </div>

              {/* Dynamic Waveform Graph Bars */}
              <div className="relative z-10 flex items-end gap-1.5 h-28 pt-2">
                {[
                  35, 42, 50, 62, 70, 75, 88, 94, 98, 100, 85, 80, 82, 90, 95, 99, 92, 88, 78, 65
                ].map((val, idx) => (
                  <div key={idx} className="flex-1 bg-white/[0.04] rounded-t overflow-hidden flex flex-col justify-end group relative">
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        val > 90 ? 'bg-[#E53558] shadow-[0_0_8px_rgba(229,53,88,0.5)]' : val > 70 ? 'bg-amber-400' : 'bg-emerald-400/80'
                      }`}
                      style={{ height: `${val}%` }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#1b1c22] border border-white/10 rounded px-2 py-0.5 text-[10px] text-white font-mono whitespace-nowrap z-20 pointer-events-none shadow-lg">
                      {Math.round(val * 8.42)} Viewers
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative z-10 flex justify-between text-[10px] text-zinc-400 pt-2 border-t border-white/[0.06] font-mono">
                <span>Stream Duration: {formatDuration(streamDuration)}</span>
                <span className="text-emerald-400">98% Sentiment Positive • High Track ID demand</span>
              </div>
            </div>
          </div>

          {/* Past Broadcasts Archive Table */}
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
                Historical Broadcasts Archive ({pastBroadcasts.length} Sessions)
              </h3>
              <button 
                onClick={() => {
                  const csv = pastBroadcasts.map(b => `${b.date},${b.title},${b.duration},${b.peakViewers},${b.tracksPlayed},${b.health}`).join('\n');
                  const blob = new Blob([`Date,Title,Duration,PeakViewers,Tracks,Health\n${csv}`], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Henry_IX_Broadcast_Telemetry_${Date.now()}.csv`;
                  a.click();
                  addToast({ title: 'TELEMETRY EXPORTED', message: 'Downloaded stream analytics CSV.', type: 'success' });
                }}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>Export Telemetry CSV</span>
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-400 text-[10px] uppercase font-mono">
                    <th className="p-3 font-medium">Session Title</th>
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Duration</th>
                    <th className="p-3 font-medium">Peak Viewers</th>
                    <th className="p-3 font-medium">Avg Retention</th>
                    <th className="p-3 font-medium">Tracks</th>
                    <th className="p-3 font-medium">Stream Health</th>
                    <th className="p-3 text-right font-medium">Master MKV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {pastBroadcasts.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.04] transition-colors">
                      <td className="p-3 font-medium text-white">{b.title}</td>
                      <td className="p-3 text-zinc-400 font-mono text-[11px]">{b.date}</td>
                      <td className="p-3 text-zinc-300 font-mono text-[11px]">{b.duration}</td>
                      <td className="p-3 font-bold font-mono text-[#E53558]">{b.peakViewers}</td>
                      <td className="p-3 text-zinc-400">{b.avgRetention}</td>
                      <td className="p-3 text-zinc-300 font-mono">{b.tracksPlayed}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                          {b.health}
                        </span>
                      </td>
                      <td className="p-3 text-right text-zinc-400 font-mono text-[11px]">{b.fileSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 3: LIVESTREAM CLIPS STUDIO                                       */}
      {/* ========================================================================= */}
      {currentTab === 'clips' && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-4 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-white tracking-wider uppercase flex items-center gap-2">
                <Scissors size={14} className="text-[#8b5cf6]" />
                60s Highlight Clips Studio & Export Deck
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Marked stream timestamps extracted into 1080p vertical video ready for TikTok, Instagram Reels, and NLE export
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleExportEDL}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} />
                <span>Export DaVinci / Premiere EDL</span>
              </button>
              
              <button 
                onClick={() => markHighlight('Manual Clip Drop')}
                className="px-3 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Sparkles size={13} />
                <span>+ Mark Current Timestamp</span>
              </button>
            </div>
          </div>

          {/* Dual Workbench: Clips Gallery & Trimmer Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Clips List */}
            <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
                <span className="font-semibold text-zinc-200 uppercase tracking-wider">
                  Recorded Highlight Markers ({highlightMarkers.length})
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">TIMECODES REFERENCED TO MKV MASTER</span>
              </div>

              <div className="space-y-2.5">
                {highlightMarkers.map((marker) => (
                  <div 
                    key={marker.id}
                    className="p-3.5 rounded-lg bg-[#1b1c22]/60 border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-[#0c0d10] border border-white/10 flex items-center justify-center font-mono text-[11px] font-bold text-[#E53558] flex-shrink-0">
                        60s
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-white">{marker.time}</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-mono">
                            ENERGY {marker.energy}/10
                          </span>
                        </div>
                        <div className="text-zinc-400 truncate text-[11px] mt-0.5">{marker.note}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                      <button 
                        onClick={() => handleExtractSingleClip(marker)}
                        disabled={extractingClipId === marker.id}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        {extractingClipId === marker.id ? (
                          <>
                            <RotateCcw size={11} className="animate-spin" />
                            <span>Extracting...</span>
                          </>
                        ) : (
                          <>
                            <Download size={11} />
                            <span>Extract 60s</span>
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => handleSendClipToSocial(marker)}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-[#E53558]/20 hover:text-[#E53558] text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        title="Send to 3x3 Social Grid"
                      >
                        <Share2 size={11} />
                        <span>Send to Grid</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Trimmer Preview & Safe-Zone Guides */}
            <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <span className="font-semibold text-xs text-white uppercase tracking-wider">Clip Viewport Preview</span>
                <div className="flex gap-1 bg-[#0c0d10] p-0.5 rounded-lg border border-white/10">
                  <button 
                    onClick={() => setPreviewClipRatio('9:16')}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                      previewClipRatio === '9:16' ? 'bg-white/[0.12] text-white' : 'text-zinc-400'
                    }`}
                  >
                    9:16
                  </button>
                  <button 
                    onClick={() => setPreviewClipRatio('16:9')}
                    className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                      previewClipRatio === '16:9' ? 'bg-white/[0.12] text-white' : 'text-zinc-400'
                    }`}
                  >
                    16:9
                  </button>
                </div>
              </div>

              <div className={`rounded-lg bg-[#0c0d10] border border-white/10 relative overflow-hidden flex items-center justify-center mx-auto ${
                previewClipRatio === '9:16' ? 'aspect-[9/16] w-52' : 'aspect-video w-full'
              }`}>
                <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />
                
                {/* Safe Zone Overlay for 9:16 */}
                {previewClipRatio === '9:16' && (
                  <div className="absolute inset-0 pointer-events-none border border-red-500/30 p-2 flex flex-col justify-between text-[8px] text-red-400 font-mono">
                    <div className="border-b border-dashed border-red-500/30 pb-1">Top Danger Zone</div>
                    <div className="self-end w-8 h-28 border-l border-dashed border-red-500/30 p-0.5">Icons</div>
                    <div className="border-t border-dashed border-red-500/30 pt-1">Captions Safe Zone</div>
                  </div>
                )}

                <div className="text-center p-3 z-10">
                  <Video size={28} className="mx-auto text-zinc-500 mb-2" />
                  <div className="text-xs font-medium text-white">{highlightMarkers[0]?.note}</div>
                  <div className="text-[10px] text-zinc-400 font-mono mt-1">{highlightMarkers[0]?.time} (60s Trim)</div>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-white/[0.06] bg-[#0c0d10] text-[11px] text-zinc-400 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">FORMAT:</span>
                  <span className="text-white">1080p60 H.264 MP4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">AUDIO INGEST:</span>
                  <span className="text-white">320 kbps Lossless</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">DESTINATION:</span>
                  <span className="text-emerald-400">assets.henryix.com / Videos</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
