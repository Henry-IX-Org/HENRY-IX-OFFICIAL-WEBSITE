'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, VolumeX, Volume2, X } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface NotificationCenterProps {
  onAction?: (actionId: string, payload?: any) => void;
}

export default function NotificationCenter({ onAction }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Logistics' | 'Sync' | 'System'>('All');
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const gigs = useStudioStore((s) => s.gigs);
  const bagItems = useStudioStore((s) => s.bagItems);

  const uncheckedItems = bagItems.filter((b) => !b.checked).map((b) => b.name);
  const nextGig = gigs[0];

  const logisticsBody = nextGig
    ? `${nextGig.venue} call-time at ${nextGig.callTime}. ${uncheckedItems.length} items unchecked in Smart DJ Bag:`
    : uncheckedItems.length > 0
    ? `${uncheckedItems.length} items unchecked in Smart DJ Bag:`
    : 'All performance gear and redundancy USBs verified packed.';

  const notifications = [
    {
      id: 'notif-logistics-1',
      category: 'Logistics',
      title: '⚡ LOGISTICS // Upcoming Tour State',
      body: logisticsBody,
      items: uncheckedItems.slice(0, 2),
      actions: [
        { label: '🎒 View Checklist', action: 'view-bag', primary: true },
        { label: 'Dismiss', action: 'dismiss', primary: false },
      ],
    },
    {
      id: 'notif-sync-1',
      category: 'Sync',
      title: '🔄 SYNC CONFLICT // 32 Mins Ago',
      body: 'GIG: Corner New Cross (Night 1) — Property: Booking Fee. Studio had £350 vs. iPhone Notion had £400 (Auto-resolved to iPhone).',
      actions: [
        { label: '↩ Revert to £350 (Studio)', action: 'revert-fee', primary: false },
        { label: '✓ Keep £400 (iPhone)', action: 'keep-iphone', primary: true },
      ],
    },
    {
      id: 'notif-system-1',
      category: 'System',
      title: '📡 SYSTEM // 1 Hour Ago',
      body: 'Google Drive Intake: 3 new 4K clips synced to Asset Vault & R2 mirror.',
      actions: [
        { label: '🖼️ Triage in Assets', action: 'triage-assets', primary: true },
        { label: 'Dismiss', action: 'dismiss', primary: false },
      ],
    },
  ];

  const visibleNotifications = notifications.filter(n => !dismissed[n.id]);
  const unreadCount = visibleNotifications.length;

  const filteredNotifications = visibleNotifications.filter(n => {
    if (activeTab === 'All') return true;
    return n.category === activeTab;
  });

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const handleDismiss = (id: string) => {
    setDismissed(prev => ({ ...prev, [id]: true }));
  };

  const handleMarkAllRead = () => {
    const allDismissed: Record<string, boolean> = {};
    notifications.forEach(n => { allDismissed[n.id] = true; });
    setDismissed(allDismissed);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 text-zinc-400 hover:text-[#D8163F] hover:bg-zinc-900 rounded transition-colors relative flex items-center gap-1.5 font-mono text-xs"
        title="Studio Notification Center"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-4 h-4 px-1 bg-[#D8163F] text-white text-[10px] font-bold rounded-full shadow-[0_0_8px_rgba(216,22,63,0.8)]">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-zinc-950 border-2 border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.9)] z-50 rounded-none overflow-hidden font-mono" style={{ borderColor: '#D8163F' }}>
          
          {/* Header */}
          <div className="p-3 border-b border-zinc-800 flex justify-between items-center bg-black">
            <div className="flex items-center gap-2">
              <h3 className="text-white text-xs font-bold tracking-wider font-avathe">🔔 STUDIO NOTIFICATION CENTER</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDoNotDisturb(!doNotDisturb)}
                title="Performance Mode (Do Not Disturb)"
                className={`text-[10px] px-2 py-0.5 border flex items-center gap-1 ${
                  doNotDisturb ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {doNotDisturb ? <VolumeX size={10} /> : <Volume2 size={10} />}
                DND
              </button>
              <button 
                onClick={handleMarkAllRead} 
                className="text-[10px] text-zinc-500 hover:text-[#D8163F] transition-colors"
              >
                Clear All
              </button>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white ml-1">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex border-b border-zinc-800 bg-black text-[10px]">
            {(['All', 'Logistics', 'Sync', 'System'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-center uppercase tracking-wider transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-[#D8163F] text-[#D8163F] bg-zinc-900 font-bold'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-3 space-y-3 bg-zinc-950">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-zinc-600 text-xs">
                ALL CAUGHT UP. NO PENDING ALERTS ({activeTab.toUpperCase()})
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-3 border border-zinc-800 bg-black/80 hover:border-zinc-700 transition-colors text-xs space-y-2 relative"
                >
                  <div className="text-[11px] font-bold text-[#D8163F] flex justify-between items-center">
                    <span>{notif.title}</span>
                    <button 
                      onClick={() => handleDismiss(notif.id)}
                      className="text-zinc-600 hover:text-zinc-400"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <p className="text-zinc-300 text-[11px] leading-relaxed font-tertiary">
                    {notif.body}
                  </p>

                  {notif.items && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {notif.items.map((item, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/50 text-yellow-400">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {notif.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (act.action === 'dismiss') {
                            handleDismiss(notif.id);
                          } else {
                            onAction?.(act.action);
                            handleDismiss(notif.id);
                          }
                        }}
                        className={`text-[10px] px-3 py-1 font-mono uppercase font-bold transition-all border ${
                          act.primary
                            ? 'border-[#D8163F] bg-[#D8163F]/20 text-[#D8163F] hover:bg-[#D8163F] hover:text-black shadow-[0_0_8px_rgba(216,22,63,0.3)]'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white'
                        }`}
                      >
                        {act.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DND Indicator footer */}
          {doNotDisturb && (
            <div className="p-2 border-t border-zinc-900 bg-yellow-500/10 text-yellow-400 text-[10px] flex items-center justify-center gap-2">
              <VolumeX size={12} />
              PERFORMANCE MODE ACTIVE (NOTIFICATIONS MUTED)
            </div>
          )}
        </div>
      )}
    </div>
  );
}
