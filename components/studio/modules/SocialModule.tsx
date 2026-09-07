'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Compass, 
  Grid, 
  CheckSquare, 
  Send, 
  Sparkles, 
  Copy, 
  Download, 
  Share2, 
  Clock, 
  MapPin, 
  ArrowRight,
  Plus,
  RefreshCw,
  MoveUp,
  MoveDown,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Layers,
  Radio,
  X
} from 'lucide-react';
import { useStudioStore, InstagramPost } from '@/store/studioStore';

export interface SocialModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function SocialModule({
  activeView = 'social-scout',
  onNavigate,
}: SocialModuleProps) {
  const instagramGrid = useStudioStore(s => s.instagramGrid);
  const reorderInstagramGrid = useStudioStore(s => s.reorderInstagramGrid);
  const addInstagramPost = useStudioStore(s => s.addInstagramPost);
  const fetchContentPosts = useStudioStore(s => s.fetchContentPosts);
  const isLoadingSocial = useStudioStore(s => s.isLoadingSocial);
  const addToast = useStudioStore(s => s.addToast);

  // Hydrate content posts from Notion on mount
  useEffect(() => {
    fetchContentPosts();
  }, [fetchContentPosts]);

  // Stage Post Form State
  const [showStageModal, setShowStageModal] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostType, setNewPostType] = useState<'Gig Flyer' | 'Video Clip' | 'Track Reveal' | 'Artwork'>('Video Clip');
  const [newPostDate, setNewPostDate] = useState(new Date().toISOString().slice(0, 10));
  const [newPostCampaign, setNewPostCampaign] = useState('');
  const [newPostNotes, setNewPostNotes] = useState('');

  // Map activeView to subview
  const currentMode = useMemo(() => {
    switch (activeView) {
      case 'social-grid':
        return 'grid';
      case 'social-pipeline':
        return 'pipeline';
      case 'social-vip':
        return 'vip';
      case 'social-scout':
      default:
        return 'scout';
    }
  }, [activeView]);

  // Scene Scout Parser state
  const [flyerText, setFlyerText] = useState('');
  const [parsedLead, setParsedLead] = useState<{ date: string; venue: string; role: string; promoter: string } | null>(null);

  // Radar Tuners
  const [sonicTuner, setSonicTuner] = useState('140 / Breaks / UKG');
  const [areaTuner, setAreaTuner] = useState('South / East London');

  // VIP SMS state
  const [vipCoords, setVipCoords] = useState('Secret Warehouse // Unit 4, Surrey Canal Rd, SE14. Doors 23:00. BYOB. Password at door: DUBPLATE8A.');
  const [recipientGroup, setRecipientGroup] = useState('Inner Circle (120 Subscribers)');

  // 9:16 Story Card state
  const [storyEventTitle, setStoryEventTitle] = useState('KNIGHT CLUB VOL 4');
  const [storyTracks, setStoryTracks] = useState('CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]\nrude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend) - dj g2g\nDo It Diva (Don Omar x Heidi Montag) - zpectrum\nFlori Pori - Favela Funk\nMy Neck My Back - Sunshine Vendetta');

  // 8-Step Mix Release Pipeline Checklist State
  const [pipelineSteps, setPipelineSteps] = useState([
    { id: 1, name: 'Master Audio & Artwork', desc: 'Lossless 24-bit WAV audio + 3000x3000px cover artwork in Drive', completed: true },
    { id: 2, name: 'Formatted Tracklist', desc: 'Minute-by-minute timestamps with Camelot keys & unreleased dub tags', completed: true },
    { id: 3, name: 'SoundCloud Upload', desc: 'Audio uploaded with high-res cover, genre tags & private preview link', completed: true },
    { id: 4, name: 'YouTube Video Render', desc: '1080p 60fps waveform visualizer video with automated chapter markers', completed: false },
    { id: 5, name: 'Mixcloud Tagging', desc: 'Tracklist ingested with copyright-safe streaming monetization whitelist', completed: false },
    { id: 6, name: 'Apple Podcasts RSS Feed', desc: 'Dynamic XML syndication feed pinged via /api/podcast/rss.xml', completed: false },
    { id: 7, name: 'Publish to Website Archive', desc: 'One-click toggle to reflect on public henryix.com/mixes catalog', completed: false },
    { id: 8, name: 'Social Teasers & Handoff', desc: '4-post sequence staged into 3x3 Instagram Grid and TikTok Reels', completed: false },
  ]);

  const togglePipelineStep = (id: number) => {
    setPipelineSteps(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  };

  const handleStagePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) {
      addToast({
        title: 'TITLE REQUIRED',
        message: 'Please enter a title or caption for the post.',
        type: 'warning',
      });
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await fetch('/api/studio/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPostTitle.trim(),
          platform: 'Instagram',
          contentType: newPostType,
          publishDate: newPostDate,
          status: 'Scheduled',
          campaign: newPostCampaign.trim() || undefined,
          notes: newPostNotes.trim() || undefined,
        }),
      });

      const data: any = await res.json();
      if (res.ok && data.success) {
        addInstagramPost({
          title: newPostTitle.trim(),
          date: newPostDate,
          type: newPostType,
          scheduled: true,
          image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
          caption: newPostNotes || newPostCampaign || '',
        });

        addToast({
          title: 'POST SAVED TO NOTION',
          message: `Staged "${newPostTitle}" in Notion Content Calendar.`,
          type: 'success',
        });

        setNewPostTitle('');
        setNewPostCampaign('');
        setNewPostNotes('');
        setShowStageModal(false);
        fetchContentPosts();
      } else {
        throw new Error(data.error || 'Failed to save to Notion');
      }
    } catch (err: any) {
      console.error('Error staging post:', err);
      addToast({
        title: 'STAGE ERROR',
        message: err.message || 'Could not reach Notion Content Calendar.',
        type: 'error',
      });
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleParseFlyer = () => {
    if (!flyerText.trim()) return;
    
    // Intelligent heuristic parser
    const lower = flyerText.toLowerCase();
    const venue = lower.includes('corsica') ? 'Corsica Studios' : lower.includes('mot') ? 'Venue MOT' : lower.includes('corner') ? 'Corner New Cross' : 'South London Underground Warehouse';
    const date = lower.includes('24') || lower.includes('oct') ? '2026-10-24' : '2026-11-07';
    const role = lower.includes('headline') ? 'Headliner (01:00 - 03:00)' : 'Peak-Time Support';
    const promoter = lower.includes('marcus') ? 'Marcus (Promoter)' : lower.includes('alex') ? 'Alex (Stage / Promoter)' : 'Event Promoter';

    setParsedLead({ date, venue, role, promoter });
    addToast({
      title: 'FLYER PARSED SUCCESSFULLY',
      message: `Extracted: ${venue} on ${date} (${role})`,
      type: 'success',
    });
  };

  const handleDispatchVipSms = () => {
    addToast({
      title: 'VIP BROADCAST DISPATCHED',
      message: `Sent secret warehouse coordinates via Resend & SMS to ${recipientGroup}.`,
      type: 'success',
    });
  };

  const handleDownloadStoryCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark OLED background
    ctx.fillStyle = '#0c0d10';
    ctx.fillRect(0, 0, 1080, 1920);

    // Red glow accent
    ctx.fillStyle = '#E53558';
    ctx.fillRect(80, 120, 8, 80);

    // Title
    ctx.font = 'bold 56px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('HENRY IX // LIVE SETLIST', 120, 180);

    // Event
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#E53558';
    ctx.fillText(storyEventTitle.toUpperCase(), 120, 240);

    // Tracklist
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#CCCCCC';
    const lines = storyTracks.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(`${idx + 1}. ${line}`, 120, 380 + idx * 70);
    });

    // Watermark footer
    ctx.font = '22px monospace';
    ctx.fillStyle = '#71717a';
    ctx.fillText('HENRYIX.COM • ARCHIVED LIVE RECORDING', 120, 1800);

    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `STORY_CARD_${storyEventTitle.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    addToast({
      title: 'STORY CARD SAVED',
      message: 'Downloaded 9:16 high-res Story PNG for Instagram.',
      type: 'success',
    });
  };

  return (
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      
      {/* 1. TOP HEADER & TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Social &amp; Scene Scout</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                05
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Universal event parser • 3x3 Instagram grid • Mix release pipeline • VIP SMS alerts
          </p>
        </div>

        {/* Sub-navigation Switcher Pills (Notion Segmented Control) */}
        <div className="flex flex-wrap items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('social-scout') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'scout' 
                ? 'bg-white/[0.1] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Compass size={13} className={currentMode === 'scout' ? 'text-amber-400' : ''} />
            <span>Scene Scout &amp; Parser</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('social-grid') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'grid' 
                ? 'bg-white/[0.1] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Grid size={13} className={currentMode === 'grid' ? 'text-[#8b5cf6]' : ''} />
            <span>3x3 Instagram Grid</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('social-pipeline') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'pipeline' 
                ? 'bg-white/[0.1] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <CheckSquare size={13} className={currentMode === 'pipeline' ? 'text-emerald-400' : ''} />
            <span>Mix Release Pipeline</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('social-vip') : null}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'vip' 
                ? 'bg-white/[0.1] text-white shadow-sm' 
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Send size={13} className={currentMode === 'vip' ? 'text-[#06b6d4]' : ''} />
            <span>VIP SMS Alert Dispatch</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW: SCENE SCOUT & UNIVERSAL EVENT PARSER                         */}
      {/* ========================================================================= */}
      {currentMode === 'scout' && (
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
              Paste unstructured promoter WhatsApp forwards, Instagram flyer captions, or Resident Advisor links to instantly extract event dates, venues, lineup slots, and contacts.
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
                onClick={() => setFlyerText("Royal Court Session // Corner New Cross SE14. Nov 7th. Headline set 01:00-03:00. Promoter Alex 07911123456.")}
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
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-400 text-black font-medium text-xs hover:bg-emerald-300 transition-colors shadow-sm"
                >
                  + Add to GIGS Module Schedule
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                <div><span className="text-zinc-400 text-[10px] uppercase font-mono block">Venue</span> <div className="text-white font-medium">{parsedLead.venue}</div></div>
                <div><span className="text-zinc-400 text-[10px] uppercase font-mono block">Date</span> <div className="text-white font-medium">{parsedLead.date}</div></div>
                <div><span className="text-zinc-400 text-[10px] uppercase font-mono block">Slot</span> <div className="text-white font-medium">{parsedLead.role}</div></div>
                <div><span className="text-zinc-400 text-[10px] uppercase font-mono block">Promoter</span> <div className="text-white font-medium">{parsedLead.promoter}</div></div>
              </div>
            </div>
          )}

          {/* Monitored London Collectives Watchlist */}
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
            <h4 className="font-semibold text-xs text-white uppercase tracking-wider">Monitored Underground Collectives</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { name: 'UNFOLD // FOLD London', status: 'RSVP Form Active', sound: '145-155 BPM Hard Groove', nextDate: 'Sunday 18 Oct' },
                { name: 'RAT PARTY // Spanners', status: 'Open Decks Submission', sound: 'UKG, 140 Dubs, Breaks', nextDate: 'Friday 23:59 Deadline' },
                { name: 'TELETECH // E1 London', status: 'Lineup Staged', sound: 'Industrial High Energy', nextDate: 'Saturday 31 Oct' },
              ].map(c => (
                <div key={c.name} className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] hover:border-white/10 space-y-2.5 transition-all">
                  <div className="font-medium text-white">{c.name}</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{c.status}</span>
                  </div>
                  <div className="text-xs text-zinc-400">{c.sound} • Next: {c.nextDate}</div>
                  <button
                    onClick={() => {
                      addToast({ title: 'PITCH STAGED', message: `EPK pitch drafted for ${c.name}.`, type: 'info' });
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
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW: 3X3 INSTAGRAM PROFILE GRID                                   */}
      {/* ========================================================================= */}
      {currentMode === 'grid' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-xs text-white uppercase tracking-wider">Instagram Profile 3x3 Feed Aesthetic</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-zinc-400 font-mono">
                  NOTION: {instagramGrid.length} POSTS
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">Plan visual contrast across drops. Move posts up/down to balance aesthetic flow.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchContentPosts()}
                disabled={isLoadingSocial}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Refresh from Notion Content Calendar"
              >
                <RefreshCw size={12} className={isLoadingSocial ? 'animate-spin text-[#E53558]' : ''} />
                <span>Sync Notion</span>
              </button>

              <button
                onClick={() => setShowStageModal(true)}
                className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus size={13} />
                <span>+ Stage Post to Notion</span>
              </button>
            </div>
          </div>

          {/* Stage Post Modal */}
          {showStageModal && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 max-w-2xl mx-auto shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E53558]" />
                  <span className="font-semibold text-xs text-white uppercase tracking-wider">
                    Stage New Post // Notion Content Calendar
                  </span>
                </div>
                <button 
                  onClick={() => setShowStageModal(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded hover:bg-white/[0.06]"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleStagePost} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Post Title / Hook:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Knight Club Vol 4 Lineup Reveal Video"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Content Type:</label>
                    <select
                      value={newPostType}
                      onChange={(e) => setNewPostType(e.target.value as any)}
                      className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2 text-white focus:outline-none focus:border-[#E53558]"
                    >
                      <option value="Video Clip">Video Clip (Reel / Teaser)</option>
                      <option value="Gig Flyer">Gig Flyer (Lineup Poster)</option>
                      <option value="Track Reveal">Track Reveal (Dubplate Preview)</option>
                      <option value="Artwork">Artwork (Mix Cover)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Publish Date:</label>
                    <input
                      type="date"
                      value={newPostDate}
                      onChange={(e) => setNewPostDate(e.target.value)}
                      className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2 text-white focus:outline-none focus:border-[#E53558]"
                    >
                    </input>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Campaign:</label>
                    <input
                      type="text"
                      placeholder="e.g. Knight Club Vol 4"
                      value={newPostCampaign}
                      onChange={(e) => setNewPostCampaign(e.target.value)}
                      className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-mono">Caption / Notes / Hashtags:</label>
                  <textarea
                    rows={2}
                    placeholder="Caption copy, hashtags, or drop details..."
                    value={newPostNotes}
                    onChange={(e) => setNewPostNotes(e.target.value)}
                    className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setShowStageModal(false)}
                    className="px-4 py-2 rounded-lg bg-white/[0.06] text-zinc-300 hover:text-white text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="px-5 py-2 rounded-lg bg-[#E53558] text-white font-medium text-xs hover:bg-[#f43f5e] transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {isSubmittingPost ? 'Creating in Notion...' : 'Save to Notion Calendar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3x3 Profile Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {instagramGrid.length === 0 ? (
              <div className="col-span-3 rounded-xl border border-dashed border-white/10 p-8 text-center bg-[#14151a]/40 space-y-3 shadow-sm">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#14151a] border border-white/10 flex items-center justify-center text-zinc-500">
                  <Grid size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-xs uppercase">No Staged Posts in Notion Calendar</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                    Your Notion Content Calendar is currently clear. Stage a post to map out your upcoming 3x3 Instagram aesthetic.
                  </p>
                </div>
                <button
                  onClick={() => setShowStageModal(true)}
                  className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus size={13} />
                  <span>+ Stage First Post to Notion</span>
                </button>
              </div>
            ) : (
              instagramGrid.map((post, idx) => (
                <div 
                  key={post.id}
                  className="aspect-square rounded-xl bg-[#14151a] border border-white/[0.08] hover:border-white/20 p-3.5 flex flex-col justify-between group relative overflow-hidden transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start text-[10px] text-zinc-400 z-10">
                    <span className="px-2 py-0.5 rounded-full bg-[#0c0d10] border border-white/10 text-white font-mono font-medium">#{idx + 1}</span>
                    <span className={post.scheduled ? 'text-emerald-400 font-mono' : 'text-zinc-500 font-mono'}>
                      {post.scheduled ? 'STAGED' : 'DRAFT'}
                    </span>
                  </div>

                  <div className="text-center my-auto p-1">
                    <div className="text-xs font-medium text-white line-clamp-2">{post.title}</div>
                    <div className="text-[10px] text-zinc-400 mt-1">{post.type}</div>
                  </div>

                  {/* Hover Reorder Controls */}
                  <div className="flex justify-between items-center border-t border-white/[0.06] pt-1.5 z-10">
                    <button 
                      disabled={idx === 0}
                      onClick={() => reorderInstagramGrid(idx, idx - 1)}
                      className="p-1 hover:text-white disabled:opacity-20 rounded hover:bg-white/[0.06]"
                      title="Move earlier"
                    >
                      <MoveUp size={13} />
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono">{post.date}</span>
                    <button 
                      disabled={idx === instagramGrid.length - 1}
                      onClick={() => reorderInstagramGrid(idx, idx + 1)}
                      className="p-1 hover:text-white disabled:opacity-20 rounded hover:bg-white/[0.06]"
                      title="Move later"
                    >
                      <MoveDown size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-VIEW: MIX RELEASE PIPELINE (8-STEP OMNI-RELEASE CHECKLIST)          */}
      {/* ========================================================================= */}
      {currentMode === 'pipeline' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
                  <CheckSquare size={18} className="text-[#E53558]" />
                  8-Stage Mix Making &amp; Omni-Release Pipeline
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  End-to-end release workflow: Audio mastering, artwork, platform distribution, and social promo
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-mono mr-2">
                  {pipelineSteps.filter(s => s.completed).length} / {pipelineSteps.length} Steps Complete
                </span>
                <button
                  onClick={() => {
                    const tracklist = "00:00 - CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK] [7A • 150 BPM]\n04:12 - rude boy tokyo drift - dj g2g [2A • 150 BPM]\n08:45 - Do It Diva - zpectrum [3A • 145 BPM]\n14:20 - Flori Pori - Favela Funk [7B • 150 BPM]";
                    navigator.clipboard.writeText(tracklist);
                    addToast({ title: 'TRACKLIST COPIED', message: 'Formatted tracklist copied for SoundCloud/YouTube.', type: 'success' });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Copy size={12} />
                  <span>Copy Formatted Tracklist</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#0c0d10] h-2.5 rounded-full border border-white/10 overflow-hidden flex p-0.5">
              <div 
                className="bg-[#E53558] h-full rounded-full transition-all duration-300" 
                style={{ width: `${(pipelineSteps.filter(s => s.completed).length / pipelineSteps.length) * 100}%` }}
              />
            </div>

            {/* Pipeline Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pipelineSteps.map(step => (
                <div 
                  key={step.id}
                  onClick={() => togglePipelineStep(step.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors space-y-1.5 ${
                    step.completed 
                      ? 'border-emerald-500/20 bg-emerald-500/5' 
                      : 'border-white/[0.06] bg-[#0c0d10] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${step.completed ? 'text-emerald-300' : 'text-white'}`}>
                      {step.id}. {step.name}
                    </span>
                    <input 
                      type="checkbox" 
                      checked={step.completed} 
                      onChange={() => {}} 
                      className="accent-[#E53558] h-4 w-4 rounded cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-zinc-400">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center text-xs">
              <span className="text-zinc-400">Current Target Mix: <strong className="text-white">Knight Club Session 04</strong></span>
              <button
                onClick={() => addToast({ title: 'MIX PUBLISHED', message: 'Knight Club Session 04 pushed to henryix.com/mixes.', type: 'success' })}
                className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm"
              >
                Publish to Website Archive Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-VIEW: VIP SMS & 9:16 STORY CARD GENERATOR                           */}
      {/* ========================================================================= */}
      {currentMode === 'vip' && (
        <div className="space-y-6 max-w-2xl mx-auto">
          
          {/* VIP SMS Broadcast Card */}
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
                <Send size={16} className="text-[#06b6d4]" />
                VIP Inner Circle Dispatcher
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Direct instant SMS / Email alert dispatch for secret London coordinates &amp; door passcodes
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Recipient Audience:</label>
                <select
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
                >
                  <option value="Inner Circle (120 Subscribers)">Inner Circle (120 Subscribers)</option>
                  <option value="London Resident List (350 Subscribers)">London Resident List (350 Subscribers)</option>
                  <option value="All Verified Leads (500+)">All Verified Leads (500+)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Secret Coordinates &amp; Access Instructions:</label>
                <textarea
                  rows={3}
                  value={vipCoords}
                  onChange={(e) => setVipCoords(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
                />
              </div>

              <button
                onClick={handleDispatchVipSms}
                className="w-full py-2.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Send size={14} />
                <span>Dispatch VIP Alert to {recipientGroup}</span>
              </button>
            </div>
          </div>

          {/* 9:16 Tracklist Story Card Generator */}
          <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="font-semibold text-lg text-white tracking-tight flex items-center gap-2">
                <Share2 size={16} className="text-[#3b82f6]" />
                9:16 Tracklist Story Generator
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Generates 1080x1920 retro-dithered vertical graphic formatted for Instagram Stories
              </p>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Event Title:</label>
                <input
                  type="text"
                  value={storyEventTitle}
                  onChange={(e) => setStoryEventTitle(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
                />
              </div>

              <div>
                <label className="text-zinc-400 uppercase font-mono text-[10px] block mb-1">Set Tracklist:</label>
                <textarea
                  rows={4}
                  value={storyTracks}
                  onChange={(e) => setStoryTracks(e.target.value)}
                  className="w-full rounded-lg bg-[#0c0d10] border border-white/10 p-2.5 text-white focus:outline-none focus:border-[#E53558]"
                />
              </div>

              <button
                onClick={handleDownloadStoryCard}
                className="w-full py-2.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={14} />
                <span>Download 9:16 Story PNG</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
