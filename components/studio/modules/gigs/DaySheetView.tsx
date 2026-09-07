'use client';

import React from 'react';
import { Download, Smartphone, FileText } from 'lucide-react';
import { useStudioStore, StudioGig } from '@/store/studioStore';

interface DaySheetViewProps {
  selectedGig: StudioGig | null;
  onNavigate?: (view: string) => void;
}

export default function DaySheetView({ selectedGig, onNavigate }: DaySheetViewProps) {
  const downloadDaySheet = useStudioStore((s) => s.downloadDaySheet);
  const bagItems = useStudioStore((s) => s.bagItems);
  const addToast = useStudioStore((s) => s.addToast);

  const handleSaveLockscreen = () => {
    if (!selectedGig) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark OLED background
    ctx.fillStyle = '#0c0d10';
    ctx.fillRect(0, 0, 1080, 1920);

    // Accent line
    ctx.fillStyle = '#E53558';
    ctx.fillRect(100, 120, 880, 6);

    // Header
    ctx.font = 'bold 54px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HENRY IX // DAY SHEET', 100, 220);

    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#E53558';
    ctx.fillText(selectedGig.venue.toUpperCase(), 100, 290);

    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText(`${selectedGig.date} • Curfew 03:00`, 100, 340);

    // Timeline Boxes
    const drawItem = (y: number, label: string, time: string, sub: string, highlight = false) => {
      ctx.fillStyle = highlight ? '#1b1c22' : '#14151a';
      ctx.fillRect(100, y, 880, 160);
      if (highlight) {
        ctx.strokeStyle = '#E53558';
        ctx.lineWidth = 3;
        ctx.strokeRect(100, y, 880, 160);
      }

      ctx.font = 'bold 30px sans-serif';
      ctx.fillStyle = highlight ? '#E53558' : '#ffffff';
      ctx.fillText(label, 140, y + 65);

      ctx.font = 'bold 36px monospace';
      ctx.fillStyle = highlight ? '#ffffff' : '#10b981';
      ctx.fillText(time, 740, y + 65);

      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#71717a';
      ctx.fillText(sub, 140, y + 115);
    };

    drawItem(420, 'DEPARTURE (30M BUFFER)', selectedGig.departureTime, selectedGig.transitRoute);
    drawItem(620, 'CALL TIME / GREEN ROOM', selectedGig.callTime, 'Equipment line-check & USB load');
    drawItem(820, 'HENRY IX SET TIME', selectedGig.setTime, `${selectedGig.venue} Main Room`, true);

    // Contacts Box
    ctx.fillStyle = '#14151a';
    ctx.fillRect(100, 1040, 880, 280);

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('LOGISTICS & EMERGENCY CONTACTS', 140, 1095);

    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Promoter: ${selectedGig.promoter} (${selectedGig.promoterPhone})`, 140, 1150);
    ctx.fillText(`Booth Wi-Fi: ${selectedGig.wifi}`, 140, 1205);
    ctx.fillText(
      `Fee / Settlement: £${selectedGig.fee} (${selectedGig.depositPaid ? 'Deposit Paid' : 'Cash/Bank'})`,
      140,
      1260
    );

    // DJ Bag Checklist Preview
    ctx.fillStyle = '#14151a';
    ctx.fillRect(100, 1360, 880, 360);

    ctx.font = 'bold 26px sans-serif';
    ctx.fillStyle = '#a1a1aa';
    ctx.fillText('CRITICAL DJ BAG VERIFICATION', 140, 1415);

    bagItems.slice(0, 5).forEach((item, idx) => {
      ctx.font = '24px sans-serif';
      ctx.fillStyle = item.checked ? '#10b981' : '#f59e0b';
      ctx.fillText(`${item.checked ? '✓' : '○'} ${item.name}`, 140, 1475 + idx * 45);
    });

    // Footer
    ctx.font = '22px monospace';
    ctx.fillStyle = '#71717a';
    ctx.fillText('HENRY IX STUDIO // LOCKSCREEN TOUR CARD', 140, 1800);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `LOCKSCREEN_${selectedGig.title.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addToast({
      title: 'LOCKSCREEN IMAGE SAVED',
      message: 'Downloaded 1080x1920 lockscreen day sheet for phone.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {selectedGig ? (
        <>
          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-4 shadow-sm">
            <div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                1-Page Tour Day Sheet // {selectedGig.venue.toUpperCase()}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Compact print &amp; mobile lockscreen view</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadDaySheet(selectedGig.id)}
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download size={13} />
                <span>Download Day Sheet (.txt)</span>
              </button>

              <button
                onClick={handleSaveLockscreen}
                className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Smartphone size={13} />
                <span>Save Lockscreen Wallpaper</span>
              </button>
            </div>
          </div>

          {/* Day Sheet Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#14151a] p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="border-b border-white/[0.08] pb-4 flex justify-between items-start">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">
                  HENRY IX TOUR OPERATIONS
                </span>
                <h3 className="font-semibold text-2xl text-white mt-1 tracking-tight">{selectedGig.title}</h3>
                <div className="text-xs text-zinc-400 mt-1">
                  {selectedGig.venue} • {selectedGig.address}
                </div>
              </div>
              <div className="text-right font-mono text-xs">
                <span className="text-[#E53558] font-bold block">{selectedGig.date}</span>
                <span className="text-zinc-500 text-[10px]">CURFEW: 03:00 AM</span>
              </div>
            </div>

            {/* Schedule Section */}
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-zinc-300 uppercase tracking-wider border-b border-white/[0.06] pb-1.5">
                Event Timeline &amp; Run-Sheet
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center">
                  <span className="font-medium text-white">Depart Home Studio</span>
                  <span className="font-mono text-emerald-400 font-medium">
                    {selectedGig.departureTime} (30m Safety Buffer)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center">
                  <span className="text-zinc-400">Transit Route</span>
                  <span className="font-mono text-zinc-300">{selectedGig.transitRoute}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center">
                  <span className="text-zinc-400">Call Time / Green Room Arrival</span>
                  <span className="font-mono text-amber-400 font-medium">{selectedGig.callTime}</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0c0d10] border border-[#E53558]/30 flex justify-between items-center bg-[#E53558]/5">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E53558] animate-ping" />
                    HENRY IX Performance
                  </span>
                  <span className="font-mono text-[#E53558] font-bold">{selectedGig.setTime}</span>
                </div>
              </div>
            </div>

            {/* Access & Wi-Fi */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-1">
                <span className="text-zinc-500 text-[10px] block uppercase font-sans">Promoter Contact</span>
                <div className="text-white font-medium">{selectedGig.promoter}</div>
                <div className="text-zinc-400 text-[11px]">{selectedGig.promoterPhone}</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-1">
                <span className="text-zinc-500 text-[10px] block uppercase font-sans">Booth Wi-Fi</span>
                <div className="text-[#06b6d4] font-medium truncate">{selectedGig.wifi}</div>
                <div className="text-zinc-500 text-[10px] font-sans">
                  Guestlist: {selectedGig.guestlistAllocated} Slots
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 rounded-xl border border-white/[0.08] bg-[#14151a] text-center space-y-3 shadow-sm">
          <FileText size={32} className="mx-auto text-zinc-600" />
          <h4 className="text-sm font-semibold text-white uppercase">No Active Gig Selected</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            No gigs are currently logged in Notion. Add an upcoming gig in the Master Hub to generate custom 1-page day
            sheets and mobile lockscreens.
          </p>
          <button
            onClick={() => {
              if (onNavigate) onNavigate('gigs-hub');
            }}
            className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm"
          >
            + Add Gig in Master Hub
          </button>
        </div>
      )}
    </div>
  );
}
