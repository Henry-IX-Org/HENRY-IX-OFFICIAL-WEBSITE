'use client';

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Search, 
  User, 
  Folder, 
  FolderOpen,
  Activity, 
  Disc, 
  Image as ImageIcon, 
  Calendar, 
  Share2, 
  Play,
  Pause,
  Radio,
  Sliders,
  Compass,
  ListMusic,
  Maximize2,
  CheckSquare,
  DollarSign,
  QrCode,
  Grid,
  Send,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  LogOut,
  Layers,
  FileCode,
  Music,
  ExternalLink
} from 'lucide-react';

export interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  openSettings: () => void;
  openCommandPalette: () => void;
  onExpandPlayer?: () => void;
  currentTrack?: {
    title: string;
    artist: string;
    bpm: number;
    key: string;
    isPlaying: boolean;
  };
  onTogglePlay?: () => void;
}

export default function Sidebar({
  collapsed,
  setCollapsed,
  activeView,
  setActiveView,
  openSettings,
  openCommandPalette,
  onExpandPlayer,
  currentTrack = {
    title: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]',
    artist: 'MAJA',
    bpm: 150,
    key: '7A',
    isPlaying: false,
  },
  onTogglePlay,
}: SidebarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<'Owner' | 'Manager' | 'Media' | 'Viewer'>('Owner');

  // Track expanded state for modules & folders
  const [expandedTrees, setExpandedTrees] = useState<Record<string, boolean>>({
    '01': true,
    '02': true,
    '02-library': true,
    '02-crates': true,
    '03': true,
    '04': true,
    '05': true,
  });

  const toggleTree = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (collapsed) {
      setCollapsed(false);
      setExpandedTrees(prev => ({ ...prev, [id]: true }));
      return;
    }
    setExpandedTrees(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectView = (viewKey: string) => {
    setActiveView(viewKey);
  };

  const getItemClass = (viewKey: string) => {
    const isActive = activeView === viewKey;
    return `w-full text-left px-2.5 py-1.5 rounded-md flex items-center gap-2.5 truncate transition-all text-xs ${
      isActive 
        ? 'bg-white/[0.08] text-white font-medium shadow-sm' 
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
    }`;
  };

  return (
    <aside 
      className={`flex flex-col bg-[#14151a] border-r border-white/[0.06] select-none transition-all duration-300 relative z-30 font-sans ${
        collapsed ? 'w-[52px]' : 'w-[268px]'
      }`}
      aria-label="Studio Navigation Sidebar"
    >
      {/* 1. TOP PROFILE & WORKSPACE SWITCHER */}
      <div className="h-13 border-b border-white/[0.06] px-3 flex items-center justify-between flex-shrink-0 relative bg-[#14151a]">
        {!collapsed ? (
          <div className="relative flex-1 min-w-0 pr-2">
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 text-zinc-200 hover:text-white text-xs overflow-hidden group focus:outline-none w-full text-left py-1"
              title="Switch Workspace Profile"
            >
              <div className="w-5 h-5 rounded-md bg-[#E53558]/15 border border-[#E53558]/30 text-[#E53558] font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                IX
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-semibold text-xs text-zinc-100">HENRY IX</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">({currentRole})</span>
                </div>
              </div>
              <ChevronDown size={12} className="text-zinc-500 group-hover:text-zinc-300 transition-transform flex-shrink-0" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute top-11 left-0 w-56 bg-[#1b1c22] border border-white/[0.08] rounded-xl shadow-2xl p-1.5 z-50 text-xs space-y-0.5 backdrop-blur-xl">
                <div className="px-2.5 py-1.5 text-[10px] text-zinc-500 font-mono tracking-wider uppercase border-b border-white/[0.06]">
                  WORKSPACE PERMISSIONS
                </div>
                {(['Owner', 'Manager', 'Media', 'Viewer'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                      currentRole === role ? 'bg-white/[0.08] text-white font-medium' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    <span>{role}</span>
                    {currentRole === role && <ShieldCheck size={13} className="text-[#E53558]" />}
                  </button>
                ))}
                <div className="border-t border-white/[0.06] pt-1 mt-1">
                  <button
                    onClick={async () => {
                      setProfileDropdownOpen(false);
                      try {
                        await fetch('/api/studio/auth/session', { method: 'DELETE' });
                      } catch {}
                      window.location.reload();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors text-xs font-medium"
                  >
                    <LogOut size={13} />
                    <span>Sign Out Operator</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setCollapsed(false)}
            className="text-zinc-400 hover:text-white mx-auto flex-shrink-0 focus:outline-none"
            title="Expand Sidebar"
          >
            <div className="w-6 h-6 rounded-md bg-[#E53558]/15 border border-[#E53558]/30 text-[#E53558] font-bold text-[10px] flex items-center justify-center">
              IX
            </div>
          </button>
        )}

        {!collapsed && (
          <button 
            onClick={openSettings}
            className="text-zinc-500 hover:text-zinc-200 p-1.5 transition-colors rounded-lg hover:bg-white/[0.06] focus:outline-none flex-shrink-0"
            title="Studio Settings (Cmd/Ctrl + ,)"
          >
            <Settings size={15} />
          </button>
        )}
      </div>

      {/* 2. UNIVERSAL QUICK SEARCH */}
      <div className="p-2 border-b border-white/[0.06] bg-[#14151a] flex-shrink-0">
        <button 
          onClick={openCommandPalette}
          className="w-full flex items-center gap-2 bg-[#1b1c22]/90 border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 text-xs transition-all rounded-lg group focus:outline-none shadow-sm"
          title="Quick Find (Cmd/Ctrl + K)"
        >
          <Search size={13} className="text-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0" />
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between text-left overflow-hidden">
              <span className="truncate text-xs text-zinc-400">Search workspace...</span>
              <kbd className="text-[10px] font-mono bg-zinc-800/80 px-1.5 py-0.5 rounded border border-white/[0.08] text-zinc-400">⌘K</kbd>
            </div>
          )}
        </button>
      </div>

      {/* 3. EXPANDABLE PROJECT NAVIGATION TREES (01 to 05) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2.5 px-1.5 space-y-2.5">
        
        {/* MODULE 01: STREAMING */}
        <div>
          <button
            onClick={() => toggleTree('01')}
            className={`w-full flex items-center justify-between px-2 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] rounded-md transition-colors text-[11px] font-semibold tracking-wider uppercase font-mono ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#E53558] animate-pulse flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">01. STREAMING</span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={11} 
                className={`text-zinc-500 transition-transform ${expandedTrees['01'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['01'] && (
            <div className="pl-3.5 pr-0.5 mt-1 space-y-0.5">
              <button
                onClick={() => handleSelectView('streaming-live')}
                className={getItemClass('streaming-live')}
              >
                <Radio size={13} className={activeView === 'streaming-live' ? 'text-[#E53558]' : 'text-zinc-400'} />
                <span className="truncate">Live Broadcast Console</span>
              </button>
              <button
                onClick={() => handleSelectView('streaming-analytics')}
                className={getItemClass('streaming-analytics')}
              >
                <Activity size={13} className={activeView === 'streaming-analytics' ? 'text-[#06b6d4]' : 'text-zinc-400'} />
                <span className="truncate">Analytics & Stream Health</span>
              </button>
              <button
                onClick={() => handleSelectView('streaming-clips')}
                className={getItemClass('streaming-clips')}
              >
                <Sparkles size={13} className={activeView === 'streaming-clips' ? 'text-[#8b5cf6]' : 'text-zinc-400'} />
                <span className="truncate">Clip Markers & EDL Log</span>
              </button>
            </div>
          )}
        </div>

        {/* MODULE 02: MUSIC */}
        <div>
          <button
            onClick={() => toggleTree('02')}
            className={`w-full flex items-center justify-between px-2 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] rounded-md transition-colors text-[11px] font-semibold tracking-wider uppercase font-mono ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#10b981] flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">02. MUSIC ENGINE</span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={11} 
                className={`text-zinc-500 transition-transform ${expandedTrees['02'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['02'] && (
            <div className="pl-3.5 pr-0.5 mt-1 space-y-0.5">
              {/* Library sub-tree */}
              <div>
                <button
                  onClick={() => handleSelectView('music-all')}
                  className={getItemClass('music-all')}
                >
                  <Disc size={13} className={activeView === 'music-all' ? 'text-[#10b981]' : 'text-zinc-400'} />
                  <span className="truncate">Master Music Library</span>
                </button>
              </div>

              {/* Crates Sub-Branch */}
              <div className="pt-1">
                <button
                  onClick={(e) => toggleTree('02-crates', e)}
                  className="w-full text-left px-2 py-1 text-zinc-500 hover:text-zinc-300 rounded flex items-center justify-between text-[11px] font-medium"
                >
                  <div className="flex items-center gap-1.5">
                    {expandedTrees['02-crates'] ? <FolderOpen size={12} /> : <Folder size={12} />}
                    <span>Crates & Playlists</span>
                  </div>
                  <ChevronDown size={10} className={`transition-transform ${expandedTrees['02-crates'] ? 'rotate-0' : '-rotate-90'}`} />
                </button>

                {expandedTrees['02-crates'] && (
                  <div className="pl-3 space-y-0.5 mt-0.5">
                    <button
                      onClick={() => handleSelectView('music-crate-kc4')}
                      className={getItemClass('music-crate-kc4')}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E53558] flex-shrink-0" />
                      <span className="truncate">Knight Club Set (KC4)</span>
                    </button>
                    <button
                      onClick={() => handleSelectView('music-crate-rc2')}
                      className={getItemClass('music-crate-rc2')}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] flex-shrink-0" />
                      <span className="truncate">Royal Court Live (RC2)</span>
                    </button>
                    <button
                      onClick={() => handleSelectView('music-crate-cn1')}
                      className={getItemClass('music-crate-cn1')}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] flex-shrink-0" />
                      <span className="truncate">Corner New Cross (CN1)</span>
                    </button>
                    <button
                      onClick={() => handleSelectView('music-smart-crates')}
                      className={getItemClass('music-smart-crates')}
                    >
                      <Sparkles size={12} className="text-[#f59e0b] flex-shrink-0" />
                      <span className="truncate">Smart Filter Crates</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Streaming Integrations Sub-Branch */}
              <div className="pt-1">
                <button
                  onClick={() => handleSelectView('music-spotify')}
                  className={getItemClass('music-spotify')}
                >
                  <span className="text-[#10b981] font-bold text-xs flex-shrink-0">●</span>
                  <span className="truncate">Spotify Playlists</span>
                </button>
                <button
                  onClick={() => handleSelectView('music-soundcloud')}
                  className={getItemClass('music-soundcloud')}
                >
                  <span className="text-[#f59e0b] font-bold text-xs flex-shrink-0">●</span>
                  <span className="truncate">SoundCloud Sync</span>
                </button>
              </div>

              {/* DJ Utilities & Tools */}
              <div className="pt-1 border-t border-white/[0.04]">
                <button
                  onClick={() => handleSelectView('music-set-planning')}
                  className={getItemClass('music-set-planning')}
                >
                  <Sliders size={13} className={activeView === 'music-set-planning' ? 'text-[#3b82f6]' : 'text-zinc-400'} />
                  <span className="truncate">Set Planning Workbench</span>
                </button>
                <button
                  onClick={() => handleSelectView('music-radar')}
                  className={getItemClass('music-radar')}
                >
                  <Compass size={13} className={activeView === 'music-radar' ? 'text-[#8b5cf6]' : 'text-zinc-400'} />
                  <span className="truncate">Harmonic Match Radar</span>
                </button>
                <button
                  onClick={() => handleSelectView('music-organiser')}
                  className={getItemClass('music-organiser')}
                >
                  <Layers size={13} className={activeView === 'music-organiser' ? 'text-[#06b6d4]' : 'text-zinc-400'} />
                  <span className="truncate">Library Organiser</span>
                </button>
                <button
                  onClick={() => handleSelectView('music-hardware')}
                  className={getItemClass('music-hardware')}
                >
                  <FileCode size={13} className={activeView === 'music-hardware' ? 'text-[#f59e0b]' : 'text-zinc-400'} />
                  <span className="truncate">Hardware Utilities</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MODULE 03: ASSETS */}
        <div>
          <button
            onClick={() => toggleTree('03')}
            className={`w-full flex items-center justify-between px-2 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] rounded-md transition-colors text-[11px] font-semibold tracking-wider uppercase font-mono ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#8b5cf6] flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">03. ASSET VAULT</span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={11} 
                className={`text-zinc-500 transition-transform ${expandedTrees['03'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['03'] && (
            <div className="pl-3.5 pr-0.5 mt-1 space-y-0.5">
              <button
                onClick={() => handleSelectView('assets-vault')}
                className={getItemClass('assets-vault')}
              >
                <ImageIcon size={13} className={activeView === 'assets-vault' ? 'text-[#8b5cf6]' : 'text-zinc-400'} />
                <span className="truncate">Media Gallery</span>
              </button>
              <button
                onClick={() => handleSelectView('assets-dropzone')}
                className={getItemClass('assets-dropzone')}
              >
                <Folder size={13} className={activeView === 'assets-dropzone' ? 'text-[#3b82f6]' : 'text-zinc-400'} />
                <span className="truncate">Google Drive Ingest</span>
              </button>
              <button
                onClick={() => handleSelectView('assets-r2')}
                className={getItemClass('assets-r2')}
              >
                <Layers size={13} className={activeView === 'assets-r2' ? 'text-[#06b6d4]' : 'text-zinc-400'} />
                <span className="truncate">Cloudflare R2 Bucket</span>
              </button>
              <button
                onClick={() => handleSelectView('assets-epk')}
                className={getItemClass('assets-epk')}
              >
                <Sparkles size={13} className={activeView === 'assets-epk' ? 'text-[#E53558]' : 'text-zinc-400'} />
                <span className="truncate">1-Click EPK Builder</span>
              </button>
            </div>
          )}
        </div>

        {/* MODULE 04: GIGS & LOGISTICS */}
        <div>
          <button
            onClick={() => toggleTree('04')}
            className={`w-full flex items-center justify-between px-2 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] rounded-md transition-colors text-[11px] font-semibold tracking-wider uppercase font-mono ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b] flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">04. TOUR LOGISTICS</span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={11} 
                className={`text-zinc-500 transition-transform ${expandedTrees['04'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['04'] && (
            <div className="pl-3.5 pr-0.5 mt-1 space-y-0.5">
              <button
                onClick={() => handleSelectView('gigs-hub')}
                className={getItemClass('gigs-hub')}
              >
                <Calendar size={13} className={activeView === 'gigs-hub' ? 'text-[#f59e0b]' : 'text-zinc-400'} />
                <span className="truncate">Tour Dates & Call-Times</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-daysheet')}
                className={getItemClass('gigs-daysheet')}
              >
                <Activity size={13} className={activeView === 'gigs-daysheet' ? 'text-[#3b82f6]' : 'text-zinc-400'} />
                <span className="truncate">Lockscreen Day Sheet</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-checklist')}
                className={getItemClass('gigs-checklist')}
              >
                <CheckSquare size={13} className={activeView === 'gigs-checklist' ? 'text-[#10b981]' : 'text-zinc-400'} />
                <span className="truncate">Smart DJ Bag Checklist</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-finance')}
                className={getItemClass('gigs-finance')}
              >
                <DollarSign size={13} className={activeView === 'gigs-finance' ? 'text-[#E53558]' : 'text-zinc-400'} />
                <span className="truncate">HMRC Invoice & Tax</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-scanner')}
                className={getItemClass('gigs-scanner')}
              >
                <QrCode size={13} className={activeView === 'gigs-scanner' ? 'text-[#8b5cf6]' : 'text-zinc-400'} />
                <span className="truncate">Guestlist & Scanner</span>
              </button>
            </div>
          )}
        </div>

        {/* MODULE 05: SOCIAL */}
        <div>
          <button
            onClick={() => toggleTree('05')}
            className={`w-full flex items-center justify-between px-2 py-1 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] rounded-md transition-colors text-[11px] font-semibold tracking-wider uppercase font-mono ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#06b6d4] flex-shrink-0" />
              {!collapsed && (
                <span className="truncate">05. SOCIAL & MARKETING</span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={11} 
                className={`text-zinc-500 transition-transform ${expandedTrees['05'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['05'] && (
            <div className="pl-3.5 pr-0.5 mt-1 space-y-0.5">
              <button
                onClick={() => handleSelectView('social-scout')}
                className={getItemClass('social-scout')}
              >
                <Share2 size={13} className={activeView === 'social-scout' ? 'text-[#06b6d4]' : 'text-zinc-400'} />
                <span className="truncate">Scene Scout Event Parser</span>
              </button>
              <button
                onClick={() => handleSelectView('social-grid')}
                className={getItemClass('social-grid')}
              >
                <Grid size={13} className={activeView === 'social-grid' ? 'text-[#8b5cf6]' : 'text-zinc-400'} />
                <span className="truncate">Instagram 3x3 Grid</span>
              </button>
              <button
                onClick={() => handleSelectView('social-pipeline')}
                className={getItemClass('social-pipeline')}
              >
                <CheckSquare size={13} className={activeView === 'social-pipeline' ? 'text-[#10b981]' : 'text-zinc-400'} />
                <span className="truncate">Mix Release Pipeline</span>
              </button>
              <button
                onClick={() => handleSelectView('social-vip')}
                className={getItemClass('social-vip')}
              >
                <Send size={13} className={activeView === 'social-vip' ? 'text-[#E53558]' : 'text-zinc-400'} />
                <span className="truncate">VIP SMS Alert Dispatch</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 4. MINIMISED PERSISTENT AUDIO PLAYER SLOT (AT THE VERY BOTTOM) */}
      <div className="h-16 border-t border-white/[0.06] bg-[#16181d] flex items-center px-2.5 flex-shrink-0 relative overflow-hidden">
        {collapsed ? (
          <button 
            onClick={onTogglePlay}
            className="mx-auto w-8 h-8 rounded-full bg-[#D8163F] text-white flex items-center justify-center hover:bg-[#c21337] active:scale-95 transition-all focus:outline-none"
            title={currentTrack.isPlaying ? 'Pause' : 'Play'}
          >
            {currentTrack.isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>
        ) : (
          <div className="w-full flex items-center justify-between gap-2.5 text-xs">
            <button
              onClick={onTogglePlay}
              className="w-7 h-7 rounded-full bg-[#D8163F] hover:bg-[#c21337] active:scale-95 text-white flex items-center justify-center transition-all flex-shrink-0 focus:outline-none"
            >
              {currentTrack.isPlaying ? <Pause size={11} /> : <Play size={11} className="ml-0.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-medium truncate">
                <span className="text-zinc-200 truncate">{currentTrack.title}</span>
              </div>
              <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1.5 font-mono">
                <span>{currentTrack.artist}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-[#3b82f6]">{currentTrack.key}</span>
                <span className="text-zinc-600">•</span>
                <span>{currentTrack.bpm}</span>
              </div>
            </div>

            <button 
              onClick={onExpandPlayer}
              className="text-zinc-500 hover:text-zinc-200 p-1 transition-colors flex-shrink-0 focus:outline-none"
              title="Dock Player Bar Across Bottom"
            >
              <Maximize2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Collapse/Expand Floating Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-[72px] -right-3 bg-[#1b1c22] border border-white/10 text-zinc-400 hover:text-white rounded-full p-1 z-40 hidden md:flex items-center justify-center shadow-md focus:outline-none transition-colors"
        title={collapsed ? "Expand Sidebar (Cmd/Ctrl + B)" : "Collapse Sidebar (Cmd/Ctrl + B)"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
