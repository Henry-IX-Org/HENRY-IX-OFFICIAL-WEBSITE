'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Plus, X, RefreshCw } from 'lucide-react';
import { useStudioStore, StudioGig } from '@/store/studioStore';

interface GigsHubViewProps {
  gigs: StudioGig[];
  selectedGig: StudioGig | null;
  activeGigId: string;
  setActiveGigId: (id: string) => void;
  isLoadingGigs: boolean;
  fetchRealGigs: () => Promise<void>;
  isAddingGig: boolean;
  setIsAddingGig: (val: boolean) => void;
  onNavigate?: (view: string) => void;
}

export default function GigsHubView({
  gigs,
  selectedGig,
  activeGigId,
  setActiveGigId,
  isLoadingGigs,
  fetchRealGigs,
  isAddingGig,
  setIsAddingGig,
  onNavigate,
}: GigsHubViewProps) {
  const taxRate = useStudioStore((s) => s.settings.taxReserve);
  const addToast = useStudioStore((s) => s.addToast);

  // Form state for creating gig in Notion
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

  const handleCreateGig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gigTitle.trim()) {
      addToast({
        title: 'TITLE REQUIRED',
        message: 'Please enter a booking / event title.',
        type: 'error',
      });
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

  return (
    <div className="space-y-6">
      {/* Active Gig Selector Pills & Add Gig Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-mono text-[10px] uppercase">Active Gig:</span>
          {gigs.length > 0 ? (
            gigs.map((gig) => (
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

      {/* ADD GIG TO NOTION FORM */}
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
              <button
                onClick={() => setIsAddingGig(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06]"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <form onSubmit={handleCreateGig} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Event / Booking Title *
                </label>
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
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Venue &amp; City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Corsica Studios, London"
                  value={gigVenue}
                  onChange={(e) => setGigVenue(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Event Date
                </label>
                <input
                  type="date"
                  value={gigDate}
                  onChange={(e) => setGigDate(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Set Time Slot
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01:00 - 03:00"
                  value={gigSetTime}
                  onChange={(e) => setGigSetTime(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Performance Fee (£)
                </label>
                <input
                  type="number"
                  placeholder="450"
                  value={gigFee}
                  onChange={(e) => setGigFee(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Promoter / Client Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marcus"
                  value={gigPromoter}
                  onChange={(e) => setGigPromoter(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Promoter Email
                </label>
                <input
                  type="email"
                  placeholder="promoter@venue.co.uk"
                  value={gigEmail}
                  onChange={(e) => setGigEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 px-3.5 py-2 text-white focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558]"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                  Promoter Phone
                </label>
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
              <label className="block text-zinc-400 font-medium mb-1 uppercase text-[10px] font-mono">
                Technical Notes / Hospitality
              </label>
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
                      £{g.fee}{' '}
                      <span className="text-zinc-500 text-[10px] font-sans">
                        ({g.depositPaid ? 'Deposit Paid' : 'Pending'})
                      </span>
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
              Your live Notion Bookings database has 0 shows. Use the form above to add an upcoming London booking,
              residency, or club night.
            </p>
          </div>
        )}
      </div>

      {/* 5-Phase Master Event Command View */}
      {selectedGig && (
        <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-6 shadow-sm">
          <div className="flex flex-wrap justify-between items-start border-b border-white/[0.08] pb-4 gap-3">
            <div>
              <h3 className="font-semibold text-2xl text-white tracking-tight">{selectedGig.title}</h3>
              <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#E53558]" />
                <span>
                  {selectedGig.venue} • {selectedGig.address}
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium font-mono">
                ✓ {selectedGig.status}
              </span>
              <div className="text-[11px] text-zinc-500 mt-1 font-mono">
                Fee: £{selectedGig.fee} ({selectedGig.depositPaid ? 'Deposit Paid' : 'Pending'})
              </div>
            </div>
          </div>

          {/* The 5 Phases */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
              <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 1</div>
              <div className="font-semibold text-white">Planning & Contract</div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                Agreed: £{selectedGig.fee}
                <br />
                Promoter: {selectedGig.promoter}
                <br />
                <span className="text-emerald-400">Contract Signed</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
              <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 2</div>
              <div className="font-semibold text-white">Music Prep</div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                Linked Crate: <span className="text-[#06b6d4]">Live Master Library</span>
                <br />
                Key Range: 2A - 12A
                <br />
                Dubplates Staged
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
              <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 3</div>
              <div className="font-semibold text-white">Promo & Tickets</div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                Social Campaign: Active
                <br />
                RA Tickets: Active
                <br />
                Guestlist: {selectedGig.guestlistAllocated} Slots
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
              <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 4</div>
              <div className="font-semibold text-white">Logistics</div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                Departure: <strong className="text-emerald-400 font-mono">{selectedGig.departureTime}</strong>
                <br />
                Call-Time: {selectedGig.callTime}
                <br />
                Set: {selectedGig.setTime}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] space-y-2">
              <div className="text-zinc-500 font-medium uppercase text-[10px] font-mono">Phase 5</div>
              <div className="font-semibold text-white">Post-Event Wrap</div>
              <div className="text-xs text-zinc-400 leading-relaxed">
                Booth Audio: Ready
                <br />
                Tax Reserve: {taxRate}% (£{Math.round(selectedGig.fee * (taxRate / 100))})
                <br />
                Archived to Past
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
