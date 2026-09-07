'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, VolumeX, Volume2, X, AlertTriangle, RefreshCw, Radio } from 'lucide-react';
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
      title: 'Upcoming Tour Logistics',
      body: logisticsBody,
      items: uncheckedItems.slice(0, 2),
      actions: [
        { label: 'View Checklist', action: 'view-bag', primary: true },
        { label: 'Dismiss', action: 'dismiss', primary: false },
      ],
    },
    {
      id: 'notif-sync-1',
      category: 'Sync',
      title: 'Sync Conflict Resolved',
      body: 'GIG: Corner New Cross (Night 1) — Property: Booking Fee. Studio had £350 vs. iPhone Notion had £400 (Auto-resolved to iPhone).',
      actions: [
        { label: 'Revert to £350', action: 'revert-fee', primary: false },
        { label: 'Keep £400 (iPhone)', action: 'keep-iphone', primary: true },
      ],
    },
    {
      id: 'notif-system-1',
      category: 'System',
      title: 'Cloud Intake Synced',
      body: 'Google Drive Intake: 3 new 4K clips synced to Asset Vault & Cloudflare R2 mirror.',
      actions: [
        { label: 'Triage in Assets', action: 'triage-assets', primary: true },
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
        className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors relative flex items-center gap-1.5 text-xs"
        title="Studio Notification Center"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-4 h-4 px-1 bg-[#E53558] text-white text-[10px] font-bold rounded-full shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-96 rounded-2xl bg-[#14151a]/98 backdrop-blur-2xl border border-white/[0.1] shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-3.5 border-b border-white/[0.08] flex justify-between items-center bg-[#14151a]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-full border border-white/[0.06]">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDoNotDisturb(!doNotDisturb)}
                title="Performance Mode (Do Not Disturb)"
                className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 font-medium transition-colors ${
                  doNotDisturb 
                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' 
                    : 'border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {doNotDisturb ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span>DND</span>
              </button>
              <button 
                onClick={handleMarkAllRead} 
                className="text-[11px] text-zinc-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
              <button 
                onClick={() => setOpen(false)} 
                className="text-zinc-500 hover:text-white rounded-md p-1 hover:bg-white/[0.05] transition-colors ml-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex border-b border-white/[0.08] bg-[#0c0d10] p-1 gap-1 text-[11px]">
            {(['All', 'Logistics', 'Sync', 'System'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-[#242630] text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-3 space-y-2.5 bg-[#14151a]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs font-mono">
                All caught up. No pending alerts ({activeTab})
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div 
                  key={notif.id}
                  className="p-3.5 rounded-xl border border-white/[0.08] bg-[#1b1c22] hover:border-white/[0.12] transition-colors text-xs space-y-2 relative"
                >
                  <div className="text-xs font-medium text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E53558]" />
                      <span>{notif.title}</span>
                    </div>
                    <button 
                      onClick={() => handleDismiss(notif.id)}
                      className="text-zinc-500 hover:text-zinc-300 rounded p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    {notif.body}
                  </p>

                  {notif.items && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {notif.items.map((item, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
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
                        className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-colors ${
                          act.primary
                            ? 'bg-[#E53558] hover:bg-[#d82a4d] text-white shadow-sm'
                            : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300'
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
            <div className="p-2.5 border-t border-amber-500/20 bg-amber-500/10 text-amber-400 text-[11px] font-medium flex items-center justify-center gap-2">
              <VolumeX size={13} />
              <span>Performance Mode Active (Notifications Muted)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
