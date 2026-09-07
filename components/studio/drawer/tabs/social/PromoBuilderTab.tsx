'use client';

import React from 'react';
import { Share2 } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function PromoBuilderTab() {
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const addInstagramPost = useStudioStore((s) => s.addInstagramPost);
  const addToast = useStudioStore((s) => s.addToast);

  const activeGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || {
    venue: 'London Venue',
    date: '2026-09-15',
  };

  const handleStagePromo = () => {
    const gigVenue = activeGig.venue;
    const posts: Array<{ title: string; type: 'Gig Flyer' | 'Video Clip' | 'Track Reveal' | 'Artwork'; caption: string }> = [
      {
        title: `${gigVenue.toUpperCase()} // OFFICIAL ANNOUNCEMENT`,
        type: 'Gig Flyer',
        caption: `London: returning to ${gigVenue} on ${activeGig.date}. Advanced tickets on sale now via link in bio. Full UKG & Speed Garage dub set.`,
      },
      {
        title: `${gigVenue.toUpperCase()} // DUBPLATE TEASER CLIP`,
        type: 'Video Clip',
        caption: `Road-testing new unreleased edits ahead of ${gigVenue}. Tag a friend who needs to be on this floor.`,
      },
      {
        title: `${gigVenue.toUpperCase()} // SET TIMES RUN SHEET`,
        type: 'Track Reveal',
        caption: `Timetable for tonight at ${gigVenue}: Doors 22:00 / Resident 23:00 / HENRY IX 01:00 / Close 04:00. Arrive early for smooth entry.`,
      },
      {
        title: `${gigVenue.toUpperCase()} // 4K RECAP HIGHLIGHTS`,
        type: 'Artwork',
        caption: `Absolute pandemonium at ${gigVenue}. Thank you London. Full recording and tracklist going live on henryix.com this week.`,
      },
    ];

    posts.forEach((p) => {
      addInstagramPost({
        title: p.title,
        date: activeGig.date,
        type: p.type,
        scheduled: true,
        image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
        caption: p.caption,
      });
    });

    addToast({
      title: 'PROMO CAMPAIGN STAGED',
      message: `4-post sequence generated and added to 3x3 Instagram grid for ${gigVenue}.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3.5">
        <div className="flex items-center gap-2 pb-1 border-b border-white/[0.06]">
          <Share2 size={14} className="text-[#E53558]" />
          <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
            1-Click Promo Campaign Pack
          </h4>
        </div>
        <p className="text-zinc-300 text-[11px] leading-relaxed">
          Confirming <strong className="text-zinc-100">{activeGig.venue}</strong> automatically generates and stages a 4-post sequence into the 3x3 Social Grid.
        </p>
        <div className="p-3.5 rounded-xl border border-white/[0.06] bg-black/40 space-y-2 text-[11px] text-zinc-300 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#E53558]">1.</span>
            <span>Announcement Flyer (T-14 Days)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#E53558]">2.</span>
            <span>Mix Snippet Teaser (T-7 Days)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#E53558]">3.</span>
            <span>Set Time Run-Sheet (Day of Show)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#E53558]">4.</span>
            <span>4K Recap Highlights (T+1 Day)</span>
          </div>
        </div>
        <button
          onClick={handleStagePromo}
          className="w-full py-2.5 rounded-xl bg-[#E53558] text-white font-semibold text-xs uppercase hover:bg-[#c92646] transition-colors flex items-center justify-center gap-2"
        >
          <Share2 size={13} />
          <span>Stage 4 Posts to Social Grid</span>
        </button>
      </div>
    </div>
  );
}
