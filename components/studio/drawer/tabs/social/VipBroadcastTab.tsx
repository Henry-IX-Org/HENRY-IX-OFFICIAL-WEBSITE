'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function VipBroadcastTab() {
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const addToast = useStudioStore((s) => s.addToast);

  const activeGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || {
    venue: 'London Venue',
    setTime: '01:00 - 03:00',
  };

  const [vipAudience, setVipAudience] = useState('Inner Circle (120 Subscribers)');
  const [vipSmsText, setVipSmsText] = useState(
    `[LOCATION UPDATE] ${activeGig.venue} secret warehouse entrance via rear alleyway. Doors 22:00. Passphrase at door: SUB-FREQUENCY.`
  );

  const handleDispatchVipSms = () => {
    addToast({
      title: 'VIP SMS DISPATCHED',
      message: `Secret broadcast delivered to ${vipAudience}.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Send size={14} className="text-[#E53558]" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            VIP Inner Circle SMS Alert
          </h4>
        </div>
        <span className="text-[#E53558] font-mono text-[10px] font-semibold bg-[#E53558]/10 px-2 py-0.5 rounded-full border border-[#E53558]/20">
          RESEND & SMS
        </span>
      </div>

      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3">
        <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium block">Target Audience:</span>
        <select
          value={vipAudience}
          onChange={(e) => setVipAudience(e.target.value)}
          className="w-full bg-[#14151a] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-[#E53558]/50"
        >
          <option value="Inner Circle (120 Subscribers)">Inner Circle (120 Subscribers)</option>
          <option value="Residency VIPs (50)">Residency VIPs (50 Dancers)</option>
          <option value="Open Decks Collective">Open Decks Collective</option>
        </select>

        <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase font-mono font-medium">
          <span>Secret Dispatch Text:</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setVipSmsText(`[COORDINATES] 51.4905° N, 0.0982° W (${activeGig.venue}). Secret entrance via loading dock.`);
                addToast({ title: 'PRESET LOADED', message: 'Location coordinates preset applied.', type: 'info' });
              }}
              className="text-[9px] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
            >
              📍 Coords
            </button>
            <button
              type="button"
              onClick={() => {
                setVipSmsText(`[SET TIMES] ${activeGig.venue}: 22:00 Resident / ${activeGig.setTime} HENRY IX / 03:00 B2B Close.`);
                addToast({ title: 'PRESET LOADED', message: 'Set times preset applied.', type: 'info' });
              }}
              className="text-[9px] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
            >
              ⏰ Times
            </button>
            <button
              type="button"
              onClick={() => {
                setVipSmsText(`[DOOR PASS] Whisper 'SUB-FREQUENCY' at the ${activeGig.venue} guestlist desk for express entry.`);
                addToast({ title: 'PRESET LOADED', message: 'Door password preset applied.', type: 'info' });
              }}
              className="text-[9px] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white transition-colors"
            >
              🔑 Pass
            </button>
          </div>
        </div>

        <textarea
          rows={4}
          value={vipSmsText}
          onChange={(e) => setVipSmsText(e.target.value)}
          className="w-full bg-[#14151a] border border-white/[0.08] rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#E53558]/50 resize-none"
        />

        <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
          <span>GSM CHARACTERS: {vipSmsText.length} / 160</span>
          <span>1 SMS SEGMENT</span>
        </div>
      </div>

      <button
        onClick={handleDispatchVipSms}
        className="w-full py-2.5 rounded-xl bg-[#E53558] text-white font-semibold text-xs uppercase hover:bg-[#c92646] transition-colors flex items-center justify-center gap-2"
      >
        <Send size={13} />
        <span>Dispatch VIP Alert Now</span>
      </button>
    </div>
  );
}
