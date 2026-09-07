'use client';

import React, { useMemo } from 'react';
import { Calendar, Download, Smartphone, Copy } from 'lucide-react';
import { useStudioStore, StudioGig } from '@/store/studioStore';

export default function LogisticsTab() {
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const setActiveGigId = useStudioStore((s) => s.setActiveGigId);
  const downloadDaySheet = useStudioStore((s) => s.downloadDaySheet);
  const addToast = useStudioStore((s) => s.addToast);

  const FALLBACK_GIG: StudioGig = useMemo(
    () => ({
      id: '',
      date: 'TBD',
      title: 'No Upcoming Gigs',
      venue: 'London, UK',
      address: 'London, UK',
      setTime: '01:00 - 03:00',
      callTime: '23:30',
      departureTime: '22:30',
      transitRoute: 'London TfL Network',
      fee: 0,
      depositPaid: false,
      promoter: 'Promoter',
      promoterPhone: 'N/A',
      wifi: 'Venue_Guest',
      guestlistAllocated: 6,
      ticketLink: 'https://ra.co',
      status: 'Contract',
      phase: 1,
    }),
    []
  );

  const activeGig: StudioGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || FALLBACK_GIG;

  const handleDownloadLockscreenDaySheet = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#14151a';
    ctx.fillRect(0, 0, 1080, 1920);

    // Accent bars
    ctx.fillStyle = '#E53558';
    ctx.fillRect(40, 100, 1000, 12);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px monospace';
    ctx.fillText('HENRY IX // DAY SHEET', 60, 200);

    ctx.fillStyle = '#888888';
    ctx.font = '32px monospace';
    ctx.fillText(`DATE: ${activeGig.date}`, 60, 280);
    ctx.fillText(`VENUE: ${activeGig.venue.toUpperCase()}`, 60, 340);
    ctx.fillText(`SET TIME: ${activeGig.setTime}`, 60, 400);

    ctx.fillStyle = '#E53558';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`DEPARTURE: ${activeGig.departureTime} (TfL Buffer)`, 60, 520);
    ctx.fillText(`CALL TIME: ${activeGig.callTime}`, 60, 580);

    ctx.fillStyle = '#cccccc';
    ctx.font = '28px monospace';
    ctx.fillText(`TRANSIT: ${activeGig.transitRoute}`, 60, 700);
    ctx.fillText(`ADDRESS: ${activeGig.address}`, 60, 760);
    ctx.fillText(`PROMOTER: ${activeGig.promoter} (${activeGig.promoterPhone})`, 60, 820);
    ctx.fillText(`WI-FI: ${activeGig.wifi}`, 60, 880);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `HENRY_IX_LOCKSCREEN_${activeGig.venue.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addToast({
      title: 'LOCKSCREEN GENERATED',
      message: 'Saved 9:16 lockscreen wallpaper to downloads.',
      type: 'success',
    });
  };

  if (gigs.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] text-center space-y-3 font-sans text-xs">
        <div className="text-zinc-400 font-semibold uppercase tracking-wider font-mono text-[11px]">
          No Gigs in Notion Database
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Your Notion Bookings database currently has 0 confirmed bookings. Add a gig in Gigs Hub to automatically sync logistics, day sheets, and financial breakdowns.
        </p>
        <div className="p-3 bg-black/40 rounded-lg border border-white/[0.06] text-left text-[11px] space-y-1 font-mono text-zinc-400">
          <div>• Notion DB: <span className="text-zinc-200">Bookings & Enquiries</span></div>
          <div>• Auto-generates 1-page Day Sheet (.txt)</div>
          <div>• Calculates 9:16 iPhone Lockscreen graphic</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs font-sans">
      {/* Active Gig Selector */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] space-y-1.5">
        <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium">Select Active Gig:</span>
        <select
          value={activeGigId}
          onChange={(e) => setActiveGigId(e.target.value)}
          className="w-full bg-[#1b1c22] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-[#E53558]/50 font-sans"
        >
          {gigs.map((g) => (
            <option key={g.id} value={g.id}>
              {g.venue} ({g.date}) — {g.title}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-2.5 text-[11px] font-mono">
        <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
          <Calendar size={14} className="text-cyan-400" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[10px]">Logistics Overview</h4>
        </div>
        <div><span className="text-zinc-500">VENUE:</span> <strong className="text-zinc-100">{activeGig.venue}</strong></div>
        <div><span className="text-zinc-500">ADDRESS:</span> <span className="text-zinc-300">{activeGig.address}</span></div>
        <div><span className="text-zinc-500">TRANSIT:</span> <span className="text-zinc-300">{activeGig.transitRoute}</span></div>
        <div><span className="text-zinc-500">DEPARTURE:</span> <strong className="text-amber-400">{activeGig.departureTime}</strong> (30m buffer)</div>
        <div><span className="text-zinc-500">CALL-TIME:</span> <span className="text-zinc-200">{activeGig.callTime}</span></div>
        <div><span className="text-zinc-500">SET TIME:</span> <strong className="text-cyan-400">{activeGig.setTime}</strong></div>

        <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
          <div><span className="text-zinc-500">PROMOTER:</span> <span className="text-zinc-300">{activeGig.promoter} ({activeGig.promoterPhone})</span></div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeGig.promoterPhone);
              addToast({ title: 'PHONE COPIED', message: `Copied ${activeGig.promoterPhone}.`, type: 'info' });
            }}
            className="text-zinc-400 hover:text-white p-1"
          >
            <Copy size={12} />
          </button>
        </div>

        <div className="flex justify-between items-center">
          <div><span className="text-zinc-500">WI-FI:</span> <span className="text-zinc-200">{activeGig.wifi}</span></div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(activeGig.wifi);
              addToast({ title: 'WI-FI COPIED', message: 'Green room password copied.', type: 'info' });
            }}
            className="text-zinc-400 hover:text-white p-1"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-white/[0.06] space-y-2">
        <button
          onClick={() => downloadDaySheet(activeGig.id)}
          className="w-full py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <Download size={13} />
          <span>Download 1-Page Day Sheet (.txt)</span>
        </button>
        <button
          onClick={handleDownloadLockscreenDaySheet}
          className="w-full py-2.5 rounded-xl bg-[#E53558] text-white font-semibold text-xs uppercase hover:bg-[#c92646] transition-colors flex items-center justify-center gap-2"
        >
          <Smartphone size={13} />
          <span>Save Lockscreen Wallpaper (PNG)</span>
        </button>
      </div>
    </div>
  );
}
