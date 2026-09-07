'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  VolumeX, 
  Volume2, 
  X, 
  Check, 
  CheckCheck, 
  Trash2, 
  Clock
} from 'lucide-react';
import { useStudioStore, NotificationCategory, StudioNotification } from '@/store/studioStore';
import { playTactileClick } from '@/lib/studioAudioFeedback';

interface NotificationCenterProps {
  onAction?: (actionId: string, payload?: any) => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function getCategoryBadge(category: NotificationCategory) {
  switch (category) {
    case 'Logistics':
      return {
        label: 'LOGISTICS',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        dotClass: 'bg-emerald-400',
      };
    case 'Sync':
      return {
        label: 'CLOUD SYNC',
        badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        dotClass: 'bg-blue-400',
      };
    case 'Streaming':
      return {
        label: 'BROADCAST',
        badgeClass: 'bg-[#E53558]/10 text-[#E53558] border-[#E53558]/20',
        dotClass: 'bg-[#E53558]',
      };
    case 'Audio':
      return {
        label: 'AUDIO DSP',
        badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        dotClass: 'bg-rose-400',
      };
    case 'System':
    default:
      return {
        label: 'SYSTEM',
        badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        dotClass: 'bg-purple-400',
      };
  }
}

export default function NotificationCenter({ onAction }: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | NotificationCategory>('All');
  const containerRef = useRef<HTMLDivElement>(null);

  // Store bindings
  const notifications = useStudioStore((s) => s.notifications);
  const doNotDisturb = useStudioStore((s) => s.doNotDisturb);
  const setDoNotDisturb = useStudioStore((s) => s.setDoNotDisturb);
  const markNotificationRead = useStudioStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useStudioStore((s) => s.markAllNotificationsRead);
  const dismissNotification = useStudioStore((s) => s.dismissNotification);
  const clearAllNotifications = useStudioStore((s) => s.clearAllNotifications);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Compute unread counts per tab
  const categoryUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: unreadCount,
      Logistics: 0,
      Sync: 0,
      System: 0,
      Streaming: 0,
      Audio: 0,
    };
    notifications.forEach((n) => {
      if (!n.read && counts[n.category] !== undefined) {
        counts[n.category]++;
      }
    });
    return counts;
  }, [notifications, unreadCount]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'All') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleToggleOpen = () => {
    playTactileClick();
    setOpen((prev) => !prev);
  };

  const handleToggleDnd = () => {
    playTactileClick();
    setDoNotDisturb(!doNotDisturb);
  };

  const handleMarkAllRead = () => {
    playTactileClick();
    markAllNotificationsRead();
  };

  const handleClearAll = () => {
    playTactileClick();
    clearAllNotifications();
  };

  const handleNotificationAction = (notif: StudioNotification, actionId: string, payload?: any) => {
    playTactileClick();
    markNotificationRead(notif.id);
    if (actionId === 'dismiss') {
      dismissNotification(notif.id);
    } else {
      onAction?.(actionId, payload);
    }
  };

  const tabs: Array<'All' | NotificationCategory> = ['All', 'Logistics', 'Sync', 'System', 'Streaming', 'Audio'];

  return (
    <div className="relative" ref={containerRef}>
      {/* Top Header Bell Button */}
      <button
        onClick={handleToggleOpen}
        className={`p-2 rounded-lg transition-all relative flex items-center gap-1.5 text-xs ${
          open
            ? 'text-white bg-white/[0.1] border border-white/[0.15]'
            : 'text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent'
        }`}
        title="Studio Notification Center"
        aria-label="Studio Notification Center"
      >
        <div className="relative">
          <Bell size={17} className={unreadCount > 0 ? 'text-zinc-100' : 'text-zinc-400'} />
          {doNotDisturb && (
            <span 
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[#14151a]" 
              title="Performance Mode (Muted)"
            />
          )}
        </div>

        {unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-4 h-4 px-1 bg-[#E53558] text-white text-[10px] font-mono font-bold rounded-full shadow-sm animate-in fade-in zoom-in-75">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Tray */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-[410px] max-w-[calc(100vw-24px)] rounded-2xl bg-[#14151a]/98 backdrop-blur-2xl border border-white/[0.1] shadow-2xl z-[100] overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-white/[0.08] flex justify-between items-center bg-[#14151a]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-white tracking-tight">Notifications</span>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-mono font-bold text-white bg-[#E53558] px-2 py-0.5 rounded-full shadow-sm">
                  {unreadCount} new
                </span>
              ) : (
                <span className="text-[10px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded-full border border-white/[0.04]">
                  All read
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* DND / Performance Mode Toggle */}
              <button
                onClick={handleToggleDnd}
                title={doNotDisturb ? 'Disable Performance Mode (Muted)' : 'Enable Performance Mode (Mute Chimes)'}
                className={`text-[11px] px-2 py-1 rounded-md border flex items-center gap-1 font-medium transition-colors ${
                  doNotDisturb
                    ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                    : 'border-white/[0.08] text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {doNotDisturb ? <VolumeX size={12} /> : <Volume2 size={12} />}
                <span className="text-[10px] font-mono">DND</span>
              </button>

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  title="Mark all notifications as read"
                  className="text-[11px] text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-white/[0.05] transition-colors"
                >
                  <CheckCheck size={14} />
                </button>
              )}

              {/* Clear All */}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  title="Clear all notifications"
                  className="text-[11px] text-zinc-400 hover:text-rose-400 p-1 rounded hover:bg-white/[0.05] transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => {
                  playTactileClick();
                  setOpen(false);
                }}
                className="text-zinc-500 hover:text-white rounded-md p-1 hover:bg-white/[0.05] transition-colors ml-0.5"
                title="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-white/[0.08] bg-[#0c0d10] p-1 gap-1 text-[11px] overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => {
              const unreadForTab = categoryUnreadCounts[tab] || 0;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    playTactileClick();
                    setActiveTab(tab);
                  }}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg font-medium transition-colors whitespace-nowrap text-xs ${
                    isActive
                      ? 'bg-[#242630] text-white shadow-sm font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{tab}</span>
                  {unreadForTab > 0 && (
                    <span
                      className={`text-[9px] font-mono px-1 rounded-full ${
                        isActive ? 'bg-[#E53558] text-white' : 'bg-white/[0.1] text-zinc-300'
                      }`}
                    >
                      {unreadForTab}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-3 space-y-2.5 bg-[#14151a]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-9 h-9 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-2">
                  <Bell size={16} />
                </div>
                <div className="text-zinc-300 text-xs font-medium">All caught up</div>
                <div className="text-zinc-500 text-[11px] font-mono mt-0.5">
                  No alerts in {activeTab === 'All' ? 'the studio' : activeTab}
                </div>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const badge = getCategoryBadge(notif.category);
                const isUnread = !notif.read;

                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-xl border transition-all text-xs space-y-2 relative ${
                      isUnread
                        ? 'border-white/[0.12] bg-[#1a1b22] hover:border-white/[0.2] shadow-sm'
                        : 'border-white/[0.05] bg-[#14151a]/60 hover:border-white/[0.09] opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {/* Status Dot */}
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            isUnread ? 'bg-[#E53558]' : 'bg-zinc-600'
                          }`}
                        />

                        {/* Category Badge */}
                        <span
                          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.badgeClass}`}
                        >
                          {badge.label}
                        </span>

                        {/* Title */}
                        <span
                          className={`font-semibold text-xs tracking-tight truncate ${
                            isUnread ? 'text-zinc-100' : 'text-zinc-400'
                          }`}
                        >
                          {notif.title}
                        </span>
                      </div>

                      {/* Top Action Controls: Read Toggle & Dismiss */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                          <Clock size={10} />
                          {formatRelativeTime(notif.timestamp)}
                        </span>

                        <button
                          onClick={() => {
                            playTactileClick();
                            markNotificationRead(notif.id);
                          }}
                          title={isUnread ? 'Mark as read' : 'Mark as unread'}
                          className={`p-1 rounded transition-colors ${
                            isUnread
                              ? 'text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                              : 'text-zinc-600 hover:text-zinc-400'
                          }`}
                        >
                          <Check size={12} />
                        </button>

                        <button
                          onClick={() => {
                            playTactileClick();
                            dismissNotification(notif.id);
                          }}
                          title="Dismiss"
                          className="p-1 rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Notification Body */}
                    <p className={`text-[11px] leading-relaxed ${isUnread ? 'text-zinc-300' : 'text-zinc-400'}`}>
                      {notif.body}
                    </p>

                    {/* Optional Tagged Items / Sub-pills */}
                    {notif.items && notif.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {notif.items.map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {notif.actions && notif.actions.length > 0 && (
                      <div className="flex gap-2 pt-1 flex-wrap">
                        {notif.actions.map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleNotificationAction(notif, act.action, act.payload)}
                            className={`text-[11px] px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              act.primary
                                ? 'bg-[#E53558] hover:bg-[#d82a4d] text-white shadow-sm font-semibold'
                                : 'bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-zinc-300 hover:text-white'
                            }`}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* DND Indicator Footer */}
          {doNotDisturb && (
            <div className="p-2.5 border-t border-amber-500/20 bg-amber-500/10 text-amber-400 text-[11px] font-medium flex items-center justify-center gap-2">
              <VolumeX size={13} />
              <span>Performance Mode Active (Notification Chimes Muted)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
