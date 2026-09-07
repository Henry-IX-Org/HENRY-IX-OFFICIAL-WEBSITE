'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Download, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  MapPin,
  Train,
  DollarSign,
  CheckSquare,
  Share2,
  Copy,
  Smartphone,
  Plus,
  RotateCcw,
  RefreshCw,
  X
} from 'lucide-react';
import { useStudioStore, StudioGig } from '@/store/studioStore';

export interface GigsModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function GigsModule({
  activeView = 'gigs-hub',
  onNavigate,
}: GigsModuleProps) {
  const gigs = useStudioStore(s => s.gigs);
  const activeGigId = useStudioStore(s => s.activeGigId);
  const setActiveGigId = useStudioStore(s => s.setActiveGigId);
  const fetchRealGigs = useStudioStore(s => s.fetchRealGigs);
  const isLoadingGigs = useStudioStore(s => s.isLoadingGigs);
  const bagItems = useStudioStore(s => s.bagItems);
  const toggleBagItem = useStudioStore(s => s.toggleBagItem);
  const downloadInvoice = useStudioStore(s => s.downloadInvoice);
  const downloadDaySheet = useStudioStore(s => s.downloadDaySheet);
  const taxRate = useStudioStore(s => s.settings.taxReserve);
  const addToast = useStudioStore(s => s.addToast);

  // Form state for creating gig in Notion
  const [isAddingGig, setIsAddingGig] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gigTitle, setGigTitle] = useState('');
  const [gigVenue, setGigVenue] = useState('');
  const [gigDate, setGigDate] = useState('');
  const [gigSetTime, setGigSetTime] = useState('01:00 - 03:00');
  const [gigFee, setGigFee] = useState('450');
  const [gigPromoter, setGigPromoter] = useState('');
  const [gigEmail, setGigEmail] = useState('');
  const [gigPhone, setGigPhone] = useState('');
  const [gigNotes, setGigNotes] = useState('');

  useEffect(() => {
    fetchRealGigs();
  }, [fetchRealGigs]);

  const selectedGig = gigs.find(g => g.id === activeGigId) || gigs[0] || null;
  const uncheckedCount = bagItems.filter(i => !i.checked).length;

  // Map activeView to sub-view mode
  const currentMode = useMemo(() => {
    switch (activeView) {
      case 'gigs-daysheet':
        return 'daysheet';
      case 'gigs-checklist':
        return 'bag-checklist';
      case 'gigs-finance':
        return 'finance';
      case 'gigs-hub':
      default:
        return 'hub';
    }
  }, [activeView]);

  const handleCreateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gigTitle.trim()) {
      addToast({ title: 'TITLE REQUIRED', message: 'Please enter a booking / event title.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/studio/gigs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: gigTitle.trim(),
          venue: gigVenue.trim() || undefined,
          client: gigPromoter.trim() || undefined,
          eventDate: gigDate || undefined,
          fee: Number(gigFee) || 0,
          contactEmail: gigEmail.trim() || undefined,
          contactPhone: gigPhone.trim() || undefined,
          notes: gigNotes.trim() ? `Set Time: ${gigSetTime}. ${gigNotes.trim()}` : `Set Time: ${gigSetTime}`,
        }),
      });

      const data: any = await res.json();
      if (data.success) {
        addToast({
          title: 'GIG LOGGED TO NOTION',
          message: `Saved "${gigTitle}" to Notion Bookings Database!`,
          type: 'success',
        });
        setIsAddingGig(false);
        setGigTitle('');
        setGigVenue('');
        setGigDate('');
        setGigFee('450');
        setGigPromoter('');
        setGigEmail('');
        setGigPhone('');
        setGigNotes('');
        await fetchRealGigs();
      } else {
        addToast({
          title: 'CREATION FAILED',
          message: data.error || 'Failed to create booking in Notion',
          type: 'error',
        });
      }
    } catch (err: any) {
      addToast({
        title: 'NETWORK ERROR',
        message: err.message || 'Failed to communicate with Notion API',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Lockscreen Wallpaper
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
    ctx.fillText(`Fee / Settlement: £${selectedGig.fee} (${selectedGig.depositPaid ? 'Deposit Paid' : 'Cash/Bank'})`, 140, 1260);

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
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      
      {/* 1. HEADER & SUB-VIEW TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Gigs & Tour Logistics</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                04
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            London TfL routing • 1-page day sheets • Smart DJ bag • HMRC tax & invoicing
          </p>
        </div>

        {/* Sub-navigation Switcher Pills (Notion Segmented Control) */}
        <div className="flex flex-wrap items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('gigs-hub') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'hub'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Calendar size={13} className={currentMode === 'hub' ? 'text-emerald-400' : ''} />
            <span>Master Hub</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-daysheet') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'daysheet'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText size={13} className={currentMode === 'daysheet' ? 'text-[#3b82f6]' : ''} />
            <span>1-Page Day Sheet</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-checklist') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'bag-checklist'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <CheckSquare size={13} className={currentMode === 'bag-checklist' ? 'text-amber-400' : ''} />
            <span>Smart DJ Bag ({uncheckedCount})</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-finance') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'finance'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <DollarSign size={13} className={currentMode === 'finance' ? 'text-emerald-400' : ''} />
            <span>Finance & HMRC</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-scanner') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeView === 'gigs-scanner'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Smartphone size={13} className={activeView === 'gigs-scanner' ? 'text-[#8b5cf6]' : ''} />
            <span>Door QR Scanner</span>
          </button>

          <button
            onClick={() => fetchRealGigs()}
            disabled={isLoadingGigs}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Refresh from Notion"
          >
            <RefreshCw size={13} className={isLoadingGigs ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. CALL-TIME ALERT BANNER (Only when active gigs exist) */}
      {selectedGig && uncheckedCount > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-300 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
            <span>
              <strong>Logistics Warning:</strong> {selectedGig.venue} call-time approaching. {uncheckedCount} items remaining in Smart DJ Bag!
            </span>
          </div>
          <button 
            onClick={() => onNavigate ? onNavigate('gigs-checklist') : null}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-medium text-xs hover:bg-amber-300 transition-colors shadow-sm"
          >
            Review Smart Bag
          </button>
        </div>
      )}

      {/* Active Gig Selector Pills & Add Gig Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono text-[10px] uppercase">Active Gig:</span>
          {gigs.length > 0 ? (
            gigs.map(gig => (
              <button
                key={gig.id}
                onClick={() => setActiveGigId(gig.id)}
                className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                  selectedGig?.id === gig.id 
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-sm' 
                    : 'border-white/[0.08] bg-[#14151a] text-zinc-400 hover:text-white hover:border-white/20'
                }`}
              >
                {gig.title} ({gig.venue})
              </button>
            ))
          ) : (
            <span className="text-zinc-500 text-xs italic">No bookings currently in Notion database</span>
          )}
        </div>

        <button
          onClick={() => setIsAddingGig(!isAddingGig)}
          className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
        >
          {isAddingGig ? <X size={13} /> : <Plus size={13} />}
          <span>{isAddingGig ? 'Close Form' : '+ Add Gig to Notion'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ADD GIG TO NOTION FORM (INLINE / MODAL)                                     */}
      {/* ========================================================================= */}
      {(isAddingGig || gigs.length === 0) && (
        <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E53558]" />
                <span>Add Gig to Notion Database</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Writes directly to verified Notion Bookings &amp; Leads database (40826b67).
              </p>
            </div>
            {gigs.length > 0 && (
              <button onClick={() => setIsAddingGig(false)} className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06]">
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleCreateGig} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Event / Booking Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Knight Club Vol 4"
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Venue &amp; City</label>
                <input
                  type="text"
                  placeholder="e.g. Corsica Studios, London"
                  value={gigVenue}
                  onChange={(e) => setGigVenue(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Event Date</label>
                <input
                  type="date"
                  value={gigDate}
                  onChange={(e) => setGigDate(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Set Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 01:00 - 03:00"
                  value={gigSetTime}
                  onChange={(e) => setGigSetTime(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Performance Fee (£)</label>
                <input
                  type="number"
                  placeholder="450"
                  value={gigFee}
                  onChange={(e) => setGigFee(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Promoter / Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus"
                  value={gigPromoter}
                  onChange={(e) => setGigPromoter(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Promoter Email</label>
                <input
                  type="email"
                  placeholder="promoter@venue.co.uk"
                  value={gigEmail}
                  onChange={(e) => setGigEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Promoter Phone</label>
                <input
                  type="tel"
                  placeholder="07911 123456"
                  value={gigPhone}
                  onChange={(e) => setGigPhone(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">Technical Notes / Hospitality</label>
              <textarea
                rows={2}
                placeholder="Equipment specs, monitor requests, rider requirements..."
                value={gigNotes}
                onChange={(e) => setGigNotes(e.target.value)}
                className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-white/[0.08]">
              {gigs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingGig(false)}
                  className="px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#E53558] text-white font-medium text-xs hover:bg-[#f43f5e] flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus size={14} className={isSubmitting ? 'animate-spin' : ''} />
                <span>{isSubmitting ? 'Creating in Notion...' : 'Save to Notion Bookings'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW: MASTER GIG HUB & 5-PHASE EVENT COMMAND VIEW                   */}
      {/* ========================================================================= */}
      {currentMode === 'hub' && (
        <div className="space-y-6">
          
          {/* Master Schedule Table */}
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
                London Master Gig Schedule ({gigs.length} Shows)
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {isLoadingGigs ? 'SYNCING NOTION...' : 'NOTION LIVE SYNCED'}
              </span>
            </div>

            {gigs.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-400 text-[10px] uppercase font-mono">
                      <th className="p-3 font-medium">Date</th>
                      <th className="p-3 font-medium">Event / Residency</th>
                      <th className="p-3 font-medium">Venue</th>
                      <th className="p-3 font-medium">Set Time</th>
                      <th className="p-3 font-medium">Call Time</th>
                      <th className="p-3 font-medium">Fee / Deposit</th>
                      <th className="p-3 text-right font-medium">Tickets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {gigs.map((g) => (
                      <tr 
                        key={g.id}
                        onClick={() => setActiveGigId(g.id)}
                        className={`hover:bg-white/[0.04] cursor-pointer transition-colors ${
                          selectedGig?.id === g.id ? 'bg-[#E53558]/5 border-l-2 border-[#E53558]' : ''
                        }`}
                      >
                        <td className="p-3 text-zinc-400 font-mono text-[11px]">{g.date}</td>
                        <td className="p-3 font-medium text-white">{g.title}</td>
                        <td className="p-3 text-zinc-300">{g.venue}</td>
                        <td className="p-3 text-emerald-400 font-mono">{g.setTime}</td>
                        <td className="p-3 text-amber-400 font-mono">{g.callTime}</td>
                        <td className="p-3 text-white font-mono">
                          £{g.fee} <span className="text-zinc-500 text-[10px] font-sans">({g.depositPaid ? 'Deposit Paid' : 'Pending'})</span>
                        </td>
                        <td className="p-3 text-right">
                          <a 
                            href={g.ticketLink} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#06b6d4] hover:underline text-[11px] font-medium"
                          >
                            RA Link ↗
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2 rounded-lg border border-dashed border-white/10 bg-[#0c0d10]">
                <Calendar size={28} className="mx-auto text-zinc-600" />
                <div className="text-xs text-zinc-300 font-medium">0 Bookings Currently in Notion</div>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Your live Notion Bookings database has 0 shows. Use the form above to add an upcoming London booking, residency, or club night.
                </p>
              </div>
            )}
          </div>

          {/* 5-Phase Master Event Command View (When a gig is selected) */}
          {selectedGig && (
            <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-6 shadow-sm">
              <div className="flex flex-wrap justify-between items-start border-b border-white/[0.08] pb-4 gap-3">
                <div>
                  <h3 className="font-semibold text-2xl text-white tracking-tight">{selectedGig.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#E53558]" />
                    <span>{selectedGig.venue} • {selectedGig.address}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium font-mono">
                    ✓ {selectedGig.status}
                  </span>
                  <div className="text-[11px] text-zinc-500 mt-1 font-mono">Fee: £{selectedGig.fee} ({selectedGig.depositPaid ? 'Deposit Paid' : 'Pending'})</div>
                </div>
              </div>

              {/* The 5 Phases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
                  <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 1</div>
                  <div className="font-semibold text-white">Planning & Contract</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Agreed: £{selectedGig.fee}<br />
                    Promoter: {selectedGig.promoter}<br />
                    <span className="text-emerald-400">Contract Signed</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
                  <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 2</div>
                  <div className="font-semibold text-white">Music Prep</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Linked Crate: <span className="text-[#06b6d4]">Live Master Library</span><br />
                    Key Range: 2A - 12A<br />
                    Dubplates Staged
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
                  <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 3</div>
                  <div className="font-semibold text-white">Promo & Tickets</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Social Campaign: Active<br />
                    RA Tickets: Active<br />
                    Guestlist: {selectedGig.guestlistAllocated} Slots
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
                  <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 4</div>
                  <div className="font-semibold text-white">Logistics</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Departure: <strong className="text-emerald-400 font-mono">{selectedGig.departureTime}</strong><br />
                    Call-Time: {selectedGig.callTime}<br />
                    Set: {selectedGig.setTime}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
                  <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 5</div>
                  <div className="font-semibold text-white">Post-Event Wrap</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">
                    Booth Audio: Ready<br />
                    Tax Reserve: {taxRate}% (£{Math.round(selectedGig.fee * (taxRate / 100))})<br />
                    Archived to Past
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-VIEW: 1-PAGE DAY SHEET (RUN SHEET) GENERATOR                        */}
      {/* ========================================================================= */}
      {currentMode === 'daysheet' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {selectedGig ? (
            <>
              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-4 shadow-sm">
                <div>
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">1-Page Tour Day Sheet // {selectedGig.venue.toUpperCase()}</h3>
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
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">HENRY IX TOUR OPERATIONS</span>
                    <h3 className="font-semibold text-2xl text-white mt-1 tracking-tight">{selectedGig.title}</h3>
                    <div className="text-xs text-zinc-400 mt-1">{selectedGig.venue} • {selectedGig.address}</div>
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
                      <span className="font-mono text-emerald-400 font-medium">{selectedGig.departureTime} (30m Safety Buffer)</span>
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
                    <div className="text-zinc-500 text-[10px] font-sans">Guestlist: {selectedGig.guestlistAllocated} Slots</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 rounded-xl border border-white/[0.08] bg-[#14151a] text-center space-y-3 shadow-sm">
              <FileText size={32} className="mx-auto text-zinc-600" />
              <h4 className="text-sm font-semibold text-white uppercase">No Active Gig Selected</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                No gigs are currently logged in Notion. Add an upcoming gig in the Master Hub to generate custom 1-page day sheets and mobile lockscreens.
              </p>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('gigs-hub');
                  setIsAddingGig(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm"
              >
                + Add Gig in Master Hub
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-VIEW: SMART DJ BAG HARDWARE CHECKLIST                              */}
      {/* ========================================================================= */}
      {currentMode === 'bag-checklist' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
                  <CheckSquare size={18} className="text-[#E53558]" />
                  Smart DJ Bag // Booth Hardware Checklist
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Critical gear inspection with automated departure warning 2 hours before London TfL call-time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    bagItems.forEach(i => { if (!i.checked) toggleBagItem(i.id); });
                    addToast({ title: 'ALL ITEMS CHECKED', message: 'Smart DJ Bag is 100% packed.', type: 'success' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors shadow-sm"
                >
                  Check All Items
                </button>

                <button
                  onClick={() => {
                    bagItems.forEach(i => { if (i.checked) toggleBagItem(i.id); });
                    addToast({ title: 'CHECKLIST RESET', message: 'Reset packing list for next gig.', type: 'info' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-300"
                >
                  Reset List
                </button>
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-2">
              {bagItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleBagItem(item.id)}
                  className={`p-3.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                    item.checked 
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300' 
                      : 'border-white/[0.06] bg-[#0c0d10] text-zinc-300 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => {}} 
                      className="accent-[#E53558] h-4 w-4 rounded cursor-pointer" 
                    />
                    <span className={`text-xs ${item.checked ? 'line-through text-zinc-500 font-normal' : 'font-medium text-white'}`}>
                      {item.name}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    item.critical 
                      ? 'bg-red-500/10 border border-red-500/20 text-red-300' 
                      : 'bg-white/[0.06] border border-white/10 text-zinc-400'
                  }`}>
                    {item.critical ? 'CRITICAL BOOTH GEAR' : 'STANDARD'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center text-xs text-zinc-400 font-mono">
              <span>PACKING PROGRESS: <strong className="text-white">{bagItems.filter(i => i.checked).length} / {bagItems.length} PACKED</strong></span>
              <span className={uncheckedCount === 0 ? 'text-emerald-400 font-medium' : 'text-amber-400'}>
                {uncheckedCount === 0 ? '✓ READY FOR DEPARTURE' : `⚠️ ${uncheckedCount} ITEMS UNCHECKED`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUB-VIEW: FINANCE & HMRC TAX TRACKER                                    */}
      {/* ========================================================================= */}
      {currentMode === 'finance' && (
        <div className="space-y-6">
          
          {/* Top Finance Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-5 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] uppercase font-mono block">Total Confirmed Fees</span>
              <div className="text-2xl font-bold font-mono text-white">
                £{gigs.reduce((acc, g) => acc + g.fee, 0)}
              </div>
              <span className="text-zinc-500 text-[11px]">Season 2026 Residency</span>
            </div>

            <div className="p-5 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] uppercase font-mono block">{taxRate}% HMRC Tax Reserve</span>
              <div className="text-2xl font-bold font-mono text-amber-400">
                £{Math.round(gigs.reduce((acc, g) => acc + g.fee, 0) * (taxRate / 100))}
              </div>
              <span className="text-emerald-400 text-[11px]">Auto-allocated to Savings</span>
            </div>

            <div className="p-5 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
              <span className="text-zinc-400 text-[10px] uppercase font-mono block">Deposits Collected</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                £{gigs.filter(g => g.depositPaid).reduce((acc, g) => acc + Math.round(g.fee / 2), 0)}
              </div>
              <span className="text-zinc-500 text-[11px]">Bank Transfer Received</span>
            </div>
          </div>

          {/* Invoice Generator Card */}
          {selectedGig ? (
            <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="font-semibold text-lg text-white tracking-tight">
                    1-Click HMRC UK DJ Invoice Dispatcher
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Pre-populated UK HMRC-compliant invoice generator for {selectedGig.venue}
                  </p>
                </div>

                <button
                  onClick={() => downloadInvoice(selectedGig.id)}
                  className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Download size={13} />
                  <span>Download HMRC Invoice (.txt)</span>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] text-xs font-mono space-y-2">
                <div className="text-zinc-400">INVOICE TO: <strong className="text-white font-sans">{selectedGig.promoter} // {selectedGig.venue}</strong></div>
                <div className="text-zinc-400">PERFORMANCE FEE: <strong className="text-white">£{selectedGig.fee}.00</strong></div>
                <div className="text-zinc-400">ADVANCE DEPOSIT: <strong className="text-emerald-400">{selectedGig.depositPaid ? `-£${Math.round(selectedGig.fee / 2)}.00 (PAID)` : '£0.00 (PENDING)'}</strong></div>
                <div className="text-zinc-400">BALANCE DUE: <strong className="text-white font-bold">£{selectedGig.depositPaid ? Math.round(selectedGig.fee / 2) : selectedGig.fee}.00</strong></div>
                <div className="text-zinc-500 pt-2 border-t border-white/[0.06] text-[11px]">
                  UK Bank Sort Code: 04-00-04 • Account: 18080000 • Monzo Business UK • Terms: Net 14 Days
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#14151a] border border-white/[0.08] text-center space-y-2 shadow-sm">
              <div className="text-zinc-300 text-xs font-medium">No Confirmed Gigs for Invoicing</div>
              <p className="text-xs text-zinc-500">Add a booking above to generate automatic UK HMRC invoices.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
