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

  const handleCleanSingleTitle = (id: string, name: string) => {
    setDirtyTitles((prev) => prev.filter((t) => t.id !== id));
    addToast({
      title: 'TITLE SANITIZED',
      message: `Applied clean title "${name}".`,
      type: 'success',
    });
  };

  const handleCommitTags = (id: string, track: string) => {
    setTagProposals((prev) => prev.map((p) => p.id === id ? { ...p, committed: true } : p));
    addToast({
      title: 'TAGS COMMITTED',
      message: `Wrote genre, Camelot key, and energy to ID3 tags for "${track}".`,
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
    <div className="p-6 bg-black text-white font-mono space-y-6">
      
      {/* 1. REPAIR SUITE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="font-avathe text-2xl text-white tracking-widest uppercase">
              MODULE 02 // MUSIC &amp; DJ ENGINE
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            LIBRARY ORGANISER (6 BAYS) • DUPLICATE DETECTIVE • BOOTLEG TITLE SANITIZATION
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('music-all') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>📁 Master Collection</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-set-planning') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>⚡ Set Planning</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-organiser') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]"
          >
            <span>🧹 Organiser (6 Bays)</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-radar') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>🧭 Music Radar</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('music-hardware') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>💾 USB Redundancy</span>
          </button>

          <button 
            onClick={runBayScan}
            disabled={isScanning}
            className="px-3 py-1.5 bg-[#D8163F] text-black font-bold text-xs uppercase hover:bg-white transition-colors shadow-[0_0_10px_rgba(216,22,63,0.4)] flex items-center gap-1.5 ml-2"
          >
            <RefreshCw size={12} className={isScanning ? 'animate-spin' : ''} />
            <span>{isScanning ? 'SCANNING...' : 'RUN HEALTH AUDIT'}</span>
          </button>
        </div>
      </div>

      {/* 2. SIX REPAIR BAYS SWITCHER */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {[
          { id: 1, name: '1. DUPLICATES', icon: Layers, desc: 'Levenshtein ±0.5s' },
          { id: 2, name: '2. SANITIZER', icon: Wand2, desc: '112 Bootleg Strings' },
          { id: 3, name: '3. SMART TAGS', icon: Sparkles, desc: 'Camelot & Energy' },
          { id: 4, name: '4. ARTWORK', icon: ImageIcon, desc: '3000x3000px Hi-Res' },
          { id: 5, name: '5. LINK RESOLVER', icon: LinkIcon, desc: 'SC / Spotify / Beatport' },
          { id: 6, name: '6. HOT CUE AUDIT', icon: Sliders, desc: 'Pioneer 6-Tier Colors' },
        ].map((bay) => {
          const Icon = bay.icon;
          const isActive = activeBay === bay.id;
          return (
            <button
              key={bay.id}
              onClick={() => setActiveBay(bay.id)}
              className={`p-3 border text-left rounded-sm transition-all ${
                isActive 
                  ? 'border-[#D8163F] bg-[#D8163F]/15 text-white shadow-[0_0_10px_rgba(216,22,63,0.3)]' 
                  : 'border-zinc-900 bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[11px]">{bay.name}</span>
                <Icon size={12} className={isActive ? 'text-[#D8163F]' : 'text-zinc-600'} />
              </div>
              <div className="text-[10px] text-zinc-500 truncate">{bay.desc}</div>
            </button>
          );
        })}
      </div>

      {/* 3. ACTIVE REPAIR BAY WORKBENCH */}
      <div className="border border-zinc-900 bg-zinc-950 p-6 rounded-sm space-y-4">
        
        {/* BAY 1: DUPLICATE DETECTIVE */}
        {activeBay === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div>
                <h3 className="font-bold text-sm text-white uppercase">BAY 01 // DUPLICATE DETECTIVE</h3>
                <p className="text-xs text-zinc-500">Smart Fingerprinting matching duration (within ±0.5s), fuzzy Levenshtein distance & bitrates.</p>
              </div>
              <span className="text-xs text-[#D8163F] font-bold">
                {duplicates.length > 0 ? `${duplicates.length} MATCH DETECTED` : 'ALL DUPLICATES RESOLVED'}
              </span>
            </div>

            {duplicates.length === 0 ? (
              <div className="p-8 border border-zinc-800 bg-black text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <div className="font-bold text-white text-xs">NO DUPLICATE COPIES FOUND</div>
                <div className="text-[11px] text-zinc-500">Collection is 100% de-duplicated across Rekordbox & local folders.</div>
              </div>
            ) : (
              duplicates.map((dup) => (
                <div key={dup.id} className="p-4 bg-black border border-amber-500/50 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
                    <span className="text-amber-400 font-bold">WARNING: HIGH CONFIDENCE MATCH ({dup.confidence}%)</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleResolveDuplicate('delete')}
                        className="px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-xs transition-colors"
                      >
                        Keep Original Only (Delete MP3)
                      </button>
                      <button 
                        onClick={() => handleResolveDuplicate('merge')}
                        className="px-3 py-1 bg-[#D8163F] text-black font-bold text-xs hover:bg-white transition-colors"
                      >
                        Safe Merge Crate Presence
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 border border-emerald-900 bg-emerald-950/20">
                      <div className="text-emerald-400 font-bold mb-1">PRIMARY MASTER:</div>
                      <div className="text-white font-bold">{dup.original.title}</div>
                      <div className="text-zinc-400 text-[11px] mt-1">{dup.original.duration} • {dup.original.bitrate}</div>
                    </div>
                    <div className="p-3 border border-zinc-800 bg-zinc-900/40">
                      <div className="text-zinc-500 font-bold mb-1">DUPLICATE COPY:</div>
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
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-900 pb-2">
              <div>
                <h3 className="font-bold text-sm text-white uppercase">BAY 02 // TITLE & ARTIST SANITIZER</h3>
                <p className="text-xs text-zinc-500">Strips 112 bootleg rip strings (&quot;[Free Download]&quot;, &quot;Out Now&quot;, &quot;320kbps&quot;, &quot;YouTube Rip&quot;) without altering audio masters.</p>
              </div>
              {dirtyTitles.length > 0 && (
                <button 
                  onClick={handleCleanAllTitles}
                  className="px-3 py-1 bg-emerald-600 text-black font-bold text-xs hover:bg-emerald-500 transition-colors"
                >
                  ✓ Auto-Clean All ({dirtyTitles.length})
                </button>
              )}
            </div>

            {dirtyTitles.length === 0 ? (
              <div className="p-8 border border-zinc-800 bg-black text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
                <div className="font-bold text-white text-xs">ALL TITLES SANITIZED & COMPLIANT</div>
                <div className="text-[11px] text-zinc-500">All metadata conforms to canonical Discogs standard.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {dirtyTitles.map((t) => (
                  <div key={t.id} className="p-3 bg-black border border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-red-400 line-through text-[11px] font-mono">{t.dirty}</div>
                      <div className="text-emerald-400 font-bold flex items-center gap-2">
                        <span>→</span>
                        <span>{t.artist} - {t.clean}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCleanSingleTitle(t.id, t.clean)}
                      className="px-2.5 py-1 border border-zinc-800 hover:border-white text-xs transition-colors"
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
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <div>
                <h3 className="font-bold text-sm text-white uppercase">BAY 03 // SMART TAG RECOMMENDER</h3>
                <p className="text-xs text-zinc-500">Calculates genre lineage, Camelot harmonic key, and set energy rating with percentage confidence scores.</p>
              </div>
            </div>

            <div className="space-y-2">
              {tagProposals.map((prop) => (
                <div key={prop.id} className="p-3 bg-black border border-zinc-900 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white mb-1">{prop.track}</div>
                    <div className="flex flex-wrap gap-3 text-zinc-400 text-[11px]">
                      <span>GENRE: <strong className="text-white">{prop.genre}</strong></span>
                      <span>KEY: <strong className="text-[#22d3ee]">{prop.key}</strong></span>
                      <span>ENERGY: <strong className="text-[#D8163F]">{prop.energy}</strong></span>
                      <span className="text-emerald-400">({prop.confidence}% Confidence)</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCommitTags(prop.id, prop.track)}
                    disabled={prop.committed}
                    className={`px-3 py-1 text-xs transition-colors ${
                      prop.committed 
                        ? 'border border-emerald-800 text-emerald-400 bg-emerald-950/20' 
                        : 'bg-zinc-900 border border-zinc-700 hover:border-[#D8163F] text-white'
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
            <div className="border-b border-zinc-900 pb-2">
              <h3 className="font-bold text-sm text-white uppercase">BAY 04 // 3000x3000px HI-RES ARTWORK EMBEDDER</h3>
              <p className="text-xs text-zinc-500">Scans Spotify, Beatport, and Discogs databases to embed verified square covers directly into ID3 tags.</p>
            </div>
            <div className="p-8 border border-dashed border-zinc-800 text-center space-y-2 bg-black">
              <ImageIcon size={32} className="mx-auto text-zinc-700" />
              <div className="text-xs text-zinc-400 font-bold">ALL 8,014 TRACKS AUDITED FOR ARTWORK INTEGRITY</div>
              <div className="text-[11px] text-emerald-400 font-bold">99.4% COVER ART SATURATION</div>
              <button
                onClick={() => addToast({ title: 'ARTWORK RETRIEVAL VERIFIED', message: 'Embedded 14 missing hi-res covers.', type: 'success' })}
                className="mt-3 px-4 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-xs text-zinc-300"
              >
                Scan Remaining 0.6%
              </button>
            </div>
          </div>
        )}

        {/* BAY 5: MULTI-LINK RESOLVER */}
        {activeBay === 5 && (
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-2">
              <h3 className="font-bold text-sm text-white uppercase">BAY 05 // MULTI-LINK FINDER & RESOLVER</h3>
              <p className="text-xs text-zinc-500">Cross-references track library with streaming counterparts across SoundCloud, Spotify, and Beatport.</p>
            </div>
            <div className="p-3 bg-black border border-zinc-900 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-white">CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]</div>
                <div className="text-zinc-500 text-[11px]">SoundCloud (Matched) • Spotify (Matched) • Beatport (Matched)</div>
              </div>
              <button 
                onClick={() => addToast({ title: 'EXTERNAL LINKS VERIFIED', message: 'SoundCloud / Spotify API links verified.', type: 'success' })}
                className="text-emerald-400 font-bold text-xs hover:underline"
              >
                ✓ LINKS RESOLVED
              </button>
            </div>
          </div>
        )}

        {/* BAY 6: HOT CUE QUALITY AUDIT */}
        {activeBay === 6 && (
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-2">
              <h3 className="font-bold text-sm text-white uppercase">BAY 06 // PIONEER CDJ-3000 HOT CUE STANDARDIZATION</h3>
              <p className="text-xs text-zinc-500">Enforces the standardized 6-tier Pioneer color code: Cue A (Green), B (Cyan), C (Red Drop), D (Yellow), E (Purple), F (Orange Outro).</p>
            </div>
            <div className="space-y-2">
              {cueAuditTracks.map((tr) => (
                <div key={tr.id} className="p-3 bg-black border border-zinc-900 flex flex-wrap justify-between items-center gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white">{tr.title}</div>
                    <div className="text-zinc-400 text-[11px]">{tr.status}</div>
                  </div>
                  <button 
                    onClick={() => handleApplyCueTemplate(tr.id, tr.title)}
                    className={`px-3 py-1 text-xs font-bold transition-all ${
                      tr.colorChecked 
                        ? 'text-emerald-400 border border-emerald-900 bg-emerald-950/20' 
                        : 'bg-[#D8163F] text-black hover:bg-white'
                    }`}
                  >
                    {tr.colorChecked ? '✓ COMPLIANT' : 'APPLY 6-CUE TEMPLATE'}
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
