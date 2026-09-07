'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Ticket,
  Download,
  X,
  Clock,
  Compass,
  ExternalLink,
  Radio,
  Search,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { playClick } from '@/lib/audioUtils';
import { downloadICalFile, EventICalData } from '@/lib/icsGenerator';
import { TourEvent, DEFAULT_TOUR_EVENTS } from '@/lib/tourEvents';

const SPRING_CONFIG = { type: 'spring' as const, stiffness: 300, damping: 20 };

// CDJ Symmetrical Accents defined in AGENTS.md
const DECK_COLORS = [
  { name: 'Deck 1 (Red)', color: 'rgba(211,15,49,1)', hex: '#D8163F', text: 'text-[#D8163F]', border: 'border-[#D8163F]', bg: 'bg-[#D8163F]' },
  { name: 'Deck 2 (Blue)', color: 'rgba(34,211,238,1)', hex: '#22D3EE', text: 'text-cyan-400', border: 'border-cyan-400', bg: 'bg-cyan-400' },
  { name: 'Deck 3 (Green)', color: 'rgba(16,185,129,1)', hex: '#10B981', text: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400' },
  { name: 'Deck 4 (Yellow)', color: 'rgba(234,179,8,1)', hex: '#EAB308', text: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-400' },
];

interface GigScheduleProps {
  isDepth?: boolean;
  initialEvents?: TourEvent[] | null;
  eventSource?: 'notion' | 'calendar' | 'verified' | string;
  eventCount?: number;
}

/**
 * Skeuomorphic VHS Barcode Strip Graphic
 */
function VhsBarcode({ serial, accentHex = '#D8163F' }: { serial: string; accentHex?: string }) {
  // Deterministic bar widths based on serial characters
  const barPattern = useMemo(() => {
    const weights: number[] = [];
    for (let i = 0; i < 28; i++) {
      const code = serial.charCodeAt(i % serial.length) || 65;
      weights.push((code % 4) + 1);
    }
    return weights;
  }, [serial]);

  return (
    <div className="flex flex-col items-center justify-center w-full select-none py-1">
      {/* Barcode Graphic */}
      <div className="flex items-end justify-between h-9 w-full px-2 gap-[1.5px] bg-black/60 py-1 border border-zinc-900 overflow-hidden">
        {barPattern.map((w, idx) => (
          <div
            key={idx}
            className="h-full shrink-0"
            style={{
              width: `${w}px`,
              backgroundColor: idx === 0 || idx === barPattern.length - 1 ? accentHex : idx % 7 === 0 ? accentHex : '#ffffff',
              opacity: idx % 2 === 0 ? 1 : 0.85,
            }}
          />
        ))}
      </div>
      {/* Human-readable serial numbers */}
      <span className="font-mono text-[8px] text-zinc-400 tracking-[0.2em] mt-1 uppercase font-bold text-center">
        * {serial} *
      </span>
    </div>
  );
}

export function GigSchedule({
  isDepth = false,
  initialEvents,
  eventSource = 'notion',
}: GigScheduleProps) {
  const [selectedTicketEvent, setSelectedTicketEvent] = useState<TourEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LONDON' | 'EUROPE' | 'CONFIRMED'>('ALL');
  const [copiedSerial, setCopiedSerial] = useState(false);

  // Use real events passed from Notion / GCal, or fallback to verified dates
  const eventsList: TourEvent[] = useMemo(() => {
    if (initialEvents && initialEvents.length > 0) {
      return initialEvents;
    }
    return DEFAULT_TOUR_EVENTS;
  }, [initialEvents]);

  // Filtered events based on tab and search
  const filteredEvents = useMemo(() => {
    return eventsList.filter((gig) => {
      // Search matching
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        gig.venue.toLowerCase().includes(query) ||
        gig.city.toLowerCase().includes(query) ||
        gig.country.toLowerCase().includes(query) ||
        gig.status.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      // Filter tab
      if (activeFilter === 'LONDON') {
        return gig.city.toUpperCase().includes('LONDON');
      }
      if (activeFilter === 'EUROPE') {
        return !gig.city.toUpperCase().includes('LONDON');
      }
      if (activeFilter === 'CONFIRMED') {
        const s = gig.status.toUpperCase();
        return s.includes('CONFIRMED') || s.includes('TICKETS') || s.includes('ON SALE');
      }
      return true;
    });
  }, [eventsList, searchQuery, activeFilter]);

  const handleDownloadCalendar = (gig: TourEvent) => {
    playClick(900, 'sine', 0.03);
    const icalData: EventICalData = {
      title: `HENRY IX Live @ ${gig.venue}`,
      description: `HENRY IX Live Performance at ${gig.venue}, ${gig.city}, ${gig.country}.\nDoors: ${gig.doorsTime} | Call: ${gig.callTime} | Set: ${gig.startTime} - ${gig.endTime}.\nStatus: ${gig.status}. Pass Serial: ${gig.ticketSerial}.\nTicket Link: ${gig.ticketLink}`,
      location: `${gig.venue}, ${gig.city}, ${gig.country}`,
      startDate: `${gig.isoDate.replace(/-/g, '')}T${gig.startTime.replace(':', '')}00Z`,
      endDate: `${gig.isoDate.replace(/-/g, '')}T${gig.endTime.replace(':', '')}00Z`,
      url: gig.ticketLink || 'https://henryix.com/events',
    };
    downloadICalFile(icalData);
  };

  const handleCopySerial = (serial: string) => {
    playClick(1000, 'sine', 0.03);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(serial);
      setCopiedSerial(true);
      setTimeout(() => setCopiedSerial(false), 2000);
    }
  };

  return (
    <motion.section
      id="schedule"
      className="w-full relative py-12 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto scroll-mt-24 font-mono select-none"
      onViewportEnter={() => {
        playClick(700, 'sine', 0.05);
      }}
    >
      {/* 1. SECTION TITLE & AUDIO HARDWARE SYNC HUD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ ...SPRING_CONFIG }}
        className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary animate-pulse border border-primary/50 shadow-neon-glow" />
          <h2 className="font-mono text-lg md:text-2xl tracking-[0.2em] font-black uppercase text-white">
            03 / Tour Schedule & Live Gigs
          </h2>
        </div>
        <div className={cn('h-[1px] flex-grow w-full md:w-auto md:ml-8', isDepth ? 'bg-zinc-900' : 'bg-zinc-800')} />
      </motion.div>

      {/* 2. SKEUOMORPHIC TOUR DISPATCH SYSTEM HEADER (ANALOG CONSOLE HUD) */}
      <div className="w-full bg-black border-2 border-zinc-900 p-4 md:p-5 mb-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-2xl relative overflow-hidden bayer-dither">
        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" />

        {/* Left: Dispatch telemetry */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black text-white tracking-widest uppercase block">
                WORLD TOUR DISPATCH SYSTEM
              </span>
              <span className="px-1.5 py-0.5 text-[8px] bg-primary/20 border border-primary text-primary font-bold tracking-wider">
                {eventSource === 'notion' ? 'NOTION STUDIO SYNC' : eventSource === 'calendar' ? 'GCAL SYNC' : 'VERIFIED DATES'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 tracking-wider font-tertiary">
              Confirmed gig telemetry synced live with Resident Advisor ticketing & CDJ USB rider specs.
            </span>
          </div>
        </div>

        {/* Center/Right: Filter controls & Search */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          {/* Search box */}
          <div className="relative flex items-center min-w-[180px] flex-grow lg:flex-grow-0">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH VENUE / CITY..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 text-[10px] pl-8 pr-2.5 py-1.5 focus:outline-none focus:border-primary font-mono tracking-wider uppercase placeholder:text-zinc-600"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 p-0.5">
            {(['ALL', 'LONDON', 'EUROPE', 'CONFIRMED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  playClick(800, 'sine', 0.02);
                  setActiveFilter(tab);
                }}
                className={cn(
                  'px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase transition-colors cursor-pointer',
                  activeFilter === tab
                    ? 'bg-primary text-black font-black shadow-neon-glow'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Shows Count badge */}
          <div className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>{filteredEvents.length} UPCOMING SHOWS</span>
          </div>
        </div>
      </div>

      {/* 3. SKEUOMORPHIC TICKET SLIPS LIST */}
      <div className="grid grid-cols-1 gap-6">
        {filteredEvents.map((gig, idx) => {
          const deck = DECK_COLORS[gig.deckAccentIndex % DECK_COLORS.length];

          return (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, ...SPRING_CONFIG }}
              className="relative w-full bg-black border border-zinc-800 hover:border-zinc-700 transition-all group overflow-hidden shadow-xl"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
              }}
            >
              {/* Subtle Bayer Dither Overlay */}
              <div className="absolute inset-0 bayer-dither pointer-events-none opacity-40 z-0" />

              {/* CDJ Deck Accent Strip on top border */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] z-10"
                style={{ backgroundColor: deck.hex }}
              />

              {/* PERFORATION NOTCHES & TEAR-OFF LINE (DESKTOP) */}
              {/* Top Scalloped Notch Cutout */}
              <div
                className="hidden md:block absolute -top-3.5 right-[242px] w-7 h-7 rounded-full bg-black border border-zinc-800 z-20 pointer-events-none"
                style={{ boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.8)' }}
              />
              {/* Bottom Scalloped Notch Cutout */}
              <div
                className="hidden md:block absolute -bottom-3.5 right-[242px] w-7 h-7 rounded-full bg-black border border-zinc-800 z-20 pointer-events-none"
                style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)' }}
              />
              {/* Vertical Dashed Perforation Line */}
              <div className="hidden md:block absolute top-0 bottom-0 right-[255px] w-[2px] border-r-2 border-dashed border-zinc-800 z-10 pointer-events-none" />

              {/* PERFORATION NOTCHES (MOBILE) */}
              <div className="md:hidden absolute -left-3.5 bottom-[220px] w-7 h-7 rounded-full bg-black border border-zinc-800 z-20 pointer-events-none" />
              <div className="md:hidden absolute -right-3.5 bottom-[220px] w-7 h-7 rounded-full bg-black border border-zinc-800 z-20 pointer-events-none" />
              <div className="md:hidden absolute left-0 right-0 bottom-[233px] h-[2px] border-b-2 border-dashed border-zinc-800 z-10 pointer-events-none" />

              {/* TICKET CONTAINER (Split between Main Body & Tear-off Stub) */}
              <div className="relative z-1 flex flex-col md:flex-row items-stretch justify-between">
                {/* ─── LEFT/CENTER: MAIN TICKET SLIP BODY ───────────────────────── */}
                <div className="flex-grow p-4 sm:p-6 md:pr-10 flex flex-col justify-between gap-4">
                  {/* Top Ribbon: Hardware Status LEDs & Serial Readout */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-900 text-[10px]">
                    <div className="flex items-center gap-2.5">
                      {/* Blinking Live Signal LED */}
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2.5 w-2.5">
                          <span
                            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                            style={{ backgroundColor: deck.hex }}
                          />
                          <span
                            className="relative inline-flex rounded-full h-2.5 w-2.5"
                            style={{ backgroundColor: deck.hex }}
                          />
                        </span>
                        <span className="font-mono text-[9px] font-black uppercase tracking-widest text-zinc-300">
                          SIGNAL // <span style={{ color: deck.hex }}>{gig.status}</span>
                        </span>
                      </div>

                      <span className="text-zinc-700 hidden sm:inline">|</span>

                      {/* CDJ Deck Indicator */}
                      <span className="hidden sm:inline-block px-2 py-0.5 bg-zinc-950 border border-zinc-800 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                        DECK 0{(gig.deckAccentIndex % 4) + 1} // DSP SYNC
                      </span>
                    </div>

                    {/* Serial Tag */}
                    <span className="font-mono text-[9px] text-zinc-500 font-bold tracking-widest uppercase">
                      TICKET SERIAL: {gig.ticketSerial}
                    </span>
                  </div>

                  {/* Mid Section: Date Box + Artist & Venue Details */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    {/* Retro Perforated Date Badge */}
                    <div className="flex flex-row sm:flex-col items-center justify-center bg-zinc-950 border border-zinc-800 p-3 min-w-[90px] text-center shrink-0 gap-2 sm:gap-0 shadow-inner">
                      <Calendar className="w-4 h-4 text-primary mb-1 shrink-0" />
                      <div className="flex flex-col items-center">
                        <span className="text-base sm:text-lg font-black text-white tracking-widest leading-none">
                          {gig.displayDay}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold tracking-wider uppercase">
                          {gig.displayMonth} {gig.displayYear}
                        </span>
                        <span className="text-[8px] text-zinc-500 font-bold tracking-widest uppercase mt-0.5">
                          {gig.dayOfWeek}
                        </span>
                      </div>
                    </div>

                    {/* Venue & Event Headliner */}
                    <div className="flex flex-col gap-1.5 flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">
                          HEADLINER LIVE PERFORMANCE
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-[9px] text-primary font-black tracking-widest uppercase">
                          OFFICIAL TOUR
                        </span>
                      </div>

                      {/* Avathe Artist Header */}
                      <h3 className="font-avathe text-xl sm:text-2xl md:text-3xl text-white tracking-wider uppercase group-hover:text-primary transition-colors leading-tight">
                        HENRY IX <span className="text-xs font-mono font-normal text-zinc-500 tracking-widest">LIVE</span>
                      </h3>

                      {/* Venue Name */}
                      <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm sm:text-base">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate uppercase font-mono tracking-wide">{gig.venue}</span>
                      </div>

                      {/* City & GPS Telemetry */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-400">
                        <span className="text-white font-bold tracking-wider uppercase">
                          {gig.city}, {gig.country}
                        </span>
                        <span className="text-zinc-700">|</span>
                        <span className="text-cyan-400 font-bold tracking-wider flex items-center gap-1">
                          <Compass className="w-3 h-3 text-cyan-400 shrink-0" />
                          GEO: {gig.lat.toFixed(4)}° N, {Math.abs(gig.lng).toFixed(4)}° {gig.lng < 0 ? 'W' : 'E'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Telemetry Strip: Set Time, Call Time, Doors */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-900/80 bg-zinc-950/60 p-2.5 border text-[9px] text-zinc-400">
                    <div>
                      <span className="text-zinc-600 block text-[8px] font-bold uppercase">PERFORMANCE SET</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                        {gig.startTime} — {gig.endTime}
                      </span>
                    </div>

                    <div>
                      <span className="text-zinc-600 block text-[8px] font-bold uppercase">CALL-TIME</span>
                      <span className="text-amber-400 font-bold">{gig.callTime}</span>
                    </div>

                    <div>
                      <span className="text-zinc-600 block text-[8px] font-bold uppercase">DOORS OPEN</span>
                      <span className="text-zinc-300 font-bold">{gig.doorsTime}</span>
                    </div>

                    <div>
                      <span className="text-zinc-600 block text-[8px] font-bold uppercase">ENTRY ACCESS</span>
                      <span className="text-cyan-400 font-bold">ALL AREAS / RA VIP</span>
                    </div>
                  </div>
                </div>

                {/* ─── RIGHT: RETRO TEAR-OFF STUB & VHS BARCODE ────────────────── */}
                <div className="w-full md:w-[255px] bg-zinc-950/80 p-4 sm:p-5 flex flex-col justify-between items-center gap-3 shrink-0 border-t md:border-t-0 border-zinc-900 relative">
                  {/* Perforation Hint */}
                  <div className="w-full flex items-center justify-between text-[8px] text-zinc-600 font-bold tracking-widest uppercase">
                    <span>TEAR STUB</span>
                    <span>PASS #{gig.ticketSerial.split('-')[1]}</span>
                  </div>

                  {/* VHS Barcode Graphic */}
                  <div className="w-full my-1">
                    <VhsBarcode serial={gig.ticketSerial} accentHex={deck.hex} />
                  </div>

                  {/* ASCII Dithered Holographic Security Seal */}
                  <div className="w-full text-center py-1 bg-black/40 border border-zinc-900/90 text-zinc-600 text-[8px] font-mono tracking-tighter select-none">
                    ░▒▓█ █▓▒░ [AUTHENTIC PASS] ░▒▓█
                  </div>

                  {/* Interactive Buttons */}
                  <div className="w-full flex flex-col gap-2 mt-1">
                    {/* Primary Button: Resident Advisor / Ticket Purchase Link */}
                    <a
                      href={gig.ticketLink || 'https://ra.co'}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => playClick(900, 'sine', 0.03)}
                      className="w-full py-2.5 px-3 bg-primary hover:bg-[#b01032] text-black font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-neon-glow hover:shadow-neon-strong active:scale-[0.98]"
                    >
                      <Ticket className="w-3.5 h-3.5 shrink-0" />
                      <span>RESIDENT ADVISOR / BUY</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>

                    {/* Secondary Action: Save Event to .ICS Calendar */}
                    <button
                      onClick={() => handleDownloadCalendar(gig)}
                      title="Save Event to Apple / Google Calendar (.ics)"
                      className="w-full py-1.5 px-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>+ CALENDAR (.ICS)</span>
                    </button>

                    {/* Tertiary Action: Expand Skeuomorphic Pass Modal */}
                    <button
                      onClick={() => {
                        playClick(800, 'sine', 0.02);
                        setSelectedTicketEvent(gig);
                      }}
                      className="w-full py-1 text-center font-mono text-[8px] text-zinc-500 hover:text-primary uppercase tracking-widest transition-colors cursor-pointer"
                    >
                      [INSPECT FULL TICKET STUB]
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredEvents.length === 0 && (
          <div className="w-full bg-black border border-zinc-800 p-8 text-center text-zinc-500">
            <span className="text-xs uppercase font-bold tracking-widest block mb-1">
              NO TOUR DATES MATCHING CRITERIA
            </span>
            <span className="text-[10px]">
              Try adjusting your search terms or filter selections to view upcoming gigs.
            </span>
          </div>
        )}
      </div>

      {/* 4. SKEUOMORPHIC VHS TICKET STUB FULL INSPECTION MODAL */}
      <AnimatePresence>
        {selectedTicketEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedTicketEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl bg-black border-2 border-primary p-6 md:p-8 relative font-mono text-zinc-300 shadow-2xl overflow-hidden bayer-dither"
              style={{ boxShadow: '0 0 35px rgba(216, 22, 63, 0.4)' }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedTicketEvent(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 cursor-pointer transition-colors"
                title="Close Pass"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Lanyard Punch Eyelet Graphic */}
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="w-6 h-6 rounded-full border-2 border-zinc-700 bg-zinc-950 flex items-center justify-center shadow-inner">
                  <div className="w-3 h-3 rounded-full bg-black border border-zinc-800" />
                </div>
                <span className="text-[8px] text-zinc-500 font-mono tracking-widest uppercase mt-1">
                  VIP CONCERT PASS // NOT FOR RESALE
                </span>
              </div>

              {/* Header Status Strip */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-black tracking-widest text-primary uppercase">
                    OFFICIAL ARTIST PASS // {selectedTicketEvent.ticketSerial}
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-950 border border-emerald-500 text-emerald-400 px-2 py-0.5 font-bold uppercase">
                  {selectedTicketEvent.status}
                </span>
              </div>

              {/* Pass Main Grid */}
              <div className="bg-zinc-950 border border-zinc-900 p-5 mb-5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                      HEADLINING ARTIST
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-white font-avathe tracking-wider">
                      HENRY IX
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest block">
                      PERFORMANCE DATE
                    </span>
                    <span className="text-sm md:text-base font-black text-amber-400">
                      {selectedTicketEvent.dateStr}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-zinc-900 pt-3">
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-bold">VENUE</span>
                    <span className="font-bold text-white text-xs">{selectedTicketEvent.venue}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-bold">CITY / COUNTRY</span>
                    <span className="font-bold text-white text-xs">
                      {selectedTicketEvent.city}, {selectedTicketEvent.country}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-bold">SET TIMETABLE</span>
                    <span className="font-bold text-emerald-400 text-xs">
                      {selectedTicketEvent.startTime} — {selectedTicketEvent.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-bold">ARTIST CALL TIME</span>
                    <span className="font-bold text-cyan-400 text-xs">{selectedTicketEvent.callTime}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-bold">GEOLOCATION</span>
                    <span className="font-bold text-zinc-300">
                      {selectedTicketEvent.lat.toFixed(4)}°N, {Math.abs(selectedTicketEvent.lng).toFixed(4)}°W
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[8px] font-bold">ACCESS TIER</span>
                    <span className="font-bold text-primary">STAGE / ALL AREAS VIP</span>
                  </div>
                </div>

                {/* Barcode & Hologram Section */}
                <div className="mt-2 pt-3 border-t border-zinc-900 flex flex-col items-center justify-center">
                  <VhsBarcode serial={selectedTicketEvent.ticketSerial} accentHex="#D8163F" />
                  <div className="font-mono text-[9px] text-zinc-600 tracking-tighter select-none font-bold mt-1">
                    ░▒▓█ █▓▒░ [DIGITALLY SIGNED AUDIO PASS] ░▒▓█ █▓▒░
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href={selectedTicketEvent.ticketLink || 'https://ra.co'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playClick(900, 'sine', 0.03)}
                  className="py-3 px-4 bg-primary hover:bg-[#b01032] text-black font-black text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-neon-glow"
                >
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>RESIDENT ADVISOR</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>

                <button
                  onClick={() => handleDownloadCalendar(selectedTicketEvent)}
                  className="py-3 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>SYNC CALENDAR (.ICS)</span>
                </button>

                <button
                  onClick={() => handleCopySerial(selectedTicketEvent.ticketSerial)}
                  className="py-3 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-[10px] uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {copiedSerial ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>SERIAL COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-zinc-400 shrink-0" />
                      <span>COPY PASS SERIAL</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export default GigSchedule;
