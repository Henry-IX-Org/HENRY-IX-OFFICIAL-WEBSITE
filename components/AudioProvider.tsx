'use client';

import React, { useEffect, createContext, useContext, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAudioStore } from '@/store/audioStore';
import { audioEngine } from '@/lib/AudioEngine';
import { playLockoutBlip } from '@/lib/audioUtils';
import { FloatingPlayer } from '@/components/FloatingPlayer';
import { isStudioContext } from '@/lib/studioRouting';

// Context wrapper for backward compatibility with components using useAudio()
export const AudioContext = createContext<any>(null);
export const useAudio = () => useContext(AudioContext);

export { isStudioContext };

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStudioSubdomain =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'studio.henryix.com' ||
     window.location.hostname.startsWith('studio.localhost') ||
     window.location.hostname.startsWith('studio.'));
  const isStudio = isStudioSubdomain || isStudioContext(pathname);
  const preloaderComplete = useAudioStore(s => s.preloaderComplete);
  const [mountedDecks, setMountedDecks] = React.useState<number[]>([]);

  // ── Teardown public audio playback on entering Studio context ──────────────
  useEffect(() => {
    if (isStudio) {
      try {
        [1, 2, 3, 4].forEach(deckId => {
          const el = audioEngine.audioElements[deckId];
          if (el && !el.paused) {
            el.pause();
          }
        });
        const actx = (audioEngine as any).audioCtx;
        if (actx && actx.state === 'running') {
          actx.suspend().catch(() => {});
        }
      } catch (e) {}
    }
  }, [isStudio]);

  // ── Preload track waveforms dynamically only on Mixes / CDJ view ────────
  const isCDJView = useAudioStore(s => s.isCDJView);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStudioSub =
        window.location.hostname === 'studio.henryix.com' ||
        window.location.hostname.startsWith('studio.localhost') ||
        window.location.hostname.startsWith('studio.');
      if (isStudioSub || window.location.pathname.startsWith('/studio')) {
        return;
      }
    }
    if (isStudio) return;
    if (pathname !== '/mixes' && !isCDJView) return;

    import('@/app/trackWaveforms.json')
      .then((m) => {
        const trackWaveforms = m.default as Record<string, number[]>;
        audioEngine.setDynamicWaveforms(trackWaveforms);
        const decks = useAudioStore.getState().decks;
        for (const deckIdStr of ['1', '2', '3', '4']) {
          const deckId = Number(deckIdStr);
          const deck = decks[deckId];
          if (deck && deck.id) {
            const peaks = trackWaveforms[deck.id];
            if (peaks) {
              useAudioStore.getState().setDeck(deckId, { waveformPeaks: peaks });
            }
          }
        }
      })
      .catch(err => console.error('Failed to import trackWaveforms:', err));
  }, [isStudio, pathname, isCDJView]);

  // ── Body scroll lock while preloader is active ─────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || isStudio) return;

    if (!preloaderComplete) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [preloaderComplete, isStudio]);

  // ── Load saved state from LocalStorage on mount ────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || isStudio) return;

    try {
      const saved = localStorage.getItem('henryix_audio_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.crossfader !== undefined) useAudioStore.getState().setCrossfader(parsed.crossfader);
        if (parsed.leftActiveDeck !== undefined) useAudioStore.getState().setLeftActiveDeck(parsed.leftActiveDeck);
        if (parsed.rightActiveDeck !== undefined) useAudioStore.getState().setRightActiveDeck(parsed.rightActiveDeck);
        if (parsed.isMuted !== undefined) useAudioStore.getState().setIsMuted(parsed.isMuted);
        if (parsed.isStacked !== undefined) useAudioStore.getState().setStacked(parsed.isStacked);
      }
    } catch (e) {
      console.warn('Failed to load settings from localStorage:', e);
    }
  }, [isStudio]);

  // ── Save settings to LocalStorage on store change ──────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || isStudio) return;

    const unsubscribe = useAudioStore.subscribe(
      state => ({
        crossfader: state.crossfader,
        leftActiveDeck: state.leftActiveDeck,
        rightActiveDeck: state.rightActiveDeck,
        isMuted: state.isMuted,
        isStacked: state.isStacked,
      }),
      slice => {
        try {
          localStorage.setItem('henryix_audio_settings', JSON.stringify(slice));
        } catch (e) {}
      }
    );
    return unsubscribe;
  }, [isStudio]);

  // ── First gesture user interaction unlock to satisfy browser security ──────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isStudioHost =
        window.location.hostname === 'studio.henryix.com' ||
        window.location.hostname.startsWith('studio.localhost') ||
        window.location.hostname.startsWith('studio.');
      if (isStudioHost || window.location.pathname.startsWith('/studio')) {
        return;
      }
    }
    if (isStudio) return;

    const unlockAudio = () => {
      if (typeof window !== 'undefined') {
        const isStudioHost =
          window.location.hostname === 'studio.henryix.com' ||
          window.location.hostname.startsWith('studio.localhost') ||
          window.location.hostname.startsWith('studio.');
        if (isStudioHost || window.location.pathname.startsWith('/studio')) {
          return;
        }
      }
      if (isStudio) return;

      audioEngine.initAudioDSP();
      [1, 2, 3, 4].forEach(deckId => {
        audioEngine.ensureDeckInitialized(deckId);
        const audio = audioEngine.audioElements[deckId];
        if (audio) {
          audio.play().then(() => audio.pause()).catch(() => {});
        }
      });
      document.removeEventListener('click', unlockAudio, { capture: true });
      document.removeEventListener('touchstart', unlockAudio, { capture: true });
    };
    document.addEventListener('click', unlockAudio, { capture: true });
    document.addEventListener('touchstart', unlockAudio, { capture: true });

    const handleVisibility = () => {
      if (typeof window !== 'undefined') {
        const isStudioHost =
          window.location.hostname === 'studio.henryix.com' ||
          window.location.hostname.startsWith('studio.localhost') ||
          window.location.hostname.startsWith('studio.');
        if (isStudioHost || window.location.pathname.startsWith('/studio')) {
          return;
        }
      }
      if (isStudio) return;

      const actx = audioEngine.initAudioDSP();
      if (actx) {
        if (document.hidden) {
          const isAnyPlaying = Object.values(useAudioStore.getState().decks).some((d: any) => d?.isPlaying);
          if (!isAnyPlaying) {
            actx.suspend().catch(() => {});
          }
        } else {
          actx.resume().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('click', unlockAudio, { capture: true });
      document.removeEventListener('touchstart', unlockAudio, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isStudio]);

  // ── Preload local audio tracks after preloader is done ─────────────────────
  useEffect(() => {
    if (isStudio) return;

    if (preloaderComplete) {
      const timer = setTimeout(() => {
        if (isStudio) return;
        [1, 2, 3, 4].forEach(deckId => {
          audioEngine.ensureDeckInitialized(deckId);
          const audio = audioEngine.audioElements[deckId];
          const deck = useAudioStore.getState().decks[deckId];
          if (audio && deck?.url && !audioEngine.loadedUrls[deckId]) {
            audio.preload = 'none';
            audio.src = new URL(deck.url, window.location.origin).href;
            audioEngine.loadedUrls[deckId] = deck.url;
          }
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [preloaderComplete, isStudio]);

  // ── Subscribe to decks scMode to lazily mount SoundCloud players ───────────
  useEffect(() => {
    if (isStudio) return;

    const unsubscribe = useAudioStore.subscribe(
      state => [1, 2, 3, 4].map(id => state.decks[id]?.scMode ?? false),
      (scModes: boolean[]) => {
        let changed = false;
        const nextMounted = [...mountedDecks];
        scModes.forEach((isSc, idx) => {
          const deckId = idx + 1;
          if (isSc && !nextMounted.includes(deckId)) {
            nextMounted.push(deckId);
            changed = true;
          } else if (!isSc && nextMounted.includes(deckId)) {
            nextMounted.splice(nextMounted.indexOf(deckId), 1);
            audioEngine.widgetRefs[deckId] = null;
            changed = true;
          }
        });
        if (changed) {
          setMountedDecks(nextMounted);
        }
      }
    );
    return unsubscribe;
  }, [mountedDecks, isStudio]);

  // ── Lazy load SoundCloud API Script and initialize widgets ─────────────────
  useEffect(() => {
    if (isStudio) return;

    const loadAndInit = () => {
      if ((window as any).SC) {
        mountedDecks.forEach(id => {
          const iframeEl = document.getElementById(`sc-iframe-${id}`) as HTMLIFrameElement;
          if (iframeEl) audioEngine.initSCWidget(id, iframeEl);
        });
      } else if (!document.querySelector('script[src="https://w.soundcloud.com/player/api.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.onload = () => {
          mountedDecks.forEach(id => {
            const iframeEl = document.getElementById(`sc-iframe-${id}`) as HTMLIFrameElement;
            if (iframeEl) audioEngine.initSCWidget(id, iframeEl);
          });
        };
        document.body.appendChild(script);
      } else {
        setTimeout(loadAndInit, 100);
      }
    };
    if (mountedDecks.length > 0) {
      loadAndInit();
    }
  }, [mountedDecks, isStudio]);

  // ── Global media session toggler registry ──────────────────────────────────
  useEffect(() => {
    if (isStudio) return;

    (window as any).togglePlayGlobal = (deckIdInput?: number) => {
      const { decks: d, leftActiveDeck: lad } = useAudioStore.getState();
      const activeDeck = [1, 2, 3, 4].map(id => d[id]).find(dk => dk.isPlaying) || d[lad] || d[1];
      const deckId = deckIdInput !== undefined ? deckIdInput : ([1, 2, 3, 4].find(id => d[id].id === activeDeck.id) || 1);
      audioEngine.togglePlayGlobal(deckId);
    };
    return () => { delete (window as any).togglePlayGlobal; };
  }, [isStudio]);

  // ── Native OS Media Session API (Lockscreen / Control Center controls) ─────
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator) || isStudio) return;

    const unsubscribe = useAudioStore.subscribe(
      state => [1, 2, 3, 4].map(id => ({
        id,
        isPlaying: state.decks[id]?.isPlaying ?? false,
        title: state.decks[id]?.title ?? '',
        artist: state.decks[id]?.artist ?? 'HENRY IX',
        artwork: state.decks[id]?.artwork ?? '',
        genre: state.decks[id]?.genre ?? '',
      })),
      (activeDecksData) => {
        const playingDeck = activeDecksData.find(d => d.isPlaying);
        if (playingDeck && playingDeck.title) {
          try {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: playingDeck.title,
              artist: playingDeck.artist || 'HENRY IX',
              album: playingDeck.genre ? `HENRY IX // ${playingDeck.genre.toUpperCase()}` : 'HENRY IX TRANSMISSION',
              artwork: playingDeck.artwork ? [
                { src: playingDeck.artwork, sizes: '512x512', type: 'image/jpeg' },
              ] : [
                { src: 'https://pub-c7c5ff43a8ae174ad91e2668de0ad7f0.r2.dev/Mixes/Knight%20Club/Mix%20Artwork/Knight%20Club%20Track%20Artwork%20Session%201.jpg', sizes: '512x512', type: 'image/jpeg' }
              ],
            });
            navigator.mediaSession.playbackState = 'playing';
          } catch (e) {
            // MediaMetadata error fallback
          }
        } else {
          try {
            navigator.mediaSession.playbackState = 'paused';
          } catch (e) {
            // MediaSession error fallback
          }
        }
      }
    );

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        const { leftActiveDeck, decks } = useAudioStore.getState();
        const deckId = [1, 2, 3, 4].find(id => decks[id]?.isPlaying) || leftActiveDeck || 1;
        audioEngine.togglePlayGlobal(deckId);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        const { decks } = useAudioStore.getState();
        const playingId = [1, 2, 3, 4].find(id => decks[id]?.isPlaying);
        if (playingId) audioEngine.togglePlayGlobal(playingId);
      });
    } catch (e) {
      // Ignore unsupported action handler errors
    }

    return () => unsubscribe();
  }, [isStudio]);

  // ── Construct Context value mapped to AudioEngine refs and math ───────────
  const contextValue = useMemo(() => {
    if (isStudio) {
      return {
        // Dummy/no-op refs and methods in studio context to prevent any audio execution
        audioElementsRef: { current: { 1: null, 2: null, 3: null, 4: null } },
        playPendingRef: { current: { 1: false, 2: false, 3: false, 4: false } },
        scratchingRef: { current: { 1: false, 2: false, 3: false, 4: false } },
        widgetRefs: { current: { 1: null, 2: null, 3: null, 4: null } },
        initAudioDSP: () => null,
        loadLocalFile: () => Promise.resolve(),
        seekLocalBuffer: () => {},
        togglePlayGlobal: () => {},
        handleCueDown: () => {},
        handleCueUp: () => {},
        setTemporaryCue: () => {},
        halveLoop: () => {},
        doubleLoop: () => {},
        loadTrack: () => {},
        playTrack: () => {},
        alignSyncPlayback: () => {},
        playLockoutBlip: () => {},
        get isMuted() { return false; },
        setIsMuted: () => {},
        get preloaderComplete() { return true; },
        setPreloaderComplete: () => {},
        get decks() { return useAudioStore.getState().decks; },
        setDecks: () => {},
        get crossfader() { return 0.5; },
        get leftActiveDeck() { return 1; },
        get rightActiveDeck() { return 2; },
        get analyserNode() { return null; },
        get deckAnalysers() { return { 1: null, 2: null, 3: null, 4: null }; }
      };
    }

    return {
      // Live refs and methods for public site
      audioElementsRef: { current: audioEngine.audioElements },
      playPendingRef: { current: audioEngine.playPending },
      scratchingRef: { current: audioEngine.scratching },
      widgetRefs: { current: audioEngine.widgetRefs },
      initAudioDSP: () => audioEngine.initAudioDSP(),
      loadLocalFile: (deckId: number, file: File) => audioEngine.loadLocalFile(deckId, file),
      seekLocalBuffer: (deckId: number, seekTime: number) => audioEngine.seekLocalBuffer(deckId, seekTime),
      togglePlayGlobal: (deckId: number) => audioEngine.togglePlayGlobal(deckId),
      handleCueDown: (deckId: number) => audioEngine.handleCueDown(deckId),
      handleCueUp: (deckId: number) => audioEngine.handleCueUp(deckId),
      setTemporaryCue: (deckId: number, targetTime?: number) => audioEngine.setTemporaryCue(deckId, targetTime),
      halveLoop: (deckId: number) => audioEngine.halveLoop(deckId),
      doubleLoop: (deckId: number) => audioEngine.doubleLoop(deckId),
      loadTrack: (track: any, targetDeckId?: number) => audioEngine.loadTrack(track, targetDeckId),
      playTrack: (track: any, targetDeckId?: number, autoplay?: boolean) => audioEngine.playTrack(track, targetDeckId, autoplay),
      alignSyncPlayback: (deckId: number) => audioEngine.alignSyncPlayback(deckId),
      playLockoutBlip,
      get isMuted() { return useAudioStore.getState().isMuted; },
      setIsMuted: useAudioStore.getState().setIsMuted,
      get preloaderComplete() { return useAudioStore.getState().preloaderComplete; },
      setPreloaderComplete: useAudioStore.getState().setPreloaderComplete,
      get decks() { return useAudioStore.getState().decks; },
      setDecks: useAudioStore.getState().setDecks,
      get crossfader() { return useAudioStore.getState().crossfader; },
      get leftActiveDeck() { return useAudioStore.getState().leftActiveDeck; },
      get rightActiveDeck() { return useAudioStore.getState().rightActiveDeck; },
      get analyserNode() { return audioEngine.getAnalyserNode(); },
      get deckAnalysers() { return audioEngine.getDeckAnalysers(); }
    };
  }, [isStudio]);

  if (isStudio) {
    return (
      <AudioContext.Provider value={contextValue}>
        {children}
      </AudioContext.Provider>
    );
  }

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
      <FloatingPlayer />
      {/* Hidden SoundCloud Widget Iframes, mounted lazily when SC mode is active */}
      {[1, 2, 3, 4].map(deckId =>
        mountedDecks.includes(deckId) ? (
          <iframe
            key={deckId}
            id={`sc-iframe-${deckId}`}
            className="hidden"
            src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/2129822499&auto_play=false`}
            allow="autoplay"
            title={`SoundCloud Player Deck ${deckId}`}
          />
        ) : null
      )}
    </AudioContext.Provider>
  );
}
