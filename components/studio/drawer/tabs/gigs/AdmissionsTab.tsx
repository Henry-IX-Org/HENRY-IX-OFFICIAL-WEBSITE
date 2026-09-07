'use client';

import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { useStudioStore, AdmittedGuest } from '@/store/studioStore';

export default function AdmissionsTab() {
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const admittedGuests = useStudioStore((s) => s.admittedGuests);
  const admitGuest = useStudioStore((s) => s.admitGuest);
  const addToast = useStudioStore((s) => s.addToast);

  const [guestNameInput, setGuestNameInput] = useState('');
  const [guestTypeInput, setGuestTypeInput] = useState<'Guestlist +1' | 'VIP Promoter Pass' | 'Artist Guest'>('Guestlist +1');

  const activeGig = gigs.find((g) => g.id === activeGigId) || gigs[0];

  const handleAdmitGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestNameInput.trim()) return;

    const admittedName = guestNameInput.trim();
    admitGuest({
      code: `H9-DOOR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: admittedName,
      type: guestTypeInput,
      status: 'ADMITTED',
    });
    setGuestNameInput('');

    // Audio & Haptic confirmation
    try {
      if ('vibrate' in navigator) navigator.vibrate([40, 60, 40]);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}

    addToast({
      title: 'GUEST ADMITTED',
      message: `${admittedName} verified and admitted.`,
      type: 'success',
    });
  };

  if (!activeGig || gigs.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] text-center space-y-3 font-sans text-xs">
        <div className="text-zinc-400 font-semibold uppercase tracking-wider font-mono text-[11px]">
          No Active Guestlist Session
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Guestlist admissions and sensory door check-in require a scheduled gig in Notion. Connect a booking to activate the quota meter and real-time scanner.
        </p>
      </div>
    );
  }

  const allocation = activeGig.guestlistAllocated || 6;
  const quotaPct = Math.round((admittedGuests.length / allocation) * 100);

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <UserCheck size={14} className="text-emerald-400" />
            <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
              Guestlist ({activeGig.venue})
            </h4>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {admittedGuests.length} / {allocation} ADMITTED
          </span>
        </div>

        {/* Live Door Count Meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>ALLOCATION QUOTA</span>
            <span className="text-zinc-200">{quotaPct}%</span>
          </div>
          <div className="h-2 bg-black/50 border border-white/[0.06] rounded-full overflow-hidden flex items-center">
            <div
              className="h-full bg-[#E53558] rounded-full transition-all"
              style={{ width: `${Math.min(100, quotaPct)}%` }}
            />
          </div>
        </div>

        {/* Quick Check-In Form */}
        <form onSubmit={handleAdmitGuest} className="space-y-2.5 pt-2 border-t border-white/[0.06]">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium block">Quick Door Check-In:</span>
          <div className="flex gap-2">
            <input
              type="text"
              value={guestNameInput}
              onChange={(e) => setGuestNameInput(e.target.value)}
              placeholder="Guest full name..."
              className="flex-1 bg-[#14151a] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-[#E53558]/50"
            />
            <select
              value={guestTypeInput}
              onChange={(e) => setGuestTypeInput(e.target.value as any)}
              className="bg-[#14151a] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-[#E53558]/50"
            >
              <option value="Guestlist +1">Guestlist +1</option>
              <option value="VIP Promoter Pass">VIP Promoter Pass</option>
              <option value="Artist Guest">Artist Guest</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-emerald-500 text-black font-semibold text-xs uppercase hover:bg-emerald-400 transition-colors"
          >
            ✓ Admit Guest (Haptic & Chime)
          </button>
        </form>

        {/* Admitted Guests List */}
        <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 pt-1">
          {admittedGuests.map((guest, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between text-[11px]">
              <div>
                <span className="font-semibold text-zinc-200">{guest.name}</span>
                <span className="text-zinc-500 ml-1.5 font-mono text-[10px]">({guest.type})</span>
              </div>
              <span className="text-emerald-400 font-mono text-[10px]">{guest.time}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            const list = admittedGuests.map((g) => `${g.time} - ${g.name} [${g.type}]`).join('\n');
            navigator.clipboard.writeText(list);
            addToast({ title: 'DOOR LIST COPIED', message: 'Copied admitted list for promoter check.', type: 'success' });
          }}
          className="w-full py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
        >
          📋 Copy Door List for Promoter
        </button>
      </div>
    </div>
  );
}
