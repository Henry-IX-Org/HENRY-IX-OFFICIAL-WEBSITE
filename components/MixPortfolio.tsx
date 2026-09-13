'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAudioStore } from '@/store/audioStore';
import { STATIC_MIX_GROUPS, proxyUrl } from '@/lib/mixes';
import { audioEngine } from '@/lib/AudioEngine';

const MixArchive = dynamic(() => import('./MixArchive'), { ssr: false });

export default function MixPortfolio({ 
  isDepth = true, 
  activeView: initialActiveView = 'cdj' 
}: { 
  isDepth?: boolean; 
  activeView?: 'cdj' | 'tracklist'; 
}) {
  const [activeView, setActiveView] = useState<'cdj' | 'tracklist'>(initialActiveView);
  const [mixGroups, setMixGroups] = useState<any[]>(() => {
    return STATIC_MIX_GROUPS.map(group => ({
      ...group,
      mixes: (group.mixes || []).filter(mix => mix.url || mix.link)
    })).filter(group => group.mixes.length > 0);
  });

  // Reactive deck state from Zustand — granular subscriptions, no cascade
  const leftActiveDeck = useAudioStore(s => s.leftActiveDeck);
  const setDecks = useAudioStore(s => s.setDecks);

  // Reference directly from the audioEngine singleton
  const togglePlayGlobal = audioEngine.togglePlayGlobal.bind(audioEngine);
  const seekLocalBuffer = audioEngine.seekLocalBuffer.bind(audioEngine);

  const widgetRefs = React.useRef(audioEngine.widgetRefs);
  React.useEffect(() => {
    widgetRefs.current = audioEngine.widgetRefs;
  });

  const seekDeckToTime = React.useCallback((deckId: number, seekPosSec: number) => {
    const deck = useAudioStore.getState().decks[deckId];
    if (!deck) return;
    const widget = widgetRefs.current[deckId];
    if (deck.scMode && widget) {
      try {
        widget.seekTo(seekPosSec * 1000);
      } catch (e) {
        setDecks((prev: any) => ({
          ...prev,
          [deckId]: { ...prev[deckId], progress: seekPosSec }
        }));
      }
    } else {
      if (seekLocalBuffer) {
        seekLocalBuffer(deckId, seekPosSec);
      }
      setDecks((prev: any) => ({
        ...prev,
        [deckId]: { ...prev[deckId], progress: seekPosSec }
      }));
    }
  }, [widgetRefs, seekLocalBuffer, setDecks]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const activeDeckId = leftActiveDeck;
      const deck = useAudioStore.getState().decks[activeDeckId];
      if (!deck) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayGlobal(activeDeckId);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        const currentVolume = deck.volume !== undefined ? deck.volume : 1;
        setDecks((prev: any) => ({
          ...prev,
          [activeDeckId]: { ...prev[activeDeckId], volume: currentVolume > 0 ? 0 : 1 }
        }));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        const currentProgress = deck.progress || 0;
        const newProgress = Math.max(0, currentProgress - 15);
        seekDeckToTime(activeDeckId, newProgress);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        const currentProgress = deck.progress || 0;
        const duration = deck.duration || 300;
        const newProgress = Math.min(duration, currentProgress + 15);
        seekDeckToTime(activeDeckId, newProgress);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leftActiveDeck, seekDeckToTime, togglePlayGlobal, setDecks]);

  useEffect(() => {
    async function loadDynamicMixes() {
      try {
        const res = await fetch('/api/mixes');
        const data: any = await res.json();
        if (data && data.groups && data.groups.length > 0) {
          setMixGroups(data.groups);

          const allMixes = data.groups.flatMap((g: any) => g.mixes);
          setDecks((prevDecks: any) => {
            const updated = { ...prevDecks };
            const kc1 = allMixes.find((m: any) => m.title.includes('Knight Club') && m.title.includes('Session 1')) || allMixes[0];
            if (kc1 && updated[1]) {
              updated[1] = {
                ...updated[1],
                id: kc1.id,
                title: kc1.title,
                url: kc1.url,
                link: kc1.link,
                bpm: kc1.bpm,
                cuePoints: kc1.cuePoints,
                artworkUrl: kc1.artworkUrl,
                tracklist: kc1.tracklist
              };
            }
            return updated;
          });
        }
      } catch (err) {
        console.warn('Mixes catalog fetch skipped or offline:', err);
      }
    }
    loadDynamicMixes();
  }, [setDecks]);

  // Preload all mix artwork images in browser cache for zero lag on hover/selection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    mixGroups.forEach(group => {
      group.mixes.forEach((mix: any) => {
        const imgUrl = mix.artworkUrl ? proxyUrl(mix.artworkUrl) : null;
        if (imgUrl) {
          const img = new window.Image();
          img.src = imgUrl;
        }
      });
    });
  }, [mixGroups]);

  return (
    <MixArchive 
      isDepth={isDepth} 
      activeView={activeView} 
      setActiveView={setActiveView}
      mixGroups={mixGroups}
      seekDeckToTime={seekDeckToTime}
    />
  );
}
