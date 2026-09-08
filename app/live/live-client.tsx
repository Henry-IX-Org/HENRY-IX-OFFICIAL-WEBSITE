'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import PageShell from '@/components/PageShell';
import { playClick, playTick } from '@/lib/audioUtils';
import { cn } from '@/lib/utils';
import { getCloudflareStreamPlaybackUrl, BroadcastHistoryItem } from '@/lib/cloudflareStream';
import { Radio, Play, Disc, Calendar, Volume2, Clock } from 'lucide-react';

const HlsPlayer = dynamic(
  () =>
    Promise.resolve(({ src, title }: { src: string; title: string }) => {
      const videoRef = useRef<HTMLVideoElement>(null);

      useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: any;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          import('hls.js').then(({ default: Hls }) => {
            if (Hls.isSupported()) {
              hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
              });
              hls.loadSource(src);
              hls.attachMedia(video);
            }
          });
        }

        return () => {
          if (hls) {
            hls.destroy();
          }
        };
      }, [src]);

      return (
        <video
          ref={videoRef}
          controls
          playsInline
          className="w-full h-full object-contain"
          title={title}
          autoPlay
          muted
        />
      );
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-[#09090b] flex items-center justify-center border border-zinc-900 text-zinc-500 font-mono text-xs">
        CONNECTING TO STREAM FEED...
      </div>
    ),
  }
);

function getYouTubeEmbedId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getTwitchChannel(url: string) {
  if (!url) return null;
  const match = url.match(/(?:twitch\.tv\/)([a-zA-Z0-9_]+)/i);
  return match ? match[1] : null;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  time: string;
}

const LIVE_CHAT_SEED: ChatMessage[] = [
  { id: '1', user: 'Alex_LDN', text: 'Locked in! Sounding heavy.', time: '22:01' },
  { id: '2', user: 'DubPlate_99', text: 'Track ID on this bassline?', time: '22:03' },
  { id: '3', user: 'SouthLondoner', text: '4-deck mixing is crazy tonight 🔥', time: '22:05' },
];

const INCOMING_CHAT_SIM = [
  'Transition was lethal 🔥',
  'Volume turned all the way up in Bristol.',
  'That vocal chop is insane.',
  'CDJ work on point tonight.',
  'Is this getting released anytime soon?',
  'Unreal energy right now.',
];

const INCOMING_USERS = [
  'Elena_K', 'Marcus_T', 'BasslineJunkie', 'VaultSessions', 'Sub_Bass_01'
];

interface LiveClientProps {
  initialSettings: {
    title: string;
    playbackId: string;
    viewerUserId: string;
    status: string;
    scheduledTime: string | null;
    endedAt: string | null;
    resolution: string;
    latency: string;
  };
  history: BroadcastHistoryItem[];
}

