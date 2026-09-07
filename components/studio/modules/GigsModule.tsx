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
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);

    // Accent line
    ctx.fillStyle = '#D8163F';
    ctx.fillRect(80, 160, 8, 80);

    // Title
    ctx.font = 'bold 54px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('HENRY IX // TOUR DAY SHEET', 120, 220);

    // Event & Venue
    ctx.font = 'bold 42px monospace';
    ctx.fillStyle = '#D8163F';
    ctx.fillText(selectedGig.title.toUpperCase(), 120, 320);

    ctx.font = '32px monospace';
    ctx.fillStyle = '#AAAAAA';
    ctx.fillText(`VENUE: ${selectedGig.venue}`, 120, 380);
    ctx.fillText(`ADDRESS: ${selectedGig.address}`, 120, 430);

    // Schedule Box
    ctx.fillStyle = '#111111';
    ctx.fillRect(100, 520, 880, 600);

    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('NIGHT SCHEDULE:', 140, 590);

    ctx.font = '30px monospace';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText(`• ${selectedGig.departureTime}  TfL Departure (30m buffer)`, 140, 670);
    ctx.fillText(`• ${selectedGig.callTime}  Arrival & Soundcheck`, 140, 750);
    ctx.fillText(`• 00:30  Doors Open`, 140, 830);
    ctx.fillText(`• ${selectedGig.setTime}  HENRY IX LIVE SET`, 140, 910);
    ctx.fillText(`• 03:00  Curfew & Load-Out`, 140, 990);

    // Contacts
    ctx.fillText(`PROMOTER: ${selectedGig.promoter} (${selectedGig.promoterPhone})`, 140, 1070);

    // Wi-Fi Box
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(100, 1160, 880, 180);
    ctx.font = 'bold 30px monospace';
    ctx.fillStyle = '#22d3ee';
    ctx.fillText(`GREEN ROOM WI-FI:`, 140, 1230);
    ctx.font = '28px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(selectedGig.wifi, 140, 1290);

    // Footer
    ctx.font = '24px monospace';
    ctx.fillStyle = '#666666';
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
    <div className="p-6 bg-black text-white font-mono space-y-6 select-none">
      
      {/* 1. HEADER & SUB-VIEW TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="font-avathe text-2xl text-white tracking-widest uppercase">
              MODULE 04 // GIGS &amp; TOUR LOGISTICS
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            LONDON TFL ROUTING • 1-PAGE DAY SHEETS • SMART DJ BAG • HMRC TAX &amp; INVOICING
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('gigs-hub') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'hub'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>📅 Master Hub</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-daysheet') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'daysheet'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>📄 1-Page Day Sheet</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-checklist') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'bag-checklist'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <CheckSquare size={13} />
            <span>🎒 Smart DJ Bag ({uncheckedCount})</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-finance') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'finance'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <DollarSign size={13} />
            <span>💰 Finance &amp; HMRC Tax</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('gigs-scanner') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'gigs-scanner'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <span>📱 Door QR Scanner</span>
          </button>

          <button
            onClick={() => fetchRealGigs()}
            disabled={isLoadingGigs}
            className="px-2.5 py-1.5 rounded-sm border border-zinc-800 bg-black text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1 text-xs"
            title="Refresh from Notion"
          >
            <RefreshCw size={12} className={isLoadingGigs ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. CALL-TIME ALERT BANNER (Only when active gigs exist) */}
      {selectedGig && uncheckedCount > 0 && (
        <div className="border border-amber-600 bg-amber-950/20 p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-400">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="animate-bounce flex-shrink-0" />
            <span>
              <strong>LOGISTICS WARNING:</strong> {selectedGig.venue} call-time approaching. {uncheckedCount} items remaining in Smart DJ Bag!
            </span>
          </div>
          <button 
            onClick={() => onNavigate ? onNavigate('gigs-checklist') : null}
            className="px-2.5 py-1 bg-amber-500 text-black font-bold hover:bg-amber-400 text-xs"
          >
            Review Smart Bag
          </button>
        </div>
      )}

      {/* Active Gig Pills & Add Gig Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-bold text-[10px]">ACTIVE GIG:</span>
          {gigs.length > 0 ? (
            gigs.map(gig => (
              <button
                key={gig.id}
                onClick={() => setActiveGigId(gig.id)}
                className={`px-3 py-1 text-xs rounded-sm border font-bold transition-colors ${
                  selectedGig?.id === gig.id 
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400' 
                    : 'border-zinc-900 bg-zinc-950 text-zinc-500 hover:text-white'
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
          className="px-3 py-1.5 bg-[#D8163F] text-black font-bold text-xs hover:bg-white flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(216,22,63,0.3)]"
        >
          {isAddingGig ? <X size={12} /> : <Plus size={12} />}
          <span>{isAddingGig ? 'Close Form' : '+ Add Gig to Notion'}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ADD GIG TO NOTION FORM (INLINE / MODAL)                                     */}
      {/* ========================================================================= */}
      {(isAddingGig || gigs.length === 0) && (
        <div className="border border-[#D8163F]/60 bg-zinc-950 p-6 space-y-4 shadow-[0_0_20px_rgba(216,22,63,0.15)]">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D8163F]" />
                [+ ADD GIG TO NOTION DATABASE]
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Writes directly to verified Notion Bookings &amp; Leads database (40826b67).
              </p>
            </div>
            {gigs.length > 0 && (
              <button onClick={() => setIsAddingGig(false)} className="text-zinc-500 hover:text-white p-1">
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleCreateGig} className="space-y-4 text-xs font-mono">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Event / Booking Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Knight Club Vol 4"
                  value={gigTitle}
                  onChange={(e) => setGigTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Venue &amp; City</label>
                <input
                  type="text"
                  placeholder="e.g. Corsica Studios, London"
                  value={gigVenue}
                  onChange={(e) => setGigVenue(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Event Date</label>
                <input
                  type="date"
                  value={gigDate}
                  onChange={(e) => setGigDate(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Set Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 01:00 - 03:00"
                  value={gigSetTime}
                  onChange={(e) => setGigSetTime(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Performance Fee (£)</label>
                <input
                  type="number"
                  placeholder="450"
                  value={gigFee}
                  onChange={(e) => setGigFee(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Promoter / Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus"
                  value={gigPromoter}
                  onChange={(e) => setGigPromoter(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Promoter Email</label>
                <input
                  type="email"
                  placeholder="promoter@venue.co.uk"
                  value={gigEmail}
                  onChange={(e) => setGigEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Promoter Phone</label>
                <input
                  type="tel"
                  placeholder="07911 123456"
                  value={gigPhone}
                  onChange={(e) => setGigPhone(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-bold mb-1 uppercase text-[10px]">Technical Notes / Hospitality</label>
              <textarea
                rows={2}
                placeholder="Equipment specs, monitor requests, rider requirements..."
                value={gigNotes}
                onChange={(e) => setGigNotes(e.target.value)}
                className="w-full bg-black border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-[#D8163F]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-900">
              {gigs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingGig(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#D8163F] text-black font-bold text-xs hover:bg-white flex items-center gap-2 shadow-[0_0_15px_rgba(216,22,63,0.4)] transition-all"
              >
                <Plus size={14} className={isSubmitting ? 'animate-spin' : ''} />
                <span>{isSubmitting ? 'Creating in Notion...' : '⚡ Save to Notion Bookings'}</span>
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
          <div className="border border-zinc-900 bg-zinc-950 p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                LONDON MASTER GIG SCHEDULE ({gigs.length} SHOWS)
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                {isLoadingGigs ? 'SYNCING NOTION...' : 'NOTION LIVE SYNCED'}
              </span>
            </div>

            {gigs.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-zinc-900 text-zinc-500 text-[10px]">
                      <th className="p-2.5">DATE</th>
                      <th className="p-2.5">EVENT / RESIDENCY</th>
                      <th className="p-2.5">VENUE</th>
                      <th className="p-2.5">SET TIME</th>
                      <th className="p-2.5">CALL TIME</th>
                      <th className="p-2.5">FEE / DEPOSIT</th>
                      <th className="p-2.5 text-right">TICKETS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {gigs.map((g) => (
                      <tr 
                        key={g.id}
                        onClick={() => setActiveGigId(g.id)}
                        className={`hover:bg-zinc-900/60 cursor-pointer ${
                          selectedGig?.id === g.id ? 'bg-[#D8163F]/10 border-l-2 border-[#D8163F]' : ''
                        }`}
                      >
                        <td className="p-2.5 text-zinc-400">{g.date}</td>
                        <td className="p-2.5 font-bold text-white">{g.title}</td>
                        <td className="p-2.5 text-zinc-300">{g.venue}</td>
                        <td className="p-2.5 text-emerald-400">{g.setTime}</td>
                        <td className="p-2.5 text-amber-400">{g.callTime}</td>
                        <td className="p-2.5 text-white">
                          £{g.fee} <span className="text-zinc-500 text-[10px]">({g.depositPaid ? 'Deposit Paid' : 'Pending'})</span>
                        </td>
                        <td className="p-2.5 text-right">
                          <a 
                            href={g.ticketLink} 
                            target="_blank" 
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#22d3ee] hover:underline text-[11px]"
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
              <div className="py-8 text-center space-y-2 border border-dashed border-zinc-800 bg-black">
                <Calendar size={28} className="mx-auto text-zinc-600" />
                <div className="text-xs text-zinc-400 font-bold">0 BOOKINGS CURRENTLY LOGGED IN NOTION</div>
                <p className="text-[11px] text-zinc-600 max-w-md mx-auto">
                  Your live Notion Bookings database has 0 shows. Use the form above to add an upcoming London booking, residency, or club night.
                </p>
              </div>
            )}
          </div>

          {/* 5-Phase Master Event Command View (When a gig is selected) */}
          {selectedGig && (
            <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-6">
              <div className="flex flex-wrap justify-between items-start border-b border-zinc-900 pb-4 gap-3">
                <div>
                  <h3 className="font-avathe text-3xl text-white uppercase">{selectedGig.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#D8163F]" />
                    <span>{selectedGig.venue} • {selectedGig.address}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-emerald-950/50 border border-emerald-500 text-emerald-400 text-xs font-bold uppercase">
                    ✓ {selectedGig.status}
                  </span>
                  <div className="text-[11px] text-zinc-500 mt-1">Fee: £{selectedGig.fee} ({selectedGig.depositPaid ? 'Deposit Paid' : 'Pending'})</div>
                </div>
              </div>

              {/* The 5 Phases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase text-[10px]">PHASE 1</div>
                  <div className="font-bold text-white">PLANNING &amp; CONTRACT</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Agreed: £{selectedGig.fee}<br />
                    Promoter: {selectedGig.promoter}<br />
                    <span className="text-emerald-400">Contract Signed</span>
                  </div>
                </div>

                <div className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase text-[10px]">PHASE 2</div>
                  <div className="font-bold text-white">MUSIC PREPARATION</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Linked Crate: <span className="text-[#22d3ee]">Live Master Library</span><br />
                    Key Range: 2A - 12A<br />
                    Dubplates Staged
                  </div>
                </div>

                <div className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase text-[10px]">PHASE 3</div>
                  <div className="font-bold text-white">PROMO &amp; TICKETS</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Social Campaign: Active<br />
                    RA Tickets: Active<br />
                    Guestlist: {selectedGig.guestlistAllocated} Slots
                  </div>
                </div>

                <div className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase text-[10px]">PHASE 4</div>
                  <div className="font-bold text-white">PERFORMANCE LOGISTICS</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
                    Departure: <strong className="text-emerald-400">{selectedGig.departureTime}</strong><br />
                    Call-Time: {selectedGig.callTime}<br />
                    Set: {selectedGig.setTime}
                  </div>
                </div>

                <div className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="text-zinc-500 font-bold uppercase text-[10px]">PHASE 5</div>
                  <div className="font-bold text-white">POST-EVENT WRAP</div>
                  <div className="text-[11px] text-zinc-400 leading-relaxed">
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
              <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 border border-zinc-900 p-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase">1-PAGE TOUR DAY SHEET // {selectedGig.venue.toUpperCase()}</h3>
                  <p className="text-[11px] text-zinc-500">Compact print &amp; mobile lockscreen view</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadDaySheet(selectedGig.id)}
                    className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={12} />
                    <span>Download Day Sheet (.txt)</span>
                  </button>

                  <button
                    onClick={handleSaveLockscreen}
                    className="px-3 py-1.5 bg-[#D8163F] text-black font-bold text-xs hover:bg-white flex items-center gap-1.5 transition-colors"
                  >
                    <Smartphone size={12} />
                    <span>Save Lockscreen Wallpaper</span>
                  </button>
                </div>
              </div>

              {/* Skeuomorphic Day Sheet Card */}
              <div className="border-2 border-zinc-800 bg-zinc-950 p-6 space-y-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D8163F]/5 blur-3xl pointer-events-none" />

                <div className="border-b border-zinc-900 pb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">HENRY IX TOUR OPERATIONS</span>
                    <h3 className="font-avathe text-3xl text-white mt-1">{selectedGig.title}</h3>
                    <div className="text-xs text-zinc-400 mt-1">{selectedGig.venue} • {selectedGig.address}</div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-[#D8163F] font-bold block">{selectedGig.date}</span>
                    <span className="text-zinc-500 text-[10px]">CURFEW: 03:00 AM</span>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-zinc-300 uppercase tracking-widest border-b border-zinc-900 pb-1">
                    EVENT TIMELINE &amp; RUN-SHEET
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-black border border-zinc-900 flex justify-between items-center">
                      <span className="font-bold text-white">DEPART HOME STUDIO</span>
                      <span className="font-mono text-emerald-400 font-bold">{selectedGig.departureTime} (30m Safety Buffer)</span>
                    </div>
                    <div className="p-2.5 bg-black border border-zinc-900 flex justify-between items-center">
                      <span className="text-zinc-400">TRANSIT ROUTE</span>
                      <span className="font-mono text-zinc-300">{selectedGig.transitRoute}</span>
                    </div>
                    <div className="p-2.5 bg-black border border-zinc-900 flex justify-between items-center">
                      <span className="text-zinc-400">CALL TIME / GREEN ROOM ARRIVAL</span>
                      <span className="font-mono text-amber-400 font-bold">{selectedGig.callTime}</span>
                    </div>
                    <div className="p-2.5 bg-black border border-[#D8163F]/40 flex justify-between items-center bg-[#D8163F]/5">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D8163F] animate-ping" />
                        HENRY IX PERFORMANCE
                      </span>
                      <span className="font-mono text-[#D8163F] font-bold">{selectedGig.setTime}</span>
                    </div>
                  </div>
                </div>

                {/* Access & Wi-Fi */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-black border border-zinc-900 space-y-1">
                    <span className="text-zinc-500 text-[10px] block">PROMOTER CONTACT</span>
                    <div className="text-white font-bold">{selectedGig.promoter}</div>
                    <div className="text-zinc-400 text-[11px]">{selectedGig.promoterPhone}</div>
                  </div>

                  <div className="p-3 bg-black border border-zinc-900 space-y-1">
                    <span className="text-zinc-500 text-[10px] block">BOOTH WI-FI</span>
                    <div className="text-[#22d3ee] font-bold truncate">{selectedGig.wifi}</div>
                    <div className="text-zinc-500 text-[10px]">Guestlist: {selectedGig.guestlistAllocated} Slots</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 border border-zinc-800 bg-zinc-950 text-center space-y-3">
              <FileText size={32} className="mx-auto text-zinc-600" />
              <h4 className="text-sm font-bold text-white uppercase">NO ACTIVE GIG SELECTED</h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                No gigs are currently logged in Notion. Add an upcoming gig in the Master Hub to generate custom 1-page day sheets and mobile lockscreens.
              </p>
              <button
                onClick={() => {
                  if (onNavigate) onNavigate('gigs-hub');
                  setIsAddingGig(true);
                }}
                className="px-4 py-2 bg-[#D8163F] text-black font-bold text-xs hover:bg-white transition-colors"
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
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase flex items-center gap-2">
                  <CheckSquare size={18} className="text-[#D8163F]" />
                  SMART DJ BAG // BOOTH HARDWARE CHECKLIST
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Critical gear inspection with automated departure warning 2 hours before London TfL call-time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    bagItems.forEach(i => { if (!i.checked) toggleBagItem(i.id); });
                    addToast({ title: 'ALL ITEMS CHECKED', message: 'Smart DJ Bag is 100% packed.', type: 'success' });
                  }}
                  className="px-3 py-1.5 bg-emerald-950 border border-emerald-600 text-emerald-400 text-xs font-bold hover:bg-emerald-600 hover:text-black transition-colors"
                >
                  Check All Items
                </button>

                <button
                  onClick={() => {
                    bagItems.forEach(i => { if (i.checked) toggleBagItem(i.id); });
                    addToast({ title: 'CHECKLIST RESET', message: 'Reset packing list for next gig.', type: 'info' });
                  }}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-xs text-zinc-300"
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
                  className={`p-3 border flex items-center justify-between cursor-pointer transition-colors ${
                    item.checked 
                      ? 'border-emerald-900/60 bg-emerald-950/20 text-emerald-300' 
                      : 'border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={() => {}} 
                      className="accent-[#D8163F] h-4 w-4 cursor-pointer" 
                    />
                    <span className={`text-xs ${item.checked ? 'line-through text-zinc-500 font-normal' : 'font-bold text-white'}`}>
                      {item.name}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${
                    item.critical 
                      ? 'bg-red-950/80 border border-red-800 text-red-400' 
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
                  }`}>
                    {item.critical ? 'CRITICAL BOOTH GEAR' : 'STANDARD'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-black border border-zinc-900 flex justify-between items-center text-xs text-zinc-400">
              <span>PACKING PROGRESS: <strong className="text-white">{bagItems.filter(i => i.checked).length} / {bagItems.length} PACKED</strong></span>
              <span className={uncheckedCount === 0 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
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
            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-1">
              <span className="text-zinc-500 text-[10px] block">TOTAL CONFIRMED FEES</span>
              <div className="text-2xl font-bold text-white">
                £{gigs.reduce((acc, g) => acc + g.fee, 0)}
              </div>
              <span className="text-zinc-500 text-[10px]">Season 2026 Residency</span>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-1">
              <span className="text-zinc-500 text-[10px] block">{taxRate}% HMRC TAX RESERVE</span>
              <div className="text-2xl font-bold text-amber-400">
                £{Math.round(gigs.reduce((acc, g) => acc + g.fee, 0) * (taxRate / 100))}
              </div>
              <span className="text-emerald-400 text-[10px]">Auto-allocated to Savings</span>
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-1">
              <span className="text-zinc-500 text-[10px] block">DEPOSITS COLLECTED</span>
              <div className="text-2xl font-bold text-emerald-400">
                £{gigs.filter(g => g.depositPaid).reduce((acc, g) => acc + Math.round(g.fee / 2), 0)}
              </div>
              <span className="text-zinc-500 text-[10px]">Bank Transfer Received</span>
            </div>
          </div>

          {/* Invoice Generator Card */}
          {selectedGig ? (
            <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                <div>
                  <h3 className="font-avathe text-xl text-white tracking-widest uppercase">
                    1-CLICK HMRC UK DJ INVOICE DISPATCHER
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Pre-populated UK HMRC-compliant invoice generator for {selectedGig.venue}
                  </p>
                </div>

                <button
                  onClick={() => downloadInvoice(selectedGig.id)}
                  className="px-4 py-2 bg-[#D8163F] text-black font-bold text-xs hover:bg-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(216,22,63,0.4)] transition-colors"
                >
                  <Download size={13} />
                  <span>DOWNLOAD HMRC INVOICE (.TXT)</span>
                </button>
              </div>

              <div className="p-4 bg-black border border-zinc-800 text-xs font-mono space-y-2">
                <div className="text-zinc-400">INVOICE TO: <strong className="text-white">{selectedGig.promoter} // {selectedGig.venue}</strong></div>
                <div className="text-zinc-400">PERFORMANCE FEE: <strong className="text-white">£{selectedGig.fee}.00</strong></div>
                <div className="text-zinc-400">ADVANCE DEPOSIT: <strong className="text-emerald-400">{selectedGig.depositPaid ? `-£${Math.round(selectedGig.fee / 2)}.00 (PAID)` : '£0.00 (PENDING)'}</strong></div>
                <div className="text-zinc-400">BALANCE DUE: <strong className="text-white font-bold">£{selectedGig.depositPaid ? Math.round(selectedGig.fee / 2) : selectedGig.fee}.00</strong></div>
                <div className="text-zinc-500 pt-2 border-t border-zinc-900">
                  UK Bank Sort Code: 04-00-04 • Account: 18080000 • Monzo Business UK • Terms: Net 14 Days
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-zinc-950 border border-zinc-800 text-center space-y-2">
              <div className="text-zinc-400 text-xs font-bold">NO CONFIRMED GIGS FOR INVOICING</div>
              <p className="text-[11px] text-zinc-500">Add a booking above to generate automatic UK HMRC invoices.</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
