'use client';

import React, { useState } from 'react';
import { Flame, Send } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface LiveChatMessage {
  id: string;
  user: string;
  platform: 'Twitch' | 'YouTube';
  badge?: string;
  time: string;
  text: string;
}

export default function LiveChatTab() {
  const addToast = useStudioStore((s) => s.addToast);
  const [chatFilter, setChatFilter] = useState<'All' | 'Twitch' | 'YouTube'>('All');
  const [liveChatInput, setLiveChatInput] = useState('');
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>([
    { id: 'c1', user: 'dither_boy', platform: 'Twitch', badge: 'VIP', time: '01:23:40', text: 'that transition at the 32-bar drop was insane 🔥' },
    { id: 'c2', user: 'sub_bass_uk', platform: 'YouTube', badge: 'Mod', time: '01:23:55', text: 'Track ID please?! London sound is unmatched' },
    { id: 'c3', user: 'knight_club_crew', platform: 'Twitch', time: '01:24:05', text: 'HENRY IX in the building 👑' },
    { id: 'c4', user: 'techno_head_99', platform: 'YouTube', time: '01:24:12', text: 'Need this unreleased dubplate in my life right now' },
  ]);

  const handleSendLiveChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!liveChatInput.trim()) return;
    const newMsg: LiveChatMessage = {
      id: `c-${Date.now()}`,
      user: 'HENRY IX (DJ)',
      platform: 'Twitch',
      badge: 'BROADCASTER',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text: liveChatInput.trim(),
    };
    setLiveChatMessages((prev) => [...prev, newMsg]);
    setLiveChatInput('');
    addToast({
      title: 'CHAT BROADCAST',
      message: 'Message delivered to Twitch & YouTube channels.',
      type: 'info',
    });
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-3 text-xs font-sans">
      {/* Flame Meter Header */}
      <div className="p-3 rounded-xl bg-[#1b1c22] border border-white/[0.08] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Flame size={15} className="text-amber-500 animate-pulse" />
          <span className="font-semibold text-white text-[11px] font-mono">VELOCITY: 34 msgs/min</span>
        </div>
        <div className="flex items-center gap-1">
          {(['All', 'Twitch', 'YouTube'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setChatFilter(filter)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                chatFilter === filter ? 'bg-[#E53558] text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 min-h-[160px]">
        {liveChatMessages
          .filter((m) => chatFilter === 'All' || m.platform === chatFilter)
          .map((msg) => (
            <div key={msg.id} className="p-2.5 rounded-lg bg-[#1b1c22] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.2 rounded font-mono font-semibold ${
                    msg.platform === 'Twitch' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {msg.platform}
                  </span>
                  <span className="font-medium text-white">{msg.user}</span>
                  {msg.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono">
                      {msg.badge}
                    </span>
                  )}
                </div>
                <span className="text-zinc-500 font-mono text-[10px]">{msg.time}</span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">{msg.text}</p>
            </div>
          ))}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendLiveChat} className="flex gap-2 pt-2 border-t border-white/[0.08] flex-shrink-0">
        <input
          type="text"
          placeholder="Broadcast chat as HENRY IX..."
          value={liveChatInput}
          onChange={(e) => setLiveChatInput(e.target.value)}
          className="flex-1 rounded-xl bg-[#0c0d10] border border-white/[0.08] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
        />
        <button
          type="submit"
          className="px-3.5 py-2 rounded-xl bg-[#E53558] hover:bg-[#d82a4d] text-white font-medium transition-colors flex items-center gap-1 shadow-sm"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