export default function LiveClient({ initialSettings, history }: LiveClientProps) {
  const [activeStream, setActiveStream] = useState(initialSettings);
  const [currentTrack, setCurrentTrack] = useState('HENRY IX - DUBPLATE SPECIAL [UNRELEASED]');
  const [currentBpm, setCurrentBpm] = useState<number>(138);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(LIVE_CHAT_SEED);
  const [chatInput, setChatInput] = useState('');
  const [preCountdownSecs, setPreCountdownSecs] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Poll live status from Cloudflare Stream & website API
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch('/api/live-status');
        if (res.ok) {
          const data: any = await res.json();
          if (data?.state) {
            const s = data.state;
            setActiveStream(prev => ({
              ...prev,
              status: s.status,
              title: s.title || prev.title,
              playbackId: s.playbackId || prev.playbackId,
              scheduledTime: s.scheduledTime,
              endedAt: s.endedAt,
            }));
            if (s.currentTrack) setCurrentTrack(s.currentTrack);
            if (s.bpm) setCurrentBpm(Number(s.bpm));
          }
        }
      } catch (err) {
        // Fallback gracefully
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 6000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for upcoming scheduled streams
  useEffect(() => {
    if (activeStream.status === 'upcoming' && activeStream.scheduledTime) {
      const timer = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((new Date(activeStream.scheduledTime!).getTime() - now) / 1000);
        if (diff > 0) {
          setPreCountdownSecs(diff);
        } else {
          setPreCountdownSecs(null);
          setActiveStream(prev => ({ ...prev, status: 'live' }));
        }
      }, 1000);
      return () => clearInterval(timer);
    }
    setPreCountdownSecs(null);
  }, [activeStream.status, activeStream.scheduledTime]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Subtle background chat simulation
  useEffect(() => {
    const addMessageInterval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newUser = INCOMING_USERS[Math.floor(Math.random() * INCOMING_USERS.length)];
      const newText = INCOMING_CHAT_SIM[Math.floor(Math.random() * INCOMING_CHAT_SIM.length)];

      const newMsg: ChatMessage = {
        id: performance.now().toString(),
        user: newUser,
        text: newText,
        time: timeStr,
      };

      setChatMessages(prev => [...prev.slice(-25), newMsg]);
      playTick();
    }, 9000 + Math.random() * 8000);

    return () => clearInterval(addMessageInterval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const userMsg: ChatMessage = {
      id: performance.now().toString(),
      user: 'You',
      text: chatInput.trim(),
      time: timeStr,
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    playClick(800, 'sine', 0.02);
  };

  // Determine video render element
  const renderVideoPlayer = () => {
    const playbackId = activeStream.playbackId;

    if (!playbackId) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-6 text-center select-none">
          <div className="flex flex-col items-center gap-3">
            <Radio className="w-8 h-8 text-[#D8163F] opacity-70 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-[#D8163F] uppercase">
              BROADCAST OFFLINE
            </span>
            <p className="text-[10px] font-mono text-zinc-500 max-w-xs leading-relaxed">
              No live OBS broadcast is currently transmitting. Select a recorded session below to watch.
            </p>
          </div>
        </div>
      );
    }

    const ytId = getYouTubeEmbedId(playbackId);
    if (ytId) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
          title={activeStream.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      );
    }

    const twitchChannel = getTwitchChannel(playbackId);
    if (twitchChannel) {
      const parentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      return (
        <iframe
          src={`https://player.twitch.tv/?channel=${twitchChannel}&parent=${parentDomain}&autoplay=true`}
          frameBorder="0"
          allowFullScreen
          scrolling="no"
          className="w-full h-full"
        />
      );
    }

    // Direct HLS stream link (.m3u8)
    if (playbackId.endsWith('.m3u8') || playbackId.startsWith('http')) {
      return <HlsPlayer src={playbackId} title={activeStream.title} />;
    }

    // Cloudflare Stream Player (Universal iframe)
    const { iframeUrl } = getCloudflareStreamPlaybackUrl(playbackId);
    return (
      <iframe
        src={`${iframeUrl}?autoplay=true&muted=true&preload=auto`}
        title={activeStream.title}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    );
  };

  const isLive = activeStream.status === 'live';

  return (
    <PageShell>
      <main className="min-h-[100dvh] text-zinc-100 selection:bg-[#D8163F]/30 selection:text-[#D8163F] pt-24 pb-20 px-4 md:px-8 w-full relative overflow-y-auto custom-scrollbar">
        {/* Section Header */}
        <div className="relative z-10 mb-8 md:mb-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="font-avathe font-bold text-white text-[clamp(2rem,5vw,4.5rem)] leading-none tracking-wider uppercase select-none">
              LIVE STREAM
            </h1>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-[0.25em] mt-3">
              DIRECT OBS STUDIO BROADCAST // CLOUDFLARE STREAM
            </p>
          </motion.div>
        </div>

        {/* Master Content Layout */}
        <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch select-none font-mono">
          {/* Stream Player Container (2/3 width) */}
          <div className="lg:col-span-2 bg-[#09090b] border border-white/[0.08] p-4 md:p-5 relative flex flex-col gap-4">
            {/* Top Status Bar */}
            <div className="w-full flex justify-between items-center text-[9px] text-zinc-500 uppercase tracking-widest border-b border-white/[0.06] pb-2 z-10">
              <span className="flex items-center gap-2 text-zinc-300 font-bold">
                {isLive ? (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D8163F] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#D8163F]"></span>
                    </span>
                    <span className="text-[#D8163F] font-bold">ON AIR // LIVE BROADCAST</span>
                  </>
                ) : activeStream.status === 'upcoming' ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                    </span>
                    UPCOMING STREAM SCHEDULED
                  </>
                ) : (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-600"></span>
                    </span>
                    OFFLINE // BROADCAST ARCHIVE
                  </>
                )}
              </span>

              <div className="flex items-center gap-3 text-[9px] text-zinc-500">
                <span className="text-zinc-400 font-bold">1080P60 HD</span>
                <span>•</span>
                <span className="text-zinc-400 font-bold">320 KBPS</span>
              </div>
            </div>

            {/* Video Viewport Chassis */}
            <div className="relative w-full aspect-video overflow-hidden border border-white/[0.08] bg-black z-10 flex flex-col items-center justify-center">
              {renderVideoPlayer()}
            </div>

            {/* Live Track & BPM Bar */}
            <div className="bg-black/70 border border-white/[0.06] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <Disc className="w-4 h-4 text-[#D8163F] animate-spin shrink-0" style={{ animationDuration: '3s' }} />
                <div className="flex flex-col min-w-0">
                  <span className="text-[8px] text-zinc-500 uppercase tracking-widest">NOW PLAYING:</span>
                  <span className="text-xs text-white font-bold truncate tracking-wide">
                    {currentTrack}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold tracking-wider shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-white/[0.08]">
                  <span className="text-[8px] text-zinc-500">BPM</span>
                  <span className="text-[#D8163F] font-mono">{currentBpm}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Chat Container (1/3 width) */}
          <div className="bg-[#09090b] border border-white/[0.08] p-4 flex flex-col justify-between h-[420px] lg:h-auto select-none">
            <div className="w-full border-b border-white/[0.06] pb-2 flex justify-between items-center text-[9px] text-zinc-400 uppercase tracking-widest font-bold">
              <span>LIVE CHAT</span>
              <span className="text-[#D8163F]">{isLive ? 'ACTIVE' : 'FEED'}</span>
            </div>

            {/* Scrollable messages area */}
            <div
              ref={scrollRef}
              className="flex-grow my-3 overflow-y-auto pr-1 text-left flex flex-col gap-2.5 custom-scrollbar"
            >
              {chatMessages.map(msg => (
                <div key={msg.id} className="text-[10px] leading-relaxed">
                  <span className="text-zinc-600 mr-2 text-[9px]">[{msg.time}]</span>
                  <span className={cn(
                    "font-bold uppercase mr-1.5",
                    msg.user === 'You' ? "text-emerald-400" : "text-[#D8163F]"
                  )}>
                    {msg.user}:
                  </span>
                  <span className="text-zinc-300 font-normal">{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Message input */}
            <form onSubmit={handleSendMessage} className="border-t border-white/[0.06] pt-3 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Send message..."
                maxLength={140}
                className="w-full bg-black border border-white/[0.08] px-2.5 py-1.5 font-mono text-[10px] text-white focus:outline-none focus:border-[#D8163F] placeholder-zinc-600 transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#D8163F] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#b51033] transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Broadcast History Section */}
        {history.length > 0 && (
          <div className="relative z-10 w-full max-w-5xl mx-auto mt-12 md:mt-16 text-left select-none font-mono">
            <div className="flex items-center gap-3 mb-6 border-b border-white/[0.08] pb-3">
              <span className="text-xs text-white font-bold uppercase tracking-[0.2em]">
                BROADCAST ARCHIVE // PAST SETS
              </span>
              <div className="h-[1px] flex-grow bg-zinc-900" />
              <span className="text-[9px] text-[#D8163F] font-bold uppercase tracking-widest border border-[#D8163F]/30 px-2 py-0.5 bg-[#D8163F]/5">
                {history.length} RECORDINGS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {history.map(item => {
                const isSelected = activeStream.playbackId === item.playbackId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      playClick(750, 'sine', 0.02);
                      setActiveStream(prev => ({
                        ...prev,
                        title: item.title,
                        playbackId: item.playbackId,
                        status: 'archive',
                      }));
                      window.scrollTo({ top: 120, behavior: 'smooth' });
                    }}
                    className={cn(
                      'group bg-[#09090b] border p-3 flex flex-col justify-between gap-3 cursor-pointer transition-all duration-300 relative overflow-hidden',
                      isSelected
                        ? 'border-[#D8163F] shadow-[0_0_15px_rgba(216,22,63,0.3)]'
                        : 'border-white/[0.06] hover:border-white/[0.18]'
                    )}
                  >
                    {/* Thumbnail Viewport */}
                    <div className="relative w-full aspect-video bg-black border border-white/[0.06] overflow-hidden flex items-center justify-center">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Fallback on image load error
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-black/80 border border-white/20 flex items-center justify-center group-hover:border-[#D8163F] transition-colors">
                          <Play className="w-4 h-4 text-white group-hover:text-[#D8163F] fill-current ml-0.5 transition-colors" />
                        </div>
                      </div>

                      {/* Duration Tag */}
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/90 text-white text-[8px] font-mono font-bold flex items-center gap-1 border border-white/10">
                        <Clock className="w-2.5 h-2.5 text-[#D8163F]" />
                        {item.duration}
                      </div>

                      {isSelected && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#D8163F] text-white text-[8px] font-bold tracking-wider">
                          NOW PLAYING
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 text-left">
                      <div className="flex items-center justify-between text-[8px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span>{item.date}</span>
                        <span>{item.resolution}</span>
                      </div>
                      <span className="text-white text-xs font-bold tracking-wide uppercase line-clamp-2 leading-snug group-hover:text-[#D8163F] transition-colors">
                        {item.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </PageShell>
  );
}
