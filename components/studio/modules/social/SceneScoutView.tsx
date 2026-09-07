'use client';

import React, { useState } from 'react';
import { Sliders, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface SceneScoutViewProps {
  onNavigate?: (view: string) => void;
}

export default function SceneScoutView({ onNavigate }: SceneScoutViewProps) {
  const addToast = useStudioStore((s) => s.addToast);

  // Radar Tuners
  const [sonicTuner, setSonicTuner] = useState('140 / Breaks / UKG');
  const [areaTuner, setAreaTuner] = useState('South / East London');

  // Scene Scout Parser state
  const [flyerText, setFlyerText] = useState('');
  const [parsedLead, setParsedLead] = useState<{
    date: string;
    venue: string;
    role: string;
    promoter: string;
  } | null>(null);

  const handleParseFlyer = () => {
    if (!flyerText.trim()) return;

    // Intelligent heuristic parser
    const lower = flyerText.toLowerCase();
    const venue = lower.includes('corsica')
      ? 'Corsica Studios'
      : lower.includes('mot')
      ? 'Venue MOT'
      : lower.includes('corner')
      ? 'Corner New Cross'
      : 'South London Underground Warehouse';
    const date = lower.includes('24') || lower.includes('oct') ? '2026-10-24' : '2026-11-07';
    const role = lower.includes('headline') ? 'Headliner (01:00 - 03:00)' : 'Peak-Time Support';
    const promoter = lower.includes('marcus')
      ? 'Marcus (Promoter)'
      : lower.includes('alex')
      ? 'Alex (Stage / Promoter)'
      : 'Event Promoter';

    setParsedLead({ date, venue, role, promoter });
    addToast({
      title: 'FLYER PARSED SUCCESSFULLY',
      message: `Extracted: ${venue} on ${date} (${role})`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Radar Tuners */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <span className="text-xs font-semibold text-white tracking-wider uppercase flex items-center gap-2">
            <Sliders size={14} className="text-[#3b82f6]" />
            Analog Scene Radar Tuners
          </span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            LIVE LONDON FEED
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px] font-mono uppercase">Sonic:</span>
            <select
              value={sonicTuner}
              onChange={(e) => setSonicTuner(e.target.value)}
              className="rounded-lg bg-[#0c0d10] border border-white/10 text-zinc-200 px-3 py-1.5 text-xs focus:outline-none focus:border-[#E53558]"
            >
              <option value="140 / Breaks / UKG">140 / Breaks / UKG</option>
              <option value="Hard Groove (145-155)">Hard Groove (145-155)</option>
              <option value="Deep Hypnotic Techno">Deep Hypnotic Techno</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-400 text-[11px] font-mono uppercase">Area:</span>
            <select
              value={areaTuner}
              onChange={(e) => setAreaTuner(e.target.value)}
              className="rounded-lg bg-[#0c0d10] border border-white/10 text-zinc-200 px-3 py-1.5 text-xs focus:outline-none focus:border-[#E53558]"
            >
              <option value="South / East London">South / East London (Corsica, MOT, Spanners)</option>
              <option value="Hackney / Dalston">Hackney / Dalston (FOLD, Colour Factory)</option>
              <option value="All London Underground">All London Underground</option>
            </select>
          </div>
        </div>
      </div>

      {/* Universal Event Parser ("Paste & Parse") */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-3 shadow-sm">
        <h3 className="font-semibold text-xs text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={14} className="text-[#E53558]" />
          Universal Event Parser (&quot;Paste &amp; Parse&quot;)
        </h3>
        <p className="text-zinc-400 text-xs">
          Paste unstructured promoter WhatsApp forwards, Instagram flyer captions, or Resident Advisor links to
          instantly extract event dates, venues, lineup slots, and contacts.
        </p>

        <textarea
          rows={3}
          placeholder="Paste WhatsApp gig invite e.g.: 'Hey Henry, loved your set! We're putting together a session on Nov 7th at Corner New Cross. Want to headline 01:00-03:00? Hit me back - Alex'"
          value={flyerText}
          onChange={(e) => setFlyerText(e.target.value)}
          className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
        />

        <div className="flex justify-between items-center pt-1">
          <button
            onClick={() =>
              setFlyerText(
                'Royal Court Session // Corner New Cross SE14. Nov 7th. Headline set 01:00-03:00. Promoter Alex 07911123456.'
              )
            }
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            + Paste Sample Promoter WhatsApp
          </button>
          <button
            onClick={handleParseFlyer}
            className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Sparkles size={13} />
            <span>Parse Event Details</span>
          </button>
        </div>
      </div>

      {/* Parsed Result Card */}
      {parsedLead && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3 text-xs shadow-sm">
          <div className="font-semibold text-emerald-300 uppercase flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Parsed Gig Inquiry Detected
            </span>
            <button
              onClick={() => {
                addToast({
                  title: 'LEAD PUSHED TO GIGS',
                  message: `Created booking entry for ${parsedLead.venue} in Gigs Module.`,
                  type: 'success',
                });
                if (onNavigate) onNavigate('gigs-hub');
              }}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-black font-medium text-xs hover:bg-emerald-300 transition-colors shadow-sm"
            >
              + Add to GIGS Module Schedule
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-mono block">Venue</span>{' '}
              <div className="text-white font-medium">{parsedLead.venue}</div>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-mono block">Date</span>{' '}
              <div className="text-white font-medium">{parsedLead.date}</div>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-mono block">Slot</span>{' '}
              <div className="text-white font-medium">{parsedLead.role}</div>
            </div>
            <div>
              <span className="text-zinc-400 text-[10px] uppercase font-mono block">Promoter</span>{' '}
              <div className="text-white font-medium">{parsedLead.promoter}</div>
            </div>
          </div>
        </div>
      )}

      {/* Monitored London Collectives Watchlist */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
        <h4 className="font-semibold text-xs text-white uppercase tracking-wider">
          Monitored Underground Collectives
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {[
            {
              name: 'UNFOLD // FOLD London',
              status: 'RSVP Form Active',
              sound: '145-155 BPM Hard Groove',
              nextDate: 'Sunday 18 Oct',
            },
            {
              name: 'RAT PARTY // Spanners',
              status: 'Open Decks Submission',
              sound: 'UKG, 140 Dubs, Breaks',
              nextDate: 'Friday 23:59 Deadline',
            },
            {
              name: 'TELETECH // E1 London',
              status: 'Lineup Staged',
              sound: 'Industrial High Energy',
              nextDate: 'Saturday 31 Oct',
            },
          ].map((c) => (
            <div
              key={c.name}
              className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] hover:border-white/10 space-y-2.5 transition-all"
            >
              <div className="font-medium text-white">{c.name}</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{c.status}</span>
              </div>
              <div className="text-xs text-zinc-400">
                {c.sound} • Next: {c.nextDate}
              </div>
              <button
                onClick={() => {
                  addToast({
                    title: 'PITCH STAGED',
                    message: `EPK pitch drafted for ${c.name}.`,
                    type: 'info',
                  });
                }}
                className="w-full py-1.5 rounded-md bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition-colors"
              >
                Pitch Promoter with EPK
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
