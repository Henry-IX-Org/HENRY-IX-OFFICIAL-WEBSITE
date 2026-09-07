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
import { canAccessModule, ROLE_METADATA } from '@/lib/studioPermissions';
import { Lock } from 'lucide-react';

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
  onLock?: () => void;
}

export default function StudioShell({ children, onLock }: StudioShellProps) {
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
  const currentUser = useStudioStore((s) => s.currentUser);

  // Lock Console / Sign Out
  const handleLockStudio = useCallback(async () => {
    try {
      await fetch('/api/studio/auth/session', { method: 'DELETE' });
    } catch {}
    useStudioStore.getState().setCurrentUser(null);
    if (onLock) {
      onLock();
    } else {
      window.location.href = '/studio?lock=true';
    }
  }, [onLock]);

  // RBAC Access Guard: Ensure current operator is routed to an authorized module
  useEffect(() => {
    if (currentUser && !canAccessModule(currentUser.role, activeView)) {
      const primary = ROLE_METADATA[currentUser.role]?.primaryView || 'gigs-hub';
      setActiveView(primary);
    }
  }, [currentUser, activeView]);

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
    <div className="h-screen w-full bg-[#0c0d10] text-zinc-100 flex flex-col overflow-hidden font-sans select-none">
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
          onSignOut={handleLockStudio}
        />

        {/* Pillar 2: Main Center Canvas */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0d10] relative">
          
          {/* Top App Bar */}
          <header className="h-14 border-b border-white/[0.06] bg-[#14151a] flex items-center justify-between px-4 flex-shrink-0 z-40 relative">
            <div className="text-zinc-400 text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 bg-[#10b981] rounded-full" />
              <span className="font-semibold text-zinc-100 tracking-tight">HENRY IX STUDIO</span>
              <span className="text-zinc-600 hidden sm:inline">/</span>
              <span className="text-zinc-400 hidden sm:inline capitalize font-medium text-xs">
                {activeView.replace('music-', 'Music / ').replace('streaming-', 'Streaming / ').replace('assets-', 'Assets / ').replace('gigs-', 'Gigs / ').replace('social-', 'Social / ').replace('-', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Operator Presence Badge */}
              {currentUser && (
                <div 
                  onClick={() => setSettingsOpen(true)}
                  className="cursor-pointer hover:border-white/20 transition-all flex items-center gap-1.5 px-2.5 py-1 bg-[#1b1c22] border border-white/[0.08] rounded-lg text-xs font-mono shadow-sm"
                  title="Signed in operator - click to view settings"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                  <span className="text-zinc-200 font-semibold truncate max-w-[120px]">{currentUser.name}</span>
                  <span className="text-zinc-600">|</span>
                  <span className="text-[10px] text-[#D8163F] font-bold">
                    {ROLE_METADATA[currentUser.role]?.badge || currentUser.role.toUpperCase()}
                  </span>
                </div>
              )}

              {/* Quick Lock / Sign Out Button */}
              <button 
                type="button"
                onClick={handleLockStudio}
                className="flex items-center gap-1.5 px-2 py-1 bg-[#1b1c22] border border-white/[0.08] hover:border-red-500/40 hover:bg-red-950/20 text-zinc-400 hover:text-red-300 rounded-lg text-xs font-mono transition-colors shadow-sm"
                title="Lock Studio & Return to Sign In Console"
              >
                <Lock size={12} />
                <span className="hidden sm:inline text-[11px]">Lock</span>
              </button>

              {/* Universal Quick Search Button */}
              <button 
                onClick={() => setCommandPaletteOpen(true)}
                className="hidden md:flex items-center gap-2 bg-[#1b1c22] border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
              >
                <span>Quick Find</span>
                <kbd className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded border border-white/[0.08] text-zinc-400">⌘K</kbd>
              </button>

              {/* Notification Center Popover Trigger */}
              <NotificationCenter 
                onAction={(action, payload) => {
                  const addToast = useStudioStore.getState().addToast;
                  if (action === 'view-bag') {
                    setActiveView('gigs-checklist');
                    setRequestedDrawerTab('checklist');
                    setRightDrawerOpen(true);
                    addToast({ title: 'SMART BAG CHECKLIST', message: 'Showing active gig hardware checklist.', type: 'info' });
                  } else if (action === 'view-gig') {
                    setActiveView('gigs-hub');
                    setRequestedDrawerTab('logistics');
                    setRightDrawerOpen(true);
                    addToast({ title: 'GIG HUB & LOGISTICS', message: 'Opening tour itinerary and call-times.', type: 'info' });
                  } else if (action === 'triage-assets') {
                    setActiveView('assets-vault');
                    setRequestedDrawerTab('assets');
                    setRightDrawerOpen(true);
                    addToast({ title: 'ASSET VAULT', message: 'Showing newly synced Google Drive clips.', type: 'info' });
                  } else if (action === 'view-tracks') {
                    setActiveView('music-all');
                    setRequestedDrawerTab('dj-utility');
                    setRightDrawerOpen(true);
                    addToast({ title: 'MUSIC LIBRARY', message: 'Showing verified Notion tracks collection.', type: 'info' });
                  } else if (action === 'view-setlist') {
                    setActiveView('music-set-planning');
                    setRequestedDrawerTab('setlist');
                    setRightDrawerOpen(true);
                    addToast({ title: 'SET PLANNING', message: 'Showing active dual-workbench setlist.', type: 'info' });
                  } else if (action === 'connect-obs') {
                    setActiveView('streaming-live');
                    setRequestedDrawerTab('stream-telemetry');
                    setRightDrawerOpen(true);
                    addToast({ title: 'OBS BROADCAST', message: 'Stream console and telemetry monitor active.', type: 'info' });
                  } else if (action === 'open-scanner') {
                    setActiveView('gigs-scanner');
                    setRequestedDrawerTab('admissions');
                    setRightDrawerOpen(true);
                    addToast({ title: 'DOOR SCANNER', message: 'Guestlist QR check-in engaged.', type: 'info' });
                  } else if (action === 'open-settings') {
                    setSettingsOpen(true);
                  } else if (action === 'open-copilot') {
                    setRightDrawerOpen(true);
                    setRequestedDrawerTab('copilot');
                  } else if (action === 'play-track' && payload) {
                    useStudioStore.getState().playTrack(payload);
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
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all border ${
                  rightDrawerOpen && requestedDrawerTab === 'copilot'
                    ? 'border-[#E53558] text-[#E53558] bg-[#E53558]/10' 
                    : 'border-white/[0.08] bg-[#1b1c22] text-zinc-300 hover:text-white hover:border-white/20'
                }`}
                title="Toggle Context Toolkit & AI Copilot"
              >
                <span>💬 Copilot</span>
              </button>
            </div>
          </header>

          {/* Canvas Scrollable Surface */}
          <main className="flex-1 overflow-auto custom-scrollbar relative bg-[#0c0d10]">
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
              className="w-1 cursor-col-resize hover:bg-[#E53558]/80 active:bg-[#E53558] bg-white/[0.06] h-full absolute left-0 top-0 z-30 transition-colors"
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
