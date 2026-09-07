'use client';

import React, { useState } from 'react';
import { Send, Share2, Download } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function VipDispatchView() {
  const addToast = useStudioStore((s) => s.addToast);

  // VIP SMS state
  const [vipCoords, setVipCoords] = useState(
    'Secret Warehouse // Unit 4, Surrey Canal Rd, SE14. Doors 23:00. BYOB. Password at door: DUBPLATE8A.'
  );
  const [recipientGroup, setRecipientGroup] = useState('Inner Circle (120 Subscribers)');

  // 9:16 Story Card state
  const [storyEventTitle, setStoryEventTitle] = useState('KNIGHT CLUB VOL 4');
  const [storyTracks, setStoryTracks] = useState(
    'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]\nrude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend) - dj g2g\nDo It Diva (Don Omar x Heidi Montag) - zpectrum\nFlori Pori - Favela Funk\nMy Neck My Back - Sunshine Vendetta'
  );

  const handleDispatchVipSms = () => {
    addToast({
      title: 'VIP BROADCAST DISPATCHED',
      message: `Sent secret warehouse coordinates via Resend & SMS to ${recipientGroup}.`,
      type: 'success',
    });
  };

  const handleDownloadStoryCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark OLED background
    ctx.fillStyle = '#0c0d10';
    ctx.fillRect(0, 0, 1080, 1920);

    // Red glow accent
    ctx.fillStyle = '#E53558';
    ctx.fillRect(80, 120, 8, 80);

    // Title
    ctx.font = 'bold 56px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('HENRY IX // LIVE SETLIST', 120, 180);

    // Event
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#E53558';
    ctx.fillText(storyEventTitle.toUpperCase(), 120, 240);

    // Tracklist
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#CCCCCC';
    const lines = storyTracks.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(`${idx + 1}. ${line}`, 120, 380 + idx * 70);
    });

    // Watermark footer
    ctx.font = '22px monospace';
    ctx.fillStyle = '#71717a';
    ctx.fillText('HENRYIX.COM • ARCHIVED LIVE RECORDING', 120, 1800);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `STORY_CARD_${storyEventTitle.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addToast({
      title: 'STORY CARD SAVED',
      message: 'Downloaded 9:16 high-res Story PNG for Instagram.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* VIP SMS Broadcast Card */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
        <div className="border-b border-white/[0.08] pb-3">
          <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
            <Send size={16} className="text-[#06b6d4]" />
            VIP Inner Circle Dispatcher
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Direct instant SMS / Email alert dispatch for secret London coordinates &amp; door passcodes
          </p>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div>
            <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">
              Recipient Audience:
            </label>
            <select
              value={recipientGroup}
              onChange={(e) => setRecipientGroup(e.target.value)}
              className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
            >
              <option value="Inner Circle (120 Subscribers)">Inner Circle (120 Subscribers)</option>
              <option value="London Resident List (350 Subscribers)">
                London Resident List (350 Subscribers)
              </option>
              <option value="All Verified Leads (500+)">All Verified Leads (500+)</option>
            </select>
          </div>

          <div>
            <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">
              Secret Coordinates &amp; Access Instructions:
            </label>
            <textarea
              rows={3}
              value={vipCoords}
              onChange={(e) => setVipCoords(e.target.value)}
              className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
            />
          </div>

          <button
            onClick={handleDispatchVipSms}
            className="w-full py-2.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Send size={14} />
            <span>Dispatch VIP Alert to {recipientGroup}</span>
          </button>
        </div>
      </div>

      {/* 9:16 Tracklist Story Card Generator */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
        <div className="border-b border-white/[0.08] pb-3">
          <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
            <Share2 size={16} className="text-[#3b82f6]" />
            9:16 Tracklist Story Generator
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Generates 1080x1920 retro-dithered vertical graphic formatted for Instagram Stories
          </p>
        </div>

        <div className="space-y-4 text-xs font-sans">
          <div>
            <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Event Title:</label>
            <input
              type="text"
              value={storyEventTitle}
              onChange={(e) => setStoryEventTitle(e.target.value)}
              className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
            />
          </div>

          <div>
            <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Set Tracklist:</label>
            <textarea
              rows={4}
              value={storyTracks}
              onChange={(e) => setStoryTracks(e.target.value)}
              className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
            />
          </div>

          <button
            onClick={handleDownloadStoryCard}
            className="w-full py-2.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={14} />
            <span>Download 9:16 Story PNG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
