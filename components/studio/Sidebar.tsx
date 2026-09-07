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
  ShieldCheck
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

  return (
    <aside 
      className={`flex flex-col bg-black border-r border-zinc-900 select-none transition-all duration-300 relative z-30 ${
        collapsed ? 'w-[48px]' : 'w-[260px]'
      }`}
      aria-label="Studio Navigation Sidebar"
    >
      {/* 1. TOP PROFILE & WORKSPACE SWITCHER */}
      <div className="h-12 border-b border-zinc-900 px-3 flex items-center justify-between flex-shrink-0 relative bg-zinc-950">
        {!collapsed ? (
          <div className="relative">
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 text-zinc-200 hover:text-white font-mono text-xs overflow-hidden group focus:outline-none"
              title="Switch Workspace Profile"
            >
              <span className="w-2 h-2 rounded-full bg-[#D8163F] shadow-[0_0_8px_rgba(216,22,63,0.8)] flex-shrink-0" />
              <span className="truncate font-bold tracking-wider">HENRY IX ({currentRole})</span>
              <ChevronDown size={12} className="text-zinc-500 group-hover:text-zinc-300 transition-transform" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute top-10 left-0 w-52 bg-zinc-950 border border-zinc-800 shadow-2xl p-2 z-50 font-mono text-xs space-y-1">
                <div className="px-2 py-1 text-[10px] text-zinc-500 tracking-widest uppercase border-b border-zinc-900">
                  Switch Workspace Role
                </div>
                {(['Owner', 'Manager', 'Media', 'Viewer'] as const).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setCurrentRole(role);
                      setProfileDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded flex items-center justify-between transition-colors ${
                      currentRole === role ? 'bg-[#D8163F]/20 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <span>{role}</span>
                    {currentRole === role && <ShieldCheck size={12} className="text-[#D8163F]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setCollapsed(false)}
            className="text-zinc-400 hover:text-white mx-auto flex-shrink-0 focus:outline-none"
            title="Expand Sidebar"
          >
            <User size={16} className="text-[#D8163F]" />
          </button>
        )}

        {!collapsed && (
          <button 
            onClick={openSettings}
            className="text-zinc-500 hover:text-[#D8163F] p-1 transition-colors rounded hover:bg-zinc-900 focus:outline-none"
            title="Open Studio Settings (Cmd/Ctrl + ,)"
          >
            <Settings size={15} />
          </button>
        )}
      </div>

      {/* 2. UNIVERSAL QUICK SEARCH */}
      <div className="p-2 border-b border-zinc-900 bg-black flex-shrink-0">
        <button 
          onClick={openCommandPalette}
          className="w-full flex items-center gap-2 bg-zinc-950 border border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 p-2 text-xs font-mono transition-all rounded-sm group focus:outline-none"
          title="Universal Quick Find (Cmd/Ctrl + K)"
        >
          <Search size={14} className="text-zinc-500 group-hover:text-[#D8163F] transition-colors flex-shrink-0" />
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between text-left overflow-hidden">
              <span className="truncate text-[11px]">Quick Find...</span>
              <kbd className="text-[9px] bg-zinc-900 px-1 py-0.5 border border-zinc-800 text-zinc-500">⌘K</kbd>
            </div>
          )}
        </button>
      </div>

      {/* 3. EXPANDABLE PROJECT NAVIGATION TREES (01 to 05) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-2 px-1 space-y-3">
        
        {/* MODULE 01: STREAMING */}
        <div>
          <button
            onClick={() => toggleTree('01')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded transition-colors font-mono text-xs ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
              {!collapsed && (
                <span className="font-bold tracking-wider text-zinc-300">
                  [01 / STREAMING]
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={12} 
                className={`text-zinc-600 transition-transform ${expandedTrees['01'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['01'] && (
            <div className="pl-4 pr-1 mt-1 space-y-0.5 font-mono text-[11px]">
              <button
                onClick={() => handleSelectView('streaming-live')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'streaming-live' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Radio size={12} className="flex-shrink-0" />
                <span className="truncate">🔴 Live Broadcast Deck</span>
              </button>
              <button
                onClick={() => handleSelectView('streaming-analytics')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'streaming-analytics' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Activity size={12} className="flex-shrink-0" />
                <span className="truncate">📊 History & Analytics</span>
              </button>
              <button
                onClick={() => handleSelectView('streaming-clips')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'streaming-clips' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Sliders size={12} className="flex-shrink-0" />
                <span className="truncate">🎬 Livestream Clips</span>
              </button>
            </div>
          )}
        </div>

        {/* MODULE 02: MUSIC */}
        <div>
          <button
            onClick={() => toggleTree('02')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded transition-colors font-mono text-xs ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Disc size={14} className="text-cyan-400 flex-shrink-0" />
              {!collapsed && (
                <span className="font-bold tracking-wider text-zinc-300">
                  [02 / MUSIC]
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={12} 
                className={`text-zinc-600 transition-transform ${expandedTrees['02'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['02'] && (
            <div className="pl-3 pr-1 mt-1 space-y-1 font-mono text-[11px]">
              {/* Library Root */}
              <div>
                <button
                  onClick={() => toggleTree('02-library')}
                  className="w-full text-left px-2 py-1 text-zinc-300 hover:text-white flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    {expandedTrees['02-library'] ? <FolderOpen size={12} className="text-yellow-500" /> : <Folder size={12} className="text-yellow-500" />}
                    <span>Library</span>
                  </span>
                  <ChevronDown size={10} className={`text-zinc-600 ${expandedTrees['02-library'] ? '' : '-rotate-90'}`} />
                </button>

                {expandedTrees['02-library'] && (
                  <div className="pl-4 space-y-0.5">
                    <button
                      onClick={() => handleSelectView('music-all')}
                      className={`w-full text-left px-2 py-0.5 rounded truncate transition-colors ${
                        activeView === 'music-all' ? 'text-[#D8163F] font-bold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      📁 All Collection
                    </button>
                    
                    {/* My Crates Subtree */}
                    <div>
                      <button
                        onClick={() => toggleTree('02-crates')}
                        className="w-full text-left px-2 py-0.5 text-zinc-400 hover:text-white flex items-center justify-between"
                      >
                        <span>▼ 📁 My Crates</span>
                      </button>
                      {expandedTrees['02-crates'] && (
                        <div className="pl-3 space-y-0.5 text-[10px]">
                          <button
                            onClick={() => handleSelectView('music-crate-kc4')}
                            className={`w-full text-left px-2 py-0.5 rounded truncate ${
                              activeView === 'music-crate-kc4' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            🎵 Knight Club Vol 4 [18]
                          </button>
                          <button
                            onClick={() => handleSelectView('music-crate-rc2')}
                            className={`w-full text-left px-2 py-0.5 rounded truncate ${
                              activeView === 'music-crate-rc2' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            🎵 Royal Court 2 [24]
                          </button>
                          <button
                            onClick={() => handleSelectView('music-crate-cn1')}
                            className={`w-full text-left px-2 py-0.5 rounded truncate ${
                              activeView === 'music-crate-cn1' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            🎵 Corner N1 [31]
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSelectView('music-smart-crates')}
                      className={`w-full text-left px-2 py-0.5 rounded truncate transition-colors ${
                        activeView === 'music-smart-crates' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      ► 📁 Smart Crates (140 BPM)
                    </button>
                    <button
                      onClick={() => handleSelectView('music-spotify')}
                      className={`w-full text-left px-2 py-0.5 rounded truncate transition-colors ${
                        activeView === 'music-spotify' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      ► 📁 Synced Spotify
                    </button>
                    <button
                      onClick={() => handleSelectView('music-soundcloud')}
                      className={`w-full text-left px-2 py-0.5 rounded truncate transition-colors ${
                        activeView === 'music-soundcloud' ? 'text-white font-bold bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      ► 📁 Synced SoundCloud
                    </button>
                  </div>
                )}
              </div>

              {/* Other Music Tools */}
              <button
                onClick={() => handleSelectView('music-set-planning')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'music-set-planning' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Sparkles size={12} className="text-yellow-400 flex-shrink-0" />
                <span className="truncate">⚡ Set Planning Split</span>
              </button>
              <button
                onClick={() => handleSelectView('music-organiser')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'music-organiser' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Sliders size={12} className="flex-shrink-0" />
                <span className="truncate">🧹 Library Organiser (6 Bays)</span>
              </button>
              <button
                onClick={() => handleSelectView('music-radar')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'music-radar' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Compass size={12} className="flex-shrink-0" />
                <span className="truncate">🧭 Music Radar</span>
              </button>
              <button
                onClick={() => handleSelectView('music-hardware')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'music-hardware' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <ListMusic size={12} className="flex-shrink-0" />
                <span className="truncate">💾 USB Redundancy Sync</span>
              </button>
            </div>
          )}
        </div>

        {/* MODULE 03: ASSETS */}
        <div>
          <button
            onClick={() => toggleTree('03')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded transition-colors font-mono text-xs ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <ImageIcon size={14} className="text-purple-400 flex-shrink-0" />
              {!collapsed && (
                <span className="font-bold tracking-wider text-zinc-300">
                  [03 / ASSETS]
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={12} 
                className={`text-zinc-600 transition-transform ${expandedTrees['03'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['03'] && (
            <div className="pl-4 pr-1 mt-1 space-y-0.5 font-mono text-[11px]">
              <button
                onClick={() => handleSelectView('assets-vault')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'assets-vault' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Grid size={12} className="flex-shrink-0" />
                <span className="truncate">🖼️ Asset Vault</span>
              </button>
              <button
                onClick={() => handleSelectView('assets-dropzone')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'assets-dropzone' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <FolderOpen size={12} className="flex-shrink-0" />
                <span className="truncate">📥 Intake Dropzone</span>
              </button>
              <button
                onClick={() => handleSelectView('assets-r2')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'assets-r2' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Activity size={12} className="flex-shrink-0" />
                <span className="truncate">⚡ R2 Storage Mirror</span>
              </button>
              <button
                onClick={() => handleSelectView('assets-epk')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'assets-epk' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Share2 size={12} className="flex-shrink-0" />
                <span className="truncate">📄 Press Kit / EPK Hub</span>
              </button>
            </div>
          )}
        </div>

        {/* MODULE 04: GIGS */}
        <div>
          <button
            onClick={() => toggleTree('04')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded transition-colors font-mono text-xs ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Calendar size={14} className="text-emerald-400 flex-shrink-0" />
              {!collapsed && (
                <span className="font-bold tracking-wider text-zinc-300">
                  [04 / GIGS]
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={12} 
                className={`text-zinc-600 transition-transform ${expandedTrees['04'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['04'] && (
            <div className="pl-4 pr-1 mt-1 space-y-0.5 font-mono text-[11px]">
              <button
                onClick={() => handleSelectView('gigs-hub')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'gigs-hub' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Calendar size={12} className="flex-shrink-0" />
                <span className="truncate">📅 Gig Hub (Schedule)</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-daysheet')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'gigs-daysheet' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Sliders size={12} className="flex-shrink-0" />
                <span className="truncate">📄 1-Page Day Sheet</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-checklist')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'gigs-checklist' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <CheckSquare size={12} className="flex-shrink-0" />
                <span className="truncate">🎒 Smart DJ Bag Checklist</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-finance')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'gigs-finance' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <DollarSign size={12} className="flex-shrink-0" />
                <span className="truncate">💰 Finance & HMRC Tax</span>
              </button>
              <button
                onClick={() => handleSelectView('gigs-scanner')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'gigs-scanner' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <QrCode size={12} className="flex-shrink-0" />
                <span className="truncate">📱 Door QR Scanner</span>
              </button>
            </div>
          )}
        </div>

        {/* MODULE 05: SOCIAL */}
        <div>
          <button
            onClick={() => toggleTree('05')}
            className={`w-full flex items-center justify-between px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900/60 rounded transition-colors font-mono text-xs ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Share2 size={14} className="text-amber-400 flex-shrink-0" />
              {!collapsed && (
                <span className="font-bold tracking-wider text-zinc-300">
                  [05 / SOCIAL]
                </span>
              )}
            </div>
            {!collapsed && (
              <ChevronDown 
                size={12} 
                className={`text-zinc-600 transition-transform ${expandedTrees['05'] ? 'rotate-0' : '-rotate-90'}`} 
              />
            )}
          </button>

          {!collapsed && expandedTrees['05'] && (
            <div className="pl-4 pr-1 mt-1 space-y-0.5 font-mono text-[11px]">
              <button
                onClick={() => handleSelectView('social-scout')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'social-scout' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Compass size={12} className="flex-shrink-0" />
                <span className="truncate">⚡ Scene Scout & Parser</span>
              </button>
              <button
                onClick={() => handleSelectView('social-grid')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'social-grid' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Grid size={12} className="flex-shrink-0" />
                <span className="truncate">🗓️ 3x3 Instagram Grid</span>
              </button>
              <button
                onClick={() => handleSelectView('social-pipeline')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'social-pipeline' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <CheckSquare size={12} className="flex-shrink-0" />
                <span className="truncate">🚀 Mix Release Pipeline</span>
              </button>
              <button
                onClick={() => handleSelectView('social-vip')}
                className={`w-full text-left px-2 py-1 rounded flex items-center gap-2 truncate transition-colors ${
                  activeView === 'social-vip' 
                    ? 'bg-[#D8163F]/20 text-[#D8163F] font-bold border-l-2 border-[#D8163F]' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Send size={12} className="flex-shrink-0" />
                <span className="truncate">✉️ VIP SMS Alert Dispatch</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* 4. MINIMISED PERSISTENT AUDIO PLAYER SLOT (AT THE VERY BOTTOM) */}
      <div className="h-16 border-t border-zinc-900 bg-zinc-950 flex items-center px-2 flex-shrink-0 relative overflow-hidden">
        {collapsed ? (
          <button 
            onClick={onTogglePlay}
            className="mx-auto w-8 h-8 rounded-full border border-[#D8163F] bg-black text-[#D8163F] flex items-center justify-center hover:bg-[#D8163F] hover:text-white shadow-[0_0_10px_rgba(216,22,63,0.5)] transition-all focus:outline-none"
            title={currentTrack.isPlaying ? 'Pause' : 'Play'}
          >
            {currentTrack.isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>
        ) : (
          <div className="w-full flex items-center justify-between gap-2 font-mono text-xs">
            <button
              onClick={onTogglePlay}
              className="w-7 h-7 rounded-full border border-[#D8163F] bg-black text-[#D8163F] flex items-center justify-center hover:bg-[#D8163F] hover:text-white shadow-[0_0_8px_rgba(216,22,63,0.4)] transition-all flex-shrink-0 focus:outline-none"
            >
              {currentTrack.isPlaying ? <Pause size={11} /> : <Play size={11} className="ml-0.5" />}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] font-bold truncate">
                <span className="text-zinc-200 truncate">{currentTrack.title}</span>
                <span className="text-zinc-500 text-[9px] flex-shrink-0 ml-1">{currentTrack.key} • {currentTrack.bpm}</span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate">{currentTrack.artist}</div>
            </div>

            <button 
              onClick={onExpandPlayer}
              className="text-zinc-500 hover:text-[#D8163F] p-1 transition-colors flex-shrink-0 focus:outline-none"
              title="Dock Player Bar Across Bottom"
            >
              <Maximize2 size={12} />
            </button>
          </div>
        )}
      </div>

      {/* Collapse/Expand Floating Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute bottom-[72px] -right-3 bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white rounded-full p-1 z-40 hidden md:flex items-center justify-center shadow-lg focus:outline-none"
        title={collapsed ? "Expand Sidebar (Cmd/Ctrl + B)" : "Collapse Sidebar (Cmd/Ctrl + B)"}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
