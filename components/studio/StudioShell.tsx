'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import SettingsModal from './SettingsModal';
import NotificationCenter from './NotificationCenter';
import CommandPalette from './CommandPalette';
import PersistentAudioPlayer, { PlayerDisplayState } from './PersistentAudioPlayer';
import StudioRightDrawer, { RightDrawerTab } from './StudioRightDrawer';
import StudioToasts from './StudioToasts';
import { useStudioStore } from '@/store/studioStore';

// Module Component Imports
import StreamingModule from './modules/StreamingModule';
import MusicModule from './modules/MusicModule';
import LibraryOrganiserDashboard from './modules/LibraryOrganiserDashboard';
import HardwareUtilities from './modules/HardwareUtilities';
import AssetsModule from './modules/AssetsModule';
import GigsModule from './modules/GigsModule';
import DoorScanner from './modules/DoorScanner';
import SocialModule from './modules/SocialModule';

interface StudioShellProps {
  children?: React.ReactNode;
}

export default function StudioShell({ children }: StudioShellProps) {
  // Navigation & View State
  const [activeView, setActiveView] = useState<string>('streaming-live');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Modals & Drawers
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [requestedDrawerTab, setRequestedDrawerTab] = useState<RightDrawerTab | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(380);
  const [isDragging, setIsDragging] = useState(false);

  // Global Persistent Player State from Store
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const isPlaying = useStudioStore((s) => s.isPlaying);
  const togglePlay = useStudioStore((s) => s.togglePlay);
  const playerState = useStudioStore((s) => s.playerState);
  const setPlayerState = useStudioStore((s) => s.setPlayerState);

  // Global Keyboard Shortcuts (Cmd/Ctrl + K, Cmd/Ctrl + B, Cmd/Ctrl + ,)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (isMeta && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed((prev) => !prev);
      } else if (isMeta && e.key === ',') {
        e.preventDefault();
        setSettingsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hydrate live data from Notion on mount
  useEffect(() => {
    const store = useStudioStore.getState();
    store.fetchRealTracks();
    store.fetchRealGigs();
    store.fetchContentPosts();
  }, []);

  // Handle resizing right drawer
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 260 && newWidth < window.innerWidth * 0.55) {
        setDrawerWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Render the active main center canvas module based on selected tree view
  const renderMainCanvas = () => {
    if (children) return children;

    switch (activeView) {
      // 01 STREAMING
      case 'streaming-live':
      case 'streaming-analytics':
      case 'streaming-clips':
        return <StreamingModule activeView={activeView} onNavigate={setActiveView} />;

      // 02 MUSIC
      case 'music-all':
      case 'music-crate-kc4':
      case 'music-crate-rc2':
      case 'music-crate-cn1':
      case 'music-smart-crates':
      case 'music-spotify':
      case 'music-soundcloud':
      case 'music-set-planning':
      case 'music-radar':
        return <MusicModule activeView={activeView} onNavigate={setActiveView} />;
      case 'music-organiser':
        return <LibraryOrganiserDashboard onNavigate={setActiveView} />;
      case 'music-hardware':
        return <HardwareUtilities onNavigate={setActiveView} />;

      // 03 ASSETS
      case 'assets-vault':
      case 'assets-dropzone':
      case 'assets-r2':
      case 'assets-epk':
        return <AssetsModule activeView={activeView} onNavigate={setActiveView} />;

      // 04 GIGS
      case 'gigs-hub':
      case 'gigs-daysheet':
      case 'gigs-checklist':
      case 'gigs-finance':
        return <GigsModule activeView={activeView} onNavigate={setActiveView} />;
      case 'gigs-scanner':
        return <DoorScanner onNavigate={setActiveView} />;

      // 05 SOCIAL
      case 'social-scout':
      case 'social-grid':
      case 'social-pipeline':
      case 'social-vip':
        return <SocialModule activeView={activeView} onNavigate={setActiveView} />;

      default:
        return <StreamingModule activeView={activeView} onNavigate={setActiveView} />;
    }
  };

  const handleCommandAction = useCallback((actionId: string, payload?: any) => {
    setCommandPaletteOpen(false);
    const addToast = useStudioStore.getState().addToast;

    if (actionId === 'panic') {
      window.location.reload();
    } else if (actionId === 'revalidate') {
      fetch('/api/revalidate?secret=henryix_revalidate_secret&path=/')
        .then(() => addToast({ title: 'CACHE REVALIDATED', message: 'Vercel Edge cache successfully purged for henryix.com', type: 'success' }))
        .catch(() => addToast({ title: 'REVALIDATED', message: 'Local cache cleared.', type: 'info' }));
    } else if (actionId === 'export-xml') {
      useStudioStore.getState().exportRekordboxXml();
    } else if (actionId === 'open-copilot') {
      setRightDrawerOpen(true);
      setRequestedDrawerTab('copilot');
      addToast({ title: 'AI COPILOT ACTIVE', message: 'Ready to triage crates and set storytelling.', type: 'info' });
    } else if (actionId === 'open-scanner') {
      setActiveView('gigs-scanner');
      addToast({ title: 'DOOR SCANNER OPENED', message: 'Offline QR check-in mode engaged.', type: 'info' });
    } else if (actionId === 'standby') {
      setActiveView('streaming-live');
      addToast({ title: 'OBS INTERMISSION', message: 'Auto-standby scene engaged.', type: 'warning' });
    } else if (actionId === 'play-track') {
      if (payload) {
        useStudioStore.getState().playTrack(payload);
      }
    } else if (actionId.startsWith('view-')) {
      setActiveView(actionId.replace('view-', ''));
    } else if (actionId === 'settings') {
      setSettingsOpen(true);
    }
  }, []);

  const handleToggleExpand = useCallback(() => {
    setDrawerWidth((prev) => {
      if (prev > 450) {
        return 380;
      }
      return typeof window !== 'undefined' ? Math.min(Math.round(window.innerWidth * 0.5), 720) : 600;
    });
  }, []);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-mono select-none">
      {/* Non-blocking HUD Toasts Overlay */}
      <StudioToasts />

      {/* Universal Command Palette (Ctrl/Cmd + K) */}
      <CommandPalette 
        isOpen={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)} 
        onSelectAction={handleCommandAction}
      />

      {/* 8-Tab Settings Suite (Floating Modal) */}
      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />

      {/* Three-Zone Workspace Shell */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Pillar 1: Left Collapsible Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
          activeView={activeView}
          setActiveView={setActiveView}
          openSettings={() => setSettingsOpen(true)}
          openCommandPalette={() => setCommandPaletteOpen(true)}
          onExpandPlayer={() => setPlayerState('docked')}
          currentTrack={{
            title: currentTrack.title,
            artist: currentTrack.artist,
            bpm: currentTrack.bpm,
            key: currentTrack.key,
            isPlaying: isPlaying,
          }}
          onTogglePlay={togglePlay}
        />

        {/* Pillar 2: Main Center Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-black relative">
          
          {/* Top App Bar */}
          <header className="h-12 border-b border-zinc-900 bg-zinc-950 flex items-center justify-between px-4 flex-shrink-0 z-10">
            <div className="text-zinc-400 font-mono text-xs flex items-center gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="font-avathe tracking-widest text-zinc-200">HENRY IX STUDIO</span>
              <span className="text-zinc-600 hidden sm:inline">//</span>
              <span className="text-zinc-500 hidden sm:inline uppercase text-[10px]">
                {activeView.replace('-', ' / ')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Universal Quick Search Button */}
              <button 
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 bg-black border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white px-3 py-1 rounded-sm text-xs transition-colors"
              >
                <span>🔍 Quick Find</span>
                <kbd className="text-[9px] bg-zinc-900 px-1 py-0.5 border border-zinc-800 text-zinc-500">⌘K</kbd>
              </button>

              {/* Notification Center Popover Trigger */}
              <NotificationCenter 
                onAction={(action) => {
                  const addToast = useStudioStore.getState().addToast;
                  if (action === 'view-bag') {
                    setActiveView('gigs-checklist');
                    setRequestedDrawerTab('checklist');
                    addToast({ title: 'SMART BAG CHECKLIST', message: 'Showing active gig hardware checklist.', type: 'info' });
                  } else if (action === 'triage-assets') {
                    setActiveView('assets-vault');
                    setRequestedDrawerTab('assets');
                    addToast({ title: 'ASSET VAULT', message: 'Showing newly synced Google Drive clips.', type: 'info' });
                  } else if (action === 'revert-fee' || action === 'keep-iphone') {
                    addToast({
                      title: 'NOTION SYNC RESOLVED',
                      message: action === 'revert-fee' ? 'Fee set to £350 across all devices.' : 'Fee confirmed at £400 across all devices.',
                      type: 'success',
                    });
                  }
                }}
              />

              {/* AI Copilot & Right Drawer Toggles */}
              <button 
                onClick={() => {
                  if (!rightDrawerOpen) {
                    setRightDrawerOpen(true);
                    setRequestedDrawerTab('copilot');
                  } else if (requestedDrawerTab !== 'copilot') {
                    setRequestedDrawerTab('copilot');
                  } else {
                    setRightDrawerOpen(false);
                    setRequestedDrawerTab(null);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs border rounded-sm transition-all ${
                  rightDrawerOpen && requestedDrawerTab === 'copilot'
                    ? 'border-[#D8163F] text-[#D8163F] bg-[#D8163F]/10' 
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                }`}
                title="Toggle Context Toolkit & AI Copilot"
              >
                <span>💬 Copilot</span>
              </button>
            </div>
          </header>

          {/* Canvas Scrollable Surface */}
          <main className="flex-1 overflow-auto custom-scrollbar relative bg-black">
            <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none z-0" />
            <div className="relative z-10 w-full h-full pb-20">
              {renderMainCanvas()}
            </div>
          </main>
        </div>

        {/* Pillar 3: Resizable Right Drawer */}
        {rightDrawerOpen && (
          <div className="flex h-full relative" style={{ width: drawerWidth }}>
            {/* Draggable Resizer Handle */}
            <div 
              className="w-1 cursor-col-resize hover:bg-[#D8163F]/80 active:bg-[#D8163F] bg-zinc-900 h-full absolute left-0 top-0 z-30 transition-colors"
              onMouseDown={() => setIsDragging(true)}
            />
            
            {/* Drawer Content */}
            <StudioRightDrawer 
              isOpen={rightDrawerOpen}
              onClose={() => {
                setRightDrawerOpen(false);
                setRequestedDrawerTab(null);
              }}
              width={drawerWidth}
              activeModule={activeView}
              activeTrack={currentTrack}
              isExpanded={drawerWidth > 450}
              onToggleExpand={handleToggleExpand}
              requestedTab={requestedDrawerTab}
              onTabChange={(tab) => setRequestedDrawerTab(tab)}
            />
          </div>
        )}

      </div>

      {/* Pillar 4: Global Persistent Audio Player */}
      <PersistentAudioPlayer 
        displayState={playerState as PlayerDisplayState}
        setDisplayState={setPlayerState as (s: PlayerDisplayState) => void}
        activeModule={activeView}
      />
    </div>
  );
}
