'use client';

import React, { useState } from 'react';
import { CornerDownLeft, CheckCircle2, Bot } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface ActionCard {
  id: string;
  title: string;
  targetId?: string;
  before: string;
  after: string;
  type: 'metadata' | 'logistics' | 'promo' | 'stream' | 'email';
  applied: boolean;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  actionCard?: ActionCard;
}

export default function CopilotTab() {
  const currentTrack = useStudioStore((s) => s.currentTrack);
  const cleanTrackTitle = useStudioStore((s) => s.cleanTrackTitle);
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const addToast = useStudioStore((s) => s.addToast);

  const activeGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || {
    venue: 'London Venue',
    departureTime: '22:30',
    callTime: '23:30',
    setTime: '01:00 - 03:00',
  };

  const [copilotInput, setCopilotInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Good evening Henry. Studio AI Copilot online. 4 hard guardrails active: zero autonomous public mutations. Ready to assist with harmonic mixing, bootleg sanitation, call-times, or stream director cues.',
      actionCard: {
        id: 'action-1',
        title: 'CLEAN BOOTLEG METADATA',
        targetId: currentTrack?.id || 't-1',
        before: `${currentTrack?.artist || 'MAJA'} - ${currentTrack?.title || 'KEPT'} (Official Audio) [RIP] - 320kbps`,
        after: `Title: ${currentTrack?.title || 'KEPT'} • Artist: ${currentTrack?.artist || 'MAJA'} • Key: ${currentTrack?.key || '7A'}`,
        type: 'metadata',
        applied: false,
      },
    },
  ]);

  const handleSendCopilot = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setCopilotInput('');

    setTimeout(() => {
      const lower = userText.toLowerCase();
      if (lower.includes('clean') || lower.includes('bootleg') || lower.includes('tag')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'I parsed the track against canonical records. Ready to strip rip tags and bitrates.',
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'CLEAN AUDIO METADATA',
              targetId: currentTrack.id,
              before: userText,
              after: `Title: ${currentTrack.title} • Artist: ${currentTrack.artist} • Key: ${currentTrack.key} • BPM: ${currentTrack.bpm}`,
              type: 'metadata',
              applied: false,
            },
          },
        ]);
      } else if (lower.includes('gig') || lower.includes('booking') || lower.includes('call-time') || lower.includes('travel') || lower.includes('transit')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `${activeGig.venue} transit route locked. 30-min buffer accounts for London Overground evening maintenance.`,
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'VERIFY GIG CALL-TIME',
              before: `Departure: 23:15 (Tight margin)`,
              after: `Departure: ${activeGig.departureTime} • Call-Time: ${activeGig.callTime} • Set: ${activeGig.setTime}`,
              type: 'logistics',
              applied: false,
            },
          },
        ]);
      } else if (lower.includes('stream') || lower.includes('obs') || lower.includes('frame') || lower.includes('telemetry')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Stream health nominal: 60.0 FPS, 6,240 kbps bitrate. Natural Director phrase cuts aligned to 16 bars.',
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'MARK 60S HIGHLIGHT CLIP',
              before: 'Timestamp: 01:24:18 (Unsaved)',
              after: 'Clip: "Peak Drop Double" staged for TikTok / Reels Dropzone',
              type: 'stream',
              applied: false,
            },
          },
        ]);
      } else if (lower.includes('promo') || lower.includes('social') || lower.includes('post')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Staging 4-post sequence for ${activeGig.venue} into 3x3 Instagram grid.`,
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'STAGE 4-POST PROMO CAMPAIGN',
              before: 'Empty Social Staging Queue',
              after: `4 Posts staged: Announcement, Teaser Clip, Run Sheet, 4K Highlights`,
              type: 'promo',
              applied: false,
            },
          },
        ]);
      } else if (lower.includes('email') || lower.includes('broadcast') || lower.includes('newsletter') || lower.includes('resend') || lower.includes('subscriber') || lower.includes('blast') || lower.includes('fan')) {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: 'Staging email broadcast via Resend to subscribers. Verified domain auth configured (henryix.com). Review staged diff before committing.',
            actionCard: {
              id: `action-${Date.now()}`,
              title: 'DISPATCH SUBSCRIBER BROADCAST (RESEND)',
              before: 'Channel: Idle • Audience: General',
              after: 'Dispatch: "HENRY IX Broadcast" -> broadcasts@henryix.com',
              type: 'email',
              applied: false,
            },
          },
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: `Understood: "${userText}". All operations adhere to tour-grade standards. Ready to execute staged actions on command.`,
          },
        ]);
      }
    }, 450);
  };

  const handleApplyActionCard = (card: ActionCard, idx: number) => {
    if (card.type === 'metadata') {
      cleanTrackTitle(card.targetId || currentTrack.id);
      addToast({ title: 'METADATA SANITIZED', message: 'Applied Discogs canonical tags to audio deck.', type: 'success' });
    } else if (card.type === 'logistics') {
      addToast({ title: 'LOGISTICS VERIFIED', message: `${activeGig.venue} departure locked to ${activeGig.departureTime}.`, type: 'success' });
    } else if (card.type === 'stream') {
      addToast({ title: 'STREAM CLIP MARKED', message: 'Staged 60s highlight to assets dropzone.', type: 'success' });
    } else if (card.type === 'promo') {
      addToast({ title: 'PROMO STAGED', message: `4 promo posts scheduled for ${activeGig.venue}.`, type: 'success' });
    } else if (card.type === 'email') {
      addToast({ title: 'BROADCAST DISPATCHED', message: 'Triggered subscriber broadcast via Resend (broadcasts@henryix.com).', type: 'success' });
    }

    setChatMessages((prev) => {
      const copy = [...prev];
      if (copy[idx]?.actionCard) {
        copy[idx].actionCard.applied = true;
      }
      return copy;
    });
  };

  return (
    <div className="flex flex-col h-full justify-between space-y-4 text-xs font-sans">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-[#E53558]" />
          <span className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">Autonomous Copilot</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          Guardrails Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-1 pb-4">
        {chatMessages.map((msg, idx) => (
          <div key={idx} className={`space-y-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div
              className={`inline-block p-3 rounded-xl text-xs leading-relaxed max-w-[92%] ${
                msg.sender === 'user'
                  ? 'bg-[#E53558]/15 border border-[#E53558]/40 text-zinc-100'
                  : 'bg-[#1b1c22] border border-white/[0.08] text-zinc-300'
              }`}
            >
              <div className="text-[9px] uppercase tracking-wider text-zinc-500 mb-1 font-mono">
                {msg.sender === 'user' ? 'HENRY IX' : 'STUDIO COPILOT'}
              </div>
              {msg.text}
            </div>

            {/* Interactive Action Staging Card */}
            {msg.actionCard && (
              <div className="p-3.5 rounded-xl border border-[#E53558]/30 bg-[#1b1c22] text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-[10px] text-[#E53558] font-bold tracking-wider font-mono">
                  <span>{msg.actionCard.title}</span>
                  {msg.actionCard.applied ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 size={11} />
                      APPLIED
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-mono">STAGED DIFF</span>
                  )}
                </div>
                <div className="text-[11px] space-y-1">
                  <div className="text-red-400/80 line-through truncate font-mono text-[10px]">{msg.actionCard.before}</div>
                  <div className="text-emerald-400 font-bold truncate font-mono text-[10px]">{msg.actionCard.after}</div>
                </div>
                <button
                  onClick={() => handleApplyActionCard(msg.actionCard!, idx)}
                  disabled={msg.actionCard.applied}
                  className={`w-full py-2 rounded-lg text-xs font-semibold uppercase transition-colors ${
                    msg.actionCard.applied
                      ? 'bg-white/[0.04] text-zinc-600 cursor-not-allowed border border-white/[0.06]'
                      : 'bg-[#E53558] text-white hover:bg-[#c92646]'
                  }`}
                >
                  {msg.actionCard.applied ? '✓ MUTATION COMMITTED' : 'COMMIT ACTION CARD'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSendCopilot} className="border-t border-white/[0.06] pt-3 flex gap-2 flex-shrink-0">
        <input
          type="text"
          placeholder="Ask Copilot (e.g. 'Clean metadata', 'Verify gig call-time')..."
          value={copilotInput}
          onChange={(e) => setCopilotInput(e.target.value)}
          className="flex-1 bg-[#1b1c22] border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[#E53558]/50"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-[#E53558] text-white rounded-xl font-bold hover:bg-[#c92646] transition-colors flex items-center justify-center"
        >
          <CornerDownLeft size={14} />
        </button>
      </form>
    </div>
  );
}
