'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { playClick } from '@/lib/audioUtils';
import { useAudioStore } from '@/store/audioStore';
import { audioEngine } from '@/lib/AudioEngine';
import { PlayheadScrubber } from '@/components/PlayheadScrubber';
import { DECK_COLORS, DeckId } from '@/lib/theme';

export function FloatingPlayer() {
  const pathname = usePathname();
  const decks = useAudioStore(s => s.decks);

  // Marquee pause-scroll measurement state
  const titleContainerRef = React.useRef<HTMLDivElement>(null);
  const titleTextRef = React.useRef<HTMLSpanElement>(null);
  const [scrollOverflow, setScrollOverflow] = React.useState(0);

  // Dynamic active deck detection: follows currently playing deck, then ready deck, then Deck 1
  const activeDeckId = React.useMemo(() => {
    const playingId = [1, 2, 3, 4].find(id => decks[id]?.isPlaying);
    if (playingId) return playingId;
    const readyId = [1, 2, 3, 4].find(id => decks[id]?.isReady || decks[id]?.title);
    if (readyId) return readyId;
    return 1;
  }, [decks]);

  const deck = decks[activeDeckId] || decks[1];

  // Measure title marquee overflow
  React.useEffect(() => {
    if (titleTextRef.current && titleContainerRef.current) {
      const containerWidth = titleContainerRef.current.clientWidth;
      const textWidth = titleTextRef.current.scrollWidth;
      const diff = textWidth - containerWidth;
      setScrollOverflow(diff > 4 ? diff + 16 : 0);
    }
  }, [deck?.title]);

  const seekDelta = React.useCallback((seconds: number) => {
    if (!deck || !deck.duration) return;
    playClick(1100, 'sine', 0.02);
    const newTime = Math.max(0, Math.min(deck.duration, deck.progress + seconds));
    audioEngine.seekLocalBuffer(activeDeckId, newTime);
  }, [deck, activeDeckId]);

  // Hide on mixes page or if no deck exists
  if (pathname === '/mixes' || !deck) return null;

  const activeColor = DECK_COLORS[activeDeckId as DeckId]?.tailwind || DECK_COLORS[1].tailwind;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] bg-zinc-950/95 backdrop-blur-md border ${activeColor.border} text-white shadow-2xl shadow-black/90 transition-all duration-300 ease-in-out select-none w-[270px] sm:w-[290px] p-3 rounded-none`}
    >
      {/* Dynamic Keyframe Injection for Pause-Scroll Marquee */}
      {scrollOverflow > 0 && (
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pauseScrollAnim_${activeDeckId} {
            0%, 20% { transform: translateX(0); }
            60%, 80% { transform: translateX(-${scrollOverflow}px); }
            95%, 100% { transform: translateX(0); }
          }
        ` }} />
      )}

      {/* Top Header Row: Dynamic Deck Indicator & Status */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-900/90">
        {/* Dynamic Glowing Deck Indicator */}
        <div className="flex items-center gap-2">
          <span 
            className={`text-[9px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 border ${activeColor.badge} ${deck.isPlaying ? activeColor.glow : ''}`}
          >
            DECK {activeDeckId}
          </span>
          
          {/* Audio Activity LED / Indicator */}
          {deck.isPlaying ? (
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${activeColor.bg} animate-pulse`} />
              <span className={`text-[8px] font-mono font-bold tracking-widest uppercase ${activeColor.text}`}>
                PLAYING
              </span>
            </div>
          ) : (
            <span className="text-[8px] font-mono tracking-widest uppercase text-zinc-500">
              STANDBY
            </span>
          )}
        </div>

        {/* Elapsed / Total Time */}
        <div className="text-[9px] font-mono text-zinc-400 tracking-wider">
          <span>{formatTime(deck.progress)}</span>
          <span className="text-zinc-600 mx-1">/</span>
          <span className="text-zinc-500">{formatTime(deck.duration)}</span>
        </div>
      </div>

      {/* Middle Row: Track Title & Artist */}
      <div className="mb-2.5 overflow-hidden" ref={titleContainerRef}>
        <div
          className="whitespace-nowrap inline-block"
          style={
            scrollOverflow > 0
              ? {
                  animation: `pauseScrollAnim_${activeDeckId} 8s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite`,
                }
              : undefined
          }
        >
          <span ref={titleTextRef} className="text-xs font-bold tracking-wide text-zinc-100 font-mono">
            {deck.title || `Deck ${activeDeckId} Ready`}
          </span>
        </div>
        {deck.artist && (
          <div className="text-[10px] text-zinc-400 font-mono truncate tracking-tight mt-0.5">
            {deck.artist}
          </div>
        )}
      </div>

      {/* Timeline Scrubber */}
      <div className="mb-2.5">
        <PlayheadScrubber
          progress={deck.progress}
          duration={deck.duration}
          activeColorBg={activeColor.bg}
          showTimestamps={false}
          onSeek={(seekTime) => audioEngine.seekLocalBuffer(activeDeckId, seekTime)}
        />
      </div>

      {/* Tactile Hardware Controls Suite */}
      <div className="flex items-center justify-between pt-1 border-t border-zinc-900/60">
        {/* Rewind 10s */}
        <button
          onClick={() => seekDelta(-10)}
          title="Rewind 10s"
          aria-label="Rewind 10 seconds"
          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all font-mono text-[10px] flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
          </svg>
          <span className="text-[9px] font-bold">-10s</span>
        </button>

        {/* Center Play / Pause Button */}
        <button
          onClick={() => audioEngine.togglePlayGlobal(activeDeckId)}
          aria-label={deck.isPlaying ? "Pause audio" : "Play audio"}
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
            deck.isPlaying
              ? `${activeColor.bg} text-black ${activeColor.glow}`
              : 'bg-zinc-800 hover:bg-zinc-700 text-white'
          }`}
        >
          {deck.isPlaying ? (
            <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Fast Forward 10s */}
        <button
          onClick={() => seekDelta(10)}
          title="Fast Forward 10s"
          aria-label="Fast forward 10 seconds"
          className="px-2 py-1 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all font-mono text-[10px] flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <span className="text-[9px] font-bold">+10s</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.934 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
