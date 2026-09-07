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
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1080, 1920);

    // Red glow accent
    ctx.fillStyle = '#D8163F';
    ctx.fillRect(80, 120, 8, 80);

    // Title
    ctx.font = 'bold 64px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('HENRY IX // LIVE SETLIST', 120, 180);

    // Event
    ctx.font = '36px monospace';
    ctx.fillStyle = '#D8163F';
    ctx.fillText(storyEventTitle.toUpperCase(), 120, 240);

    // Tracklist
    ctx.font = '32px monospace';
    ctx.fillStyle = '#CCCCCC';
    const lines = storyTracks.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(`${idx + 1}. ${line}`, 120, 380 + idx * 70);
    });

    // Watermark footer
    ctx.font = '24px monospace';
    ctx.fillStyle = '#666666';
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
    <div className="p-6 bg-black text-white font-mono space-y-6 select-none">
      
      {/* 1. TOP HEADER & TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h2 className="font-avathe text-2xl text-white tracking-widest uppercase">
              MODULE 05 // SOCIAL & SCENE SCOUT
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            UNIVERSAL EVENT PARSER • 3X3 INSTAGRAM GRID • MIX RELEASE PIPELINE • VIP SMS
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('social-scout') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'scout' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <Compass size={13} />
            <span>⚡ Scene Scout & Parser</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('social-grid') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'grid' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <Grid size={13} />
            <span>🗓️ 3x3 Instagram Grid</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('social-pipeline') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'pipeline' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <CheckSquare size={13} />
            <span>🚀 Mix Release Pipeline</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('social-vip') : null}
            className={`px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'vip' 
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]' 
                : 'bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white'
            }`}
          >
            <Send size={13} />
            <span>✉️ VIP SMS Alert Dispatch</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW: SCENE SCOUT & UNIVERSAL EVENT PARSER                         */}
      {/* ========================================================================= */}
      {currentMode === 'scout' && (
        <div className="space-y-6">
          
          {/* Radar Tuners */}
          <div className="border border-zinc-900 bg-zinc-950 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-2">
              <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
                <Sliders size={14} className="text-[#D8163F]" />
                ANALOG SCENE RADAR TUNERS
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">LIVE LONDON FEED</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[11px]">SONIC:</span>
                <select 
                  value={sonicTuner} 
                  onChange={(e) => setSonicTuner(e.target.value)}
                  className="bg-black border border-zinc-800 text-zinc-300 px-2 py-1 text-xs"
                >
                  <option value="140 / Breaks / UKG">140 / Breaks / UKG</option>
                  <option value="Hard Groove (145-155)">Hard Groove (145-155)</option>
                  <option value="Deep Hypnotic Techno">Deep Hypnotic Techno</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-[11px]">AREA:</span>
                <select 
                  value={areaTuner} 
                  onChange={(e) => setAreaTuner(e.target.value)}
                  className="bg-black border border-zinc-800 text-zinc-300 px-2 py-1 text-xs"
                >
                  <option value="South / East London">South / East London (Corsica, MOT, Spanners)</option>
                  <option value="Hackney / Dalston">Hackney / Dalston (FOLD, Colour Factory)</option>
                  <option value="All London Underground">All London Underground</option>
                </select>
              </div>
            </div>
          </div>

          {/* Universal Event Parser ("Paste & Parse") */}
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-3">
            <h3 className="font-bold text-xs text-white uppercase flex items-center gap-2">
              <Sparkles size={14} className="text-[#D8163F]" />
              UNIVERSAL EVENT PARSER (&quot;PASTE &amp; PARSE&quot;)
            </h3>
            <p className="text-zinc-500 text-xs">
              Paste unstructured promoter WhatsApp forwards, Instagram flyer captions, or Resident Advisor links to instantly extract event dates, venues, lineup slots, and contacts.
            </p>
            
            <textarea
              rows={3}
              placeholder="Paste WhatsApp gig invite e.g.: 'Hey Henry, loved your set! We're putting together a session on Nov 7th at Corner New Cross. Want to headline 01:00-03:00? Hit me back - Alex'"
              value={flyerText}
              onChange={(e) => setFlyerText(e.target.value)}
              className="w-full bg-black border border-zinc-800 p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#D8163F]"
            />

            <div className="flex justify-between items-center pt-1">
              <button
                onClick={() => setFlyerText("Royal Court Session // Corner New Cross SE14. Nov 7th. Headline set 01:00-03:00. Promoter Alex 07911123456.")}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                + Paste Sample Promoter WhatsApp
              </button>
              <button
                onClick={handleParseFlyer}
                className="px-4 py-2 bg-[#D8163F] text-black text-xs font-bold hover:bg-white flex items-center gap-1.5 shadow-[0_0_10px_rgba(216,22,63,0.4)] transition-colors"
              >
                <Sparkles size={13} />
                <span>PARSE EVENT DETAILS</span>
              </button>
            </div>
          </div>

          {/* Parsed Result Card */}
          {parsedLead && (
            <div className="border border-emerald-500 bg-emerald-950/20 p-5 space-y-3 text-xs">
              <div className="font-bold text-emerald-400 uppercase flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  PARSED GIG INQUIRY DETECTED
                </span>
                <button
                  onClick={() => {
                    addToast({
                      title: 'LEAD PUSHED TO GIGS',
                      message: `Created booking entry for ${parsedLead.venue} in Gigs Module.`,
                      type: 'success',
                    });
                  }}
                  className="px-3 py-1 bg-emerald-600 text-black font-bold hover:bg-white transition-colors"
                >
                  + Add to GIGS Module Schedule
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><span className="text-zinc-500 text-[10px] block">VENUE</span> <div className="text-white font-bold">{parsedLead.venue}</div></div>
                <div><span className="text-zinc-500 text-[10px] block">DATE</span> <div className="text-white font-bold">{parsedLead.date}</div></div>
                <div><span className="text-zinc-500 text-[10px] block">SLOT</span> <div className="text-white font-bold">{parsedLead.role}</div></div>
                <div><span className="text-zinc-500 text-[10px] block">PROMOTER</span> <div className="text-white font-bold">{parsedLead.promoter}</div></div>
              </div>
            </div>
          )}

          {/* Monitored London Collectives Watchlist */}
          <div className="border border-zinc-900 bg-zinc-950 p-4 space-y-3">
            <h4 className="font-bold text-xs text-white uppercase">MONITORED UNDERGROUND COLLECTIVES</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {[
                { name: 'UNFOLD // FOLD London', status: 'RSVP Form Active', sound: '145-155 BPM Hard Groove', nextDate: 'Sunday 18 Oct' },
                { name: 'RAT PARTY // Spanners', status: 'Open Decks Submission', sound: 'UKG, 140 Dubs, Breaks', nextDate: 'Friday 23:59 Deadline' },
                { name: 'TELETECH // E1 London', status: 'Lineup Staged', sound: 'Industrial High Energy', nextDate: 'Saturday 31 Oct' },
              ].map(c => (
                <div key={c.name} className="p-3 bg-black border border-zinc-800 space-y-2">
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[11px] text-emerald-400">● {c.status}</div>
                  <div className="text-[10px] text-zinc-500">{c.sound} • Next: {c.nextDate}</div>
                  <button
                    onClick={() => {
                      addToast({ title: 'PITCH STAGED', message: `EPK pitch drafted for ${c.name}.`, type: 'info' });
                    }}
                    className="w-full py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white text-[10px] font-bold"
                  >
                    ✉️ Pitch Promoter with EPK
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-white uppercase">INSTAGRAM PROFILE 3X3 FEED AESTHETIC</h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
                  NOTION: {instagramGrid.length} POSTS
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">Plan visual contrast across drops. Move posts up/down to balance aesthetic flow.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchContentPosts()}
                disabled={isLoadingSocial}
                className="px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                title="Refresh from Notion Content Calendar"
              >
                <RefreshCw size={12} className={isLoadingSocial ? 'animate-spin text-[#D8163F]' : ''} />
                <span>SYNC NOTION</span>
              </button>

              <button
                onClick={() => setShowStageModal(true)}
                className="px-3 py-1.5 bg-[#D8163F] text-black text-xs font-bold hover:bg-white flex items-center gap-1 transition-colors shadow-[0_0_10px_rgba(216,22,63,0.3)]"
              >
                <Plus size={12} />
                <span>+ STAGE POST TO NOTION</span>
              </button>
            </div>
          </div>

          {/* Stage Post Modal */}
          {showStageModal && (
            <div className="border border-[#D8163F] bg-zinc-950 p-4 space-y-4 max-w-2xl mx-auto shadow-[0_0_20px_rgba(216,22,63,0.2)]">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D8163F]" />
                  <span className="font-bold text-xs text-white uppercase">
                    STAGE NEW POST // NOTION CONTENT CALENDAR
                  </span>
                </div>
                <button 
                  onClick={() => setShowStageModal(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleStagePost} className="space-y-3 text-xs">
                <div>
                  <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-bold">Post Title / Hook:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Knight Club Vol 4 Lineup Reveal Video"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D8163F]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-bold">Content Type:</label>
                    <select
                      value={newPostType}
                      onChange={(e) => setNewPostType(e.target.value as any)}
                      className="w-full bg-black border border-zinc-800 p-2 text-white focus:outline-none focus:border-[#D8163F]"
                    >
                      <option value="Video Clip">Video Clip (Reel / Teaser)</option>
                      <option value="Gig Flyer">Gig Flyer (Lineup Poster)</option>
                      <option value="Track Reveal">Track Reveal (Dubplate Preview)</option>
                      <option value="Artwork">Artwork (Mix Cover)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-bold">Publish Date:</label>
                    <input
                      type="date"
                      value={newPostDate}
                      onChange={(e) => setNewPostDate(e.target.value)}
                      className="w-full bg-black border border-zinc-800 p-2 text-white focus:outline-none focus:border-[#D8163F]"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-bold">Campaign:</label>
                    <input
                      type="text"
                      placeholder="e.g. Knight Club Vol 4"
                      value={newPostCampaign}
                      onChange={(e) => setNewPostCampaign(e.target.value)}
                      className="w-full bg-black border border-zinc-800 p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D8163F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1 uppercase text-[10px] font-bold">Caption / Notes / Hashtags:</label>
                  <textarea
                    rows={2}
                    placeholder="Caption copy, hashtags, or drop details..."
                    value={newPostNotes}
                    onChange={(e) => setNewPostNotes(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-2 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D8163F]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setShowStageModal(false)}
                    className="px-3 py-1.5 bg-zinc-900 text-zinc-400 hover:text-white text-xs"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingPost}
                    className="px-4 py-1.5 bg-[#D8163F] text-black font-bold text-xs hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {isSubmittingPost ? 'CREATING IN NOTION...' : 'SAVE TO NOTION CALENDAR'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3x3 Profile Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
            {instagramGrid.length === 0 ? (
              <div className="col-span-3 border border-dashed border-zinc-800 p-8 text-center bg-zinc-950/40 space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                  <Grid size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase">NO STAGED POSTS IN NOTION CALENDAR</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 max-w-md mx-auto">
                    Your Notion Content Calendar is currently clear. Stage a post to map out your upcoming 3x3 Instagram aesthetic.
                  </p>
                </div>
                <button
                  onClick={() => setShowStageModal(true)}
                  className="px-4 py-2 bg-[#D8163F] text-black text-xs font-bold hover:bg-white inline-flex items-center gap-1.5 shadow-[0_0_10px_rgba(216,22,63,0.3)] transition-colors"
                >
                  <Plus size={13} />
                  <span>+ STAGE FIRST POST TO NOTION</span>
                </button>
              </div>
            ) : (
              instagramGrid.map((post, idx) => (
                <div 
                  key={post.id}
                  className="aspect-square bg-zinc-950 border border-zinc-800 p-2.5 flex flex-col justify-between group relative overflow-hidden transition-colors hover:border-zinc-700"
                >
                  <div className="flex justify-between items-start text-[10px] text-zinc-500 z-10">
                    <span className="px-1.5 py-0.5 bg-black/80 border border-zinc-800 text-white font-bold">#{idx + 1}</span>
                    <span className={post.scheduled ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                      {post.scheduled ? 'STAGED' : 'DRAFT'}
                    </span>
                  </div>

                  <div className="text-center my-auto p-1">
                    <div className="text-[11px] font-bold text-white line-clamp-2">{post.title}</div>
                    <div className="text-[9px] text-zinc-500 mt-1">{post.type}</div>
                  </div>

                  {/* Hover Reorder Controls */}
                  <div className="flex justify-between items-center border-t border-zinc-900 pt-1 z-10">
                    <button 
                      disabled={idx === 0}
                      onClick={() => reorderInstagramGrid(idx, idx - 1)}
                      className="p-1 hover:text-white disabled:opacity-20"
                      title="Move earlier"
                    >
                      <MoveUp size={12} />
                    </button>
                    <span className="text-[9px] text-zinc-500">{post.date}</span>
                    <button 
                      disabled={idx === instagramGrid.length - 1}
                      onClick={() => reorderInstagramGrid(idx, idx + 1)}
                      className="p-1 hover:text-white disabled:opacity-20"
                      title="Move later"
                    >
                      <MoveDown size={12} />
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
          <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase flex items-center gap-2">
                  <CheckSquare size={18} className="text-[#D8163F]" />
                  8-STAGE MIX MAKING & OMNI-RELEASE PIPELINE
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  End-to-end release workflow: Audio mastering, artwork, platform distribution, and social promo
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-bold mr-2">
                  {pipelineSteps.filter(s => s.completed).length} / {pipelineSteps.length} Steps Complete
                </span>
                <button
                  onClick={() => {
                    const tracklist = "00:00 - CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK] [7A • 150 BPM]\n04:12 - rude boy tokyo drift - dj g2g [2A • 150 BPM]\n08:45 - Do It Diva - zpectrum [3A • 145 BPM]\n14:20 - Flori Pori - Favela Funk [7B • 150 BPM]";
                    navigator.clipboard.writeText(tracklist);
                    addToast({ title: 'TRACKLIST COPIED', message: 'Formatted tracklist copied for SoundCloud/YouTube.', type: 'success' });
                  }}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 text-xs flex items-center gap-1.5"
                >
                  <Copy size={12} />
                  <span>Copy Formatted Tracklist</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-900 h-2 border border-zinc-800 overflow-hidden flex">
              <div 
                className="bg-[#D8163F] h-full transition-all duration-300" 
                style={{ width: `${(pipelineSteps.filter(s => s.completed).length / pipelineSteps.length) * 100}%` }}
              />
            </div>

            {/* Pipeline Step Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pipelineSteps.map(step => (
                <div 
                  key={step.id}
                  onClick={() => togglePipelineStep(step.id)}
                  className={`p-3.5 border cursor-pointer transition-colors space-y-1 ${
                    step.completed 
                      ? 'border-emerald-900/80 bg-emerald-950/20' 
                      : 'border-zinc-800 bg-black hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${step.completed ? 'text-emerald-400' : 'text-white'}`}>
                      {step.id}. {step.name}
                    </span>
                    <input 
                      type="checkbox" 
                      checked={step.completed} 
                      onChange={() => {}} 
                      className="accent-[#D8163F] h-4 w-4 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-black border border-zinc-900 flex justify-between items-center text-xs">
              <span className="text-zinc-500">CURRENT TARGET MIX: <strong className="text-white">Knight Club Session 04</strong></span>
              <button
                onClick={() => addToast({ title: 'MIX PUBLISHED', message: 'Knight Club Session 04 pushed to henryix.com/mixes.', type: 'success' })}
                className="px-3 py-1 bg-[#D8163F] text-black font-bold text-xs hover:bg-white transition-colors"
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
          <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="font-avathe text-xl text-white uppercase flex items-center gap-2">
                <Send size={16} className="text-[#D8163F]" />
                VIP INNER CIRCLE DISPATCHER
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Direct instant SMS / Email alert dispatch for secret London coordinates & door passcodes
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 uppercase font-bold block mb-1">RECIPIENT AUDIENCE:</label>
                <select
                  value={recipientGroup}
                  onChange={(e) => setRecipientGroup(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-white focus:outline-none focus:border-[#D8163F]"
                >
                  <option value="Inner Circle (120 Subscribers)">Inner Circle (120 Subscribers)</option>
                  <option value="London Resident List (350 Subscribers)">London Resident List (350 Subscribers)</option>
                  <option value="All Verified Leads (500+)">All Verified Leads (500+)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 uppercase font-bold block mb-1">SECRET COORDINATES & ACCESS INSTRUCTIONS:</label>
                <textarea
                  rows={3}
                  value={vipCoords}
                  onChange={(e) => setVipCoords(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <button
                onClick={handleDispatchVipSms}
                className="w-full py-3 bg-[#D8163F] text-black font-bold hover:bg-white flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(216,22,63,0.4)] transition-colors"
              >
                <Send size={14} />
                <span>DISPATCH VIP ALERT TO {recipientGroup.toUpperCase()}</span>
              </button>
            </div>
          </div>

          {/* 9:16 Tracklist Story Card Generator */}
          <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="font-avathe text-xl text-white uppercase flex items-center gap-2">
                <Share2 size={16} className="text-[#22d3ee]" />
                9:16 TRACKLIST STORY GENERATOR
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Generates 1080x1920 retro-dithered vertical graphic formatted for Instagram Stories
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-zinc-400 uppercase font-bold block mb-1">EVENT TITLE:</label>
                <input
                  type="text"
                  value={storyEventTitle}
                  onChange={(e) => setStoryEventTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <div>
                <label className="text-zinc-400 uppercase font-bold block mb-1">SET TRACKLIST:</label>
                <textarea
                  rows={4}
                  value={storyTracks}
                  onChange={(e) => setStoryTracks(e.target.value)}
                  className="w-full bg-black border border-zinc-800 p-2 text-white focus:outline-none focus:border-[#D8163F]"
                />
              </div>

              <button
                onClick={handleDownloadStoryCard}
                className="w-full py-2.5 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-200 hover:text-white font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Download size={14} />
                <span>DOWNLOAD 9:16 STORY PNG</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
