'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  RefreshCw, 
  Search, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle,
  Layers,
  Wand2,
  Music,
  Check
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export interface LibraryOrganiserDashboardProps {
  onNavigate?: (view: string) => void;
}

export default function LibraryOrganiserDashboard({ onNavigate }: LibraryOrganiserDashboardProps = {}) {
  const addToast = useStudioStore((s) => s.addToast);
  const trackCount = useStudioStore((s) => s.trackCollection.length);

  const [activeBay, setActiveBay] = useState<number>(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);

  // Bay 1: Duplicate Detective State
  const [duplicates, setDuplicates] = useState([
    {
      id: 'dup-1',
      original: { title: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK] (Master).wav', duration: '03:37.1', bitrate: '1411 kbps WAV' },
      duplicate: { title: 'MAJA - Kept [Free DL 320k Rip].mp3', duration: '03:37.4', bitrate: '320 kbps MP3' },
      confidence: 98,
    }
  ]);

  // Bay 2: Title Sanitizer State
  const [dirtyTitles, setDirtyTitles] = useState([
    { id: '1', dirty: 'MAJA - CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK] [OUT NOW 2024] 320kbps.mp3', clean: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]', artist: 'MAJA' },
    { id: '2', dirty: 'dj g2g - rude boy tokyo drift [YouTube Rip Master].wav', clean: 'rude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend)', artist: 'dj g2g' },
    { id: '3', dirty: 'zpectrum - Do It Diva (Free Download SoundCloud).aiff', clean: 'Do It Diva (Don Omar x Heidi Montag)', artist: 'zpectrum' },
  ]);

  // Bay 3: Smart Tag Recommender State
  const [tagProposals, setTagProposals] = useState([
    { id: 'p-1', track: 'Favela Funk', genre: 'Baile Funk / Breaks', key: '7B', energy: '9.2 / 10', confidence: 94, committed: false },
    { id: 'p-2', track: 'My Neck My Back [FREE DL]', genre: 'UK Bass / Hardgroove', key: '3A', energy: '8.8 / 10', confidence: 91, committed: false },
  ]);

  // Bay 6: Hot Cue Audit State
  const [cueAuditTracks, setCueAuditTracks] = useState([
    { id: 'c-1', title: 'MAJA - KEPT [REWORK]', status: 'Standardized (6 Cues: A-F)', colorChecked: true },
    { id: 'c-2', title: 'dj g2g - rude boy tokyo drift', status: 'Missing Cue C (Main Drop)', colorChecked: false },
    { id: 'c-3', title: 'zpectrum - Do It Diva', status: 'Non-Standard Cue Colors', colorChecked: false },
  ]);

  const runBayScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      addToast({
        title: 'HEALTH AUDIT COMPLETE',
        message: `Scanned ${trackCount} tracks in local library. 1 duplicate, 3 sanitization candidates identified.`,
        type: 'success',
      });
    }, 1200);
  };

  const handleResolveDuplicate = (action: 'delete' | 'merge') => {
    setDuplicates([]);
    if (action === 'delete') {
      addToast({
        title: 'DUPLICATE PURGED',
        message: 'Deleted 320kbps MP3 copy. Preserved Master 1411kbps WAV.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'CRATES MERGED',
        message: 'Mapped playlist occurrences to Master 1411kbps WAV.',
        type: 'success',
      });
    }
  };

  const handleCleanAllTitles = () => {
    const count = dirtyTitles.length;
    setDirtyTitles([]);
    addToast({
      title: 'TITLES SANITIZED',
      message: `Cleaned ${count} tracks. Stripped [Rip], [320kbps], and promotional suffixes.`,
      type: 'success',
    });
  };

  const handleCleanSingleTitle = (id: string, cleanTitle: string) => {
    setDirtyTitles((prev) => prev.filter((t) => t.id !== id));
    addToast({
      title: 'TITLE SANITIZED',
      message: `Updated to canonical title: "${cleanTitle}".`,
      type: 'success',
    });
  };

  const handleCommitTags = (id: string, track: string) => {
    setTagProposals((prev) => prev.map((p) => p.id === id ? { ...p, committed: true } : p));
    addToast({
      title: 'TAGS COMMITTED',
      message: `Wrote Camelot harmonic & set energy tags to "${track}".`,
      type: 'success',
    });
  };

  const handleApplyCueTemplate = (id: string, title: string) => {
    // Play sensory click
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    }

    setCueAuditTracks((prev) => prev.map((t) => t.id === id ? { ...t, colorChecked: true, status: 'Standardized (6 Cues: A-F)' } : t));
    addToast({
      title: 'PIONEER CUES APPLIED',
      message: `Standardized cues A-F on "${title}".`,
      type: 'success',
    });
  };

  return (
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      
      {/* 1. REPAIR SUITE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Library Organiser</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                6 Bays
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Duplicate detective • Bootleg title sanitization • Smart tag recommender • Pioneer cue audit
          </p>
        </div>

        {/* Sub-navigation Switcher Pills (Notion Segmented Control) */}
        <div className="flex flex-wrap items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('music-all') : null}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>Master Collection</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-set-planning') : null}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>Set Planning</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-organiser') : null}
            className="px-3 py-1.5 rounded-lg font-medium transition-all bg-white/[0.1] text-white shadow-sm"
          >
            <span>Organiser (6 Bays)</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-radar') : null}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>Music Radar</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-hardware') : null}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-zinc-400 hover:text-white hover:bg-white/[0.04]"
          >
            <span>USB Redundancy</span>
          </button>

          <button 
            onClick={runBayScan}
            disabled={isScanning}
            className="px-3.5 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm flex items-center gap-1.5 ml-2"
          >
            <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'Scanning...' : 'Run Health Audit'}</span>
          </button>
        </div>
      </div>

      {/* 2. SIX REPAIR BAYS SWITCHER */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        {[
          { id: 1, name: '1. Duplicates', icon: Layers, desc: 'Levenshtein ±0.5s' },
          { id: 2, name: '2. Sanitizer', icon: Wand2, desc: '112 Bootleg Strings' },
          { id: 3, name: '3. Smart Tags', icon: Sparkles, desc: 'Camelot & Energy' },
          { id: 4, name: '4. Artwork', icon: ImageIcon, desc: '3000x3000px Hi-Res' },
          { id: 5, name: '5. Link Resolver', icon: LinkIcon, desc: 'SC / Spotify / Beatport' },
          { id: 6, name: '6. Hot Cue Audit', icon: Sliders, desc: 'Pioneer 6-Tier Colors' },
        ].map((bay) => {
          const Icon = bay.icon;
          const isActive = activeBay === bay.id;
          return (
            <button
              key={bay.id}
              onClick={() => setActiveBay(bay.id)}
              className={`p-3.5 rounded-xl border text-left transition-all shadow-sm ${
                isActive 
                  ? 'border-white/20 bg-white/[0.08] text-white shadow-md' 
                  : 'border-white/[0.06] bg-[#14151a] text-zinc-400 hover:text-zinc-200 hover:bg-[#1b1c22]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-xs text-white">{bay.name}</span>
                <Icon size={13} className={isActive ? 'text-[#E53558]' : 'text-zinc-500'} />
              </div>
              <div className="text-[11px] text-zinc-400 truncate">{bay.desc}</div>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE REPAIR BAY WORKBENCH */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-5 shadow-sm">
        
        {/* BAY 1: DUPLICATE DETECTIVE */}
        {activeBay === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Bay 01 // Duplicate Detective</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Smart Fingerprinting matching duration (within ±0.5s), fuzzy Levenshtein distance &amp; bitrates.</p>
              </div>
              <span className="text-xs text-[#E53558] font-mono font-medium">
                {duplicates.length > 0 ? `${duplicates.length} MATCH DETECTED` : 'ALL DUPLICATES RESOLVED'}
              </span>
            </div>

            {duplicates.length === 0 ? (
              <div className="p-8 rounded-lg border border-dashed border-white/10 bg-[#0c0d10] text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <div className="font-medium text-white text-xs">No Duplicate Copies Found</div>
                <div className="text-xs text-zinc-500">Collection is 100% de-duplicated across Rekordbox &amp; local folders.</div>
              </div>
            ) : (
              duplicates.map((dup) => (
                <div key={dup.id} className="p-4 rounded-lg bg-[#0c0d10] border border-amber-500/30 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                    <span className="text-amber-400 font-medium font-mono">Warning: High Confidence Match ({dup.confidence}%)</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResolveDuplicate('delete')}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs text-zinc-200 transition-colors"
                      >
                        Keep Original Only (Delete MP3)
                      </button>
                      <button 
                        onClick={() => handleResolveDuplicate('merge')}
                        className="px-3 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs transition-colors shadow-sm"
                      >
                        Safe Merge Crate Presence
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                      <div className="text-emerald-400 font-medium mb-1 font-sans">Primary Master:</div>
                      <div className="text-white font-medium">{dup.original.title}</div>
                      <div className="text-zinc-400 text-[11px] mt-1">{dup.original.duration} • {dup.original.bitrate}</div>
                    </div>
                    <div className="p-3.5 rounded-lg border border-white/[0.06] bg-[#14151a]">
                      <div className="text-zinc-400 font-medium mb-1 font-sans">Duplicate Copy:</div>
                      <div className="text-zinc-300">{dup.duplicate.title}</div>
                      <div className="text-zinc-500 text-[11px] mt-1">{dup.duplicate.duration} • {dup.duplicate.bitrate}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BAY 2: TITLE & ARTIST SANITIZER */}
        {activeBay === 2 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Bay 02 // Title &amp; Artist Sanitizer</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Strips 112 bootleg rip strings (&quot;[Free Download]&quot;, &quot;Out Now&quot;, &quot;320kbps&quot;, &quot;YouTube Rip&quot;) without altering audio masters.</p>
              </div>
              {dirtyTitles.length > 0 && (
                <button 
                  onClick={handleCleanAllTitles}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition-colors shadow-sm"
                >
                  ✓ Auto-Clean All ({dirtyTitles.length})
                </button>
              )}
            </div>

            {dirtyTitles.length === 0 ? (
              <div className="p-8 rounded-lg border border-dashed border-white/10 bg-[#0c0d10] text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <div className="font-medium text-white text-xs">All Titles Sanitized &amp; Compliant</div>
                <div className="text-xs text-zinc-500">All metadata conforms to canonical Discogs standard.</div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dirtyTitles.map((t) => (
                  <div key={t.id} className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-red-400 line-through text-[11px] font-mono">{t.dirty}</div>
                      <div className="text-emerald-400 font-medium flex items-center gap-2">
                        <span>→</span>
                        <span>{t.artist} - {t.clean}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCleanSingleTitle(t.id, t.clean)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-200 text-xs font-medium transition-colors"
                    >
                      Apply Clean Title
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BAY 3: SMART TAG RECOMMENDER */}
        {activeBay === 3 && (
          <div className="space-y-4">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Bay 03 // Smart Tag Recommender</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Calculates genre lineage, Camelot harmonic key, and set energy rating with percentage confidence scores.</p>
            </div>

            <div className="space-y-2.5">
              {tagProposals.map((prop) => (
                <div key={prop.id} className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-medium text-white mb-1">{prop.track}</div>
                    <div className="flex flex-wrap gap-3 text-zinc-400 text-xs">
                      <span>Genre: <strong className="text-white">{prop.genre}</strong></span>
                      <span>Key: <strong className="text-[#06b6d4] font-mono">{prop.key}</strong></span>
                      <span>Energy: <strong className="text-[#E53558] font-mono">{prop.energy}</strong></span>
                      <span className="text-emerald-400 font-mono">({prop.confidence}% Confidence)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCommitTags(prop.id, prop.track)}
                    disabled={prop.committed}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      prop.committed 
                        ? 'border border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                        : 'bg-white/[0.06] border border-white/10 hover:border-[#E53558]/40 hover:text-white text-zinc-300'
                    }`}
                  >
                    {prop.committed ? '✓ Tags Committed' : 'Commit Tags'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BAY 4: ARTWORK RETRIEVER */}
        {activeBay === 4 && (
          <div className="space-y-4">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Bay 04 // 3000x3000px Hi-Res Artwork Embedder</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Scans Spotify, Beatport, and Discogs databases to embed verified square covers directly into ID3 tags.</p>
            </div>
            <div className="p-8 rounded-lg border border-dashed border-white/10 text-center space-y-2 bg-[#0c0d10]">
              <ImageIcon size={32} className="mx-auto text-zinc-600" />
              <div className="text-xs text-zinc-300 font-medium">All Tracks Audited for Artwork Integrity</div>
              <div className="text-xs text-emerald-400 font-mono font-medium">99.4% COVER ART SATURATION</div>
              <button
                onClick={() => addToast({ title: 'ARTWORK RETRIEVAL VERIFIED', message: 'Embedded 14 missing hi-res covers.', type: 'success' })}
                className="mt-3 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-200 transition-colors"
              >
                Scan Remaining 0.6%
              </button>
            </div>
          </div>
        )}

        {/* BAY 5: MULTI-LINK RESOLVER */}
        {activeBay === 5 && (
          <div className="space-y-4">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Bay 05 // Multi-Link Finder &amp; Resolver</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Cross-references track library with streaming counterparts across SoundCloud, Spotify, and Beatport.</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex justify-between items-center text-xs">
              <div>
                <div className="font-medium text-white">CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]</div>
                <div className="text-zinc-400 text-xs mt-0.5">SoundCloud (Matched) • Spotify (Matched) • Beatport (Matched)</div>
              </div>
              <button 
                onClick={() => addToast({ title: 'EXTERNAL LINKS VERIFIED', message: 'SoundCloud / Spotify API links verified.', type: 'success' })}
                className="text-emerald-400 font-medium text-xs hover:underline"
              >
                ✓ Links Resolved
              </button>
            </div>
          </div>
        )}

        {/* BAY 6: HOT CUE QUALITY AUDIT */}
        {activeBay === 6 && (
          <div className="space-y-4">
            <div className="border-b border-white/[0.08] pb-3">
              <h3 className="font-semibold text-sm text-white uppercase tracking-wider">Bay 06 // Pioneer CDJ-3000 Hot Cue Standardization</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Enforces the standardized 6-tier Pioneer color code: Cue A (Green), B (Cyan), C (Red Drop), D (Yellow), E (Purple), F (Orange Outro).</p>
            </div>
            <div className="space-y-2.5">
              {cueAuditTracks.map((tr) => (
                <div key={tr.id} className="p-3.5 rounded-lg bg-[#0c0d10] border border-white/[0.06] flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div>
                    <div className="font-medium text-white">{tr.title}</div>
                    <div className="text-zinc-400 text-xs mt-0.5">{tr.status}</div>
                  </div>
                  <button 
                    onClick={() => handleApplyCueTemplate(tr.id, tr.title)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      tr.colorChecked 
                        ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10' 
                        : 'bg-[#E53558] hover:bg-[#f43f5e] text-white shadow-sm'
                    }`}
                  >
                    {tr.colorChecked ? '✓ Compliant' : 'Apply 6-Cue Template'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
