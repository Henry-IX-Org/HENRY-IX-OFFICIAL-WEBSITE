'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Disc, Calendar, Image as ImageIcon, Terminal, Zap, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionId: string, payload?: any) => void;
}

interface CommandItem {
  id: string;
  category: 'Command' | 'Track' | 'Gig' | 'Asset' | 'Copilot';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  badge?: string;
  action: () => void;
}

export default function CommandPalette({ isOpen, onClose, onSelectAction }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trackCollection = useStudioStore((s) => s.trackCollection);
  const gigs = useStudioStore((s) => s.gigs);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allItems: CommandItem[] = useMemo(() => {
    const fallbackTracks = [
      { id: 't-1', title: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]', artist: 'MAJA', bpm: 150, key: '7A', genre: 'UK Bass / Rework', source: 'Dropbox / Cloud Sync' },
      { id: 't-2', title: 'rude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend)', artist: 'dj g2g', bpm: 150, key: '2A', genre: 'Club / Baile', source: 'Dropbox / Cloud Sync' },
      { id: 't-3', title: 'Do It Diva (Don Omar x Heidi Montag) [free DL]', artist: 'zpectrum', bpm: 145, key: '3A', genre: 'Hardgroove', source: 'Dropbox / Cloud Sync' },
    ];

    const sourceTracks = trackCollection.length > 0 ? trackCollection.slice(0, 3) : fallbackTracks;
    const dynamicTracks: CommandItem[] = sourceTracks.map((t, idx) => ({
      id: `track-${t.id || idx}`,
      category: 'Track',
      title: `${t.artist} - ${t.title}`,
      subtitle: `${t.key || '7A'} • ${t.bpm} BPM • ${t.genre || 'Master Track'}`,
      icon: Disc,
      badge: t.source || 'Library',
      action: () => onSelectAction('play-track', { title: `${t.artist} - ${t.title}`, bpm: t.bpm, key: t.key }),
    }));

    const dynamicGigs: CommandItem[] = gigs.length > 0
      ? gigs.slice(0, 3).map((g) => ({
          id: `gig-${g.id}`,
          category: 'Gig',
          title: `${g.title} @ ${g.venue}`,
          subtitle: `${g.date} • Set: ${g.setTime} • Call: ${g.callTime} • Fee: £${g.fee}`,
          icon: Calendar,
          badge: g.status || 'Notion',
          action: () => onSelectAction('view-gig', g.id),
        }))
      : [
          {
            id: 'gig-add',
            category: 'Gig',
            title: 'Schedule New Booking',
            subtitle: 'Sync confirmed DJ dates directly to Notion Bookings DB',
            icon: Calendar,
            badge: 'Notion Sync',
            action: () => onSelectAction('open-gigs'),
          },
        ];

    return [
      // Slash Commands
      {
        id: 'cmd-panic',
        category: 'Command',
        title: '/panic',
        subtitle: 'Trigger instant 1.5s emergency blackout and lock session',
        icon: ShieldAlert,
        badge: 'ESC (1.5s)',
        action: () => onSelectAction('panic'),
      },
      {
        id: 'cmd-revalidate',
        category: 'Command',
        title: '/revalidate',
        subtitle: 'Purge edge cache & trigger on-demand revalidation on henryix.com',
        icon: Zap,
        badge: '<2s Global',
        action: () => onSelectAction('revalidate'),
      },
      {
        id: 'cmd-standby',
        category: 'Command',
        title: '/standby',
        subtitle: 'Trigger OBS 5-minute intermission scene & mute booth microphones',
        icon: Terminal,
        badge: 'Shift+I / Pad 7',
        action: () => onSelectAction('standby'),
      },
      {
        id: 'cmd-export-xml',
        category: 'Command',
        title: '/export',
        subtitle: 'Export active setlist to Rekordbox XML with cues & key tags',
        icon: Disc,
        badge: 'Rekordbox 7',
        action: () => onSelectAction('export-xml'),
      },
      {
        id: 'cmd-copilot',
        category: 'Command',
        title: '/copilot',
        subtitle: 'Prompt AI Copilot for digging recommendations & set storytelling',
        icon: Sparkles,
        badge: 'AI Mentor',
        action: () => onSelectAction('open-copilot'),
      },
      {
        id: 'cmd-door-scanner',
        category: 'Command',
        title: '/scanner',
        subtitle: 'Launch Sensory Door QR Scanner (100% offline basement mode)',
        icon: Zap,
        badge: 'Haptic Audio',
        action: () => onSelectAction('open-scanner'),
      },
      // Quick Tracks
      ...dynamicTracks,
      // Quick Gigs
      ...dynamicGigs,
      // Assets
      {
        id: 'asset-epk',
        category: 'Asset',
        title: 'Henry_IX_Press_Kit_2026.zip',
        subtitle: '1-Click unlisted EPK bundle on R2 edge storage',
        icon: ImageIcon,
        badge: 'R2 Edge',
        action: () => onSelectAction('download-epk'),
      },
    ];
  }, [trackCollection, gigs, onSelectAction]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#14151a] border border-white/[0.1] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col font-sans text-sm overflow-hidden relative"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/[0.08] bg-[#14151a] flex items-center gap-3">
          <Search size={18} className="text-[#E53558] flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-white placeholder-zinc-500 font-sans text-sm focus:outline-none"
            placeholder="Search tracks, crates, gigs, or type / for commands... (⌘K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button 
            onClick={onClose} 
            className="text-zinc-500 hover:text-white rounded-lg p-1 hover:bg-white/[0.05] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2 space-y-1 bg-[#14151a]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              No matches found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3.5 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#242630] text-white shadow-sm'
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={16} className={isSelected ? 'text-[#E53558]' : 'text-zinc-500'} />
                    <div className="truncate">
                      <div className="font-medium text-xs flex items-center gap-2">
                        <span className="text-zinc-100">{item.title}</span>
                        <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 bg-black/40 border border-white/[0.06] rounded uppercase">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono uppercase whitespace-nowrap ml-2 px-2 py-0.5 rounded-md border ${
                      isSelected ? 'border-[#E53558]/30 bg-[#E53558]/10 text-[#E53558]' : 'border-white/[0.06] bg-black/40 text-zinc-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-white/[0.08] bg-[#0c0d10] flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px]">↵</kbd>
              <span>Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[10px]">Esc</kbd>
              <span>Close</span>
            </span>
          </div>
          <span className="text-[#E53558] font-medium">HENRY IX COMMAND</span>
        </div>
      </div>
    </div>
  );
}
