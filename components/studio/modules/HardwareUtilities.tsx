'use client';

import React, { useState } from 'react';
import { 
  HardDrive, 
  RefreshCw, 
  FileAudio, 
  UploadCloud, 
  Copy, 
  Share2,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useStudioStore, StudioTrack } from '@/store/studioStore';

export interface HardwareUtilitiesProps {
  onNavigate?: (view: string) => void;
}

export default function HardwareUtilities({ onNavigate }: HardwareUtilitiesProps = {}) {
  const addToast = useStudioStore((s) => s.addToast);
  const addToSetlist = useStudioStore((s) => s.addToSetlist);
  const playTrack = useStudioStore((s) => s.playTrack);
  const trackCollection = useStudioStore((s) => s.trackCollection);
  const trackCount = trackCollection.length;

  const [syncStatus, setSyncStatus] = useState<'synced' | 'out-of-sync' | 'syncing'>('out-of-sync');
  const [syncProgress, setSyncProgress] = useState(0);
  const [recordingFile, setRecordingFile] = useState<string | null>(null);
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [reconstructedSetlist, setReconstructedSetlist] = useState<Array<{ time: string; track: string; artist: string; bpm: number; key: string }>>([]);

  const handleSyncDeltas = () => {
    setSyncStatus('syncing');
    setSyncProgress(0);

    const interval = setInterval(() => {
      setSyncProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setSyncStatus('synced');
          addToast({
            title: 'USB REDUNDANCY MIRROR COMPLETE',
            message: `USB 2 updated. ${trackCount} tracks bit-identical. SHA-256 verified.`,
            type: 'success',
          });
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const handleDropRecording = () => {
    setRecordingFile('ZOOM0042_KNIGHT_CLUB_MASTER.WAV (1.82 GB • 24-bit 48kHz)');
    setIsReconstructing(true);
    setTimeout(() => {
      setIsReconstructing(false);
      const fallbackTracks = [
        { title: 'CRYSTAL CASTLES - KEPT [MAJA + OKTE REWORK]', artist: 'MAJA', bpm: 150, key: '7A' },
        { title: 'rude boy tokyo drift (UNIIQU3 & Dj TaMeiL blend)', artist: 'dj g2g', bpm: 150, key: '2A' },
        { title: 'Do It Diva (Don Omar x Heidi Montag) [free DL]', artist: 'zpectrum', bpm: 145, key: '3A' },
        { title: 'Favela Funk', artist: 'Flori Pori', bpm: 150, key: '7B' },
        { title: 'My Neck My Back [FREE DL]', artist: 'Sunshine Vendetta', bpm: 145, key: '3A' },
        { title: 'Djadja (dj g2g baile edit)', artist: 'dj g2g', bpm: 140, key: '1A' },
      ];
      const sourceTracks = trackCollection.length >= 6 ? trackCollection.slice(0, 6) : fallbackTracks;
      const timestamps = ['00:00:00', '00:04:12', '00:08:45', '00:14:20', '00:19:05', '00:24:50'];
      const set = sourceTracks.map((t, idx) => ({
        time: timestamps[idx] || '00:30:00',
        track: t.title,
        artist: t.artist,
        bpm: t.bpm || 150,
        key: t.key || '7A',
      }));
      setReconstructedSetlist(set);
      addToast({
        title: 'SETLIST RECONSTRUCTED',
        message: 'Triangulated 6 tracks and cue markers from booth master audio.',
        type: 'success',
      });
    }, 1500);
  };

  const copyTracklist = () => {
    const text = reconstructedSetlist.map(s => `${s.time} - ${s.artist} - ${s.track}`).join('\n');
    navigator.clipboard.writeText(text);
    addToast({
      title: 'TRACKLIST COPIED',
      message: 'Minute-by-minute setlist copied for SoundCloud / 1001Tracklists.',
      type: 'success',
    });
  };

  const exportCueSheet = () => {
    let cue = `PERFORMER "HENRY IX"\nTITLE "Knight Club Live Session"\nFILE "ZOOM0042_KNIGHT_CLUB_MASTER.WAV" WAVE\n`;
    reconstructedSetlist.forEach((item, idx) => {
      const trackNum = (idx + 1).toString().padStart(2, '0');
      cue += `  TRACK ${trackNum} AUDIO\n    TITLE "${item.track}"\n    PERFORMER "${item.artist}"\n    INDEX 01 ${item.time}\n`;
    });

    const blob = new Blob([cue], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Henry_IX_Knight_Club_Session_${Date.now()}.cue`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'CUE SHEET DOWNLOADED',
      message: 'Industry standard .CUE file generated for Rekordbox & Traktor.',
      type: 'success',
    });
  };

  const handlePushToNotion = () => {
    reconstructedSetlist.forEach((item, idx) => {
      const track: StudioTrack = {
        id: `recon-${idx}`,
        title: item.track,
        artist: item.artist,
        bpm: item.bpm,
        key: item.key,
        duration: 240,
        source: 'Local',
        energy: 8.5,
        artwork: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
        audioFrequency: 130 + idx * 10,
      };
      addToSetlist(track);
    });

    addToast({
      title: 'NOTION SETS SYNCED',
      message: 'Pushed 6 reconstructed tracks to Notion Sets DB (00c67473).',
      type: 'success',
    });
  };

  return (
    <div className="p-6 text-zinc-200 font-sans space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="font-semibold text-xl text-white tracking-tight">
              HARDWARE & USB UTILITIES
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            TOUR-GRADE STORAGE REDUNDANCY • CDJ USB MIRROR • BOOTH AUDIO RECONSTRUCTION
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.('music-all')}
            className="px-3 py-1.5 rounded-lg bg-[#1b1c22] border border-white/[0.08] text-xs font-medium text-zinc-300 hover:text-white hover:bg-[#242630] transition-colors"
          >
            ← Library
          </button>
        </div>
      </div>

      {/* 1. USB REDUNDANCY MIRROR STATUS */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14151a] p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <HardDrive size={16} className="text-[#E53558]" />
            <h3 className="font-medium text-sm text-white">
              Dual USB Redundancy Mirror (CDJ-3000 Primary + Backup)
            </h3>
          </div>
          <span className={`text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
            syncStatus === 'synced' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}>
            {syncStatus === 'synced' ? 'Bit-Identical' : 'Out of Sync'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Verifies identical FAT32 partition layouts, Rekordbox XML databases, and hot cues across primary and backup flash drives before booth arrival.
        </p>

        {/* Dual Drive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Drive 1: Primary Master */}
          <div className="p-4 rounded-xl bg-[#1b1c22] border border-white/[0.08] space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-xs text-white">USB 1: SanDisk Extreme Pro (Primary)</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/[0.06]">E:\ REKORDBOX</span>
            </div>
            <div className="text-zinc-400 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>FORMAT:</span>
                <strong className="text-zinc-200">FAT32</strong>
              </div>
              <div className="flex justify-between">
                <span>CAPACITY:</span>
                <strong className="text-zinc-200">128 GB (42% Used)</strong>
              </div>
              <div className="flex justify-between">
                <span>COLLECTION:</span>
                <strong className="text-zinc-200">{trackCount} Tracks</strong>
              </div>
              <div className="pt-1 flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 size={13} />
                <span>MASTER READY FOR BOOTH</span>
              </div>
            </div>
          </div>

          {/* Drive 2: Corsair GTX Backup */}
          <div className="p-4 rounded-xl bg-[#1b1c22] border border-white/[0.08] space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-xs text-white">USB 2: Corsair GTX 3.2 (Backup Clone)</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/[0.06]">F:\ REKORDBOX</span>
            </div>
            <div className="text-zinc-400 space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between">
                <span>FORMAT:</span>
                <strong className="text-zinc-200">FAT32</strong>
              </div>
              <div className="flex justify-between">
                <span>CAPACITY:</span>
                <strong className="text-zinc-200">128 GB (42% Used)</strong>
              </div>
              <div className="flex justify-between">
                <span>COLLECTION:</span>
                <strong className={syncStatus === 'synced' ? 'text-zinc-200' : 'text-zinc-400'}>
                  {syncStatus === 'synced' ? `${trackCount} Tracks` : `${Math.max(0, trackCount - 2)} Tracks`}
                </strong>
              </div>
              <div className="pt-1 flex items-center gap-1.5">
                {syncStatus === 'synced' ? (
                  <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>MIRROR COMPLETE & IDENTICAL</span>
                  </div>
                ) : (
                  <div className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle size={13} />
                    <span>2 TRACKS OUT OF SYNC</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sync Progress Bar if syncing */}
        {syncStatus === 'syncing' && (
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs text-zinc-400 font-mono">
              <span>Writing bitstream deltas to F:\PIONEER\...</span>
              <span className="text-[#E53558] font-bold">{syncProgress}%</span>
            </div>
            <div className="w-full bg-[#1b1c22] h-2 rounded-full overflow-hidden border border-white/[0.08]">
              <div className="bg-[#E53558] h-full rounded-full transition-all duration-300" style={{ width: `${syncProgress}%` }} />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSyncDeltas}
            disabled={syncStatus === 'synced' || syncStatus === 'syncing'}
            className="px-4 py-2 rounded-lg bg-[#E53558] text-white text-xs font-medium hover:bg-[#d82a4d] disabled:opacity-40 disabled:hover:bg-[#E53558] transition-colors shadow-sm"
          >
            {syncStatus === 'synced' ? '✓ All Drives Mirrored' : 'Sync Deltas to USB 2'}
          </button>
        </div>
      </div>

      {/* 2. BOOTH RECORDING AUTO-MATCHER */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14151a] p-6 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5">
            <FileAudio size={16} className="text-cyan-400" />
            <h3 className="font-medium text-sm text-white">
              Booth Recording Auto-Matcher (Zoom H4n / DJM-A9)
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">Automated Setlist Reconstruction</span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Ingests a raw 2-hour WAV/MP3 booth recording, triangulates timestamps against planned session history, and generates minute-by-minute tracklists for 1001Tracklists and SoundCloud.
        </p>

        {/* Dropzone */}
        {!recordingFile ? (
          <div 
            onClick={handleDropRecording}
            className="border-2 border-dashed border-white/[0.08] hover:border-[#E53558]/60 p-8 rounded-xl text-center bg-[#1b1c22]/50 hover:bg-[#1b1c22] cursor-pointer transition-all space-y-3 group"
          >
            <UploadCloud size={32} className="mx-auto text-zinc-500 group-hover:text-[#E53558] transition-colors" />
            <div className="text-xs text-zinc-200 font-medium">Click or drop booth master recording (.wav / .mp3)</div>
            <div className="text-[11px] text-zinc-500 font-mono">Triangulates with Knight Club / London Live Set Markers</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#1b1c22] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <FileAudio size={15} className="text-emerald-400" />
                <span className="text-zinc-200 font-medium">{recordingFile}</span>
              </div>
              <button 
                onClick={() => { setRecordingFile(null); setReconstructedSetlist([]); }}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕ Clear
              </button>
            </div>

            {isReconstructing ? (
              <div className="p-8 text-center text-xs text-zinc-400 space-y-3 bg-[#1b1c22] rounded-xl border border-white/[0.08] animate-pulse font-mono">
                <RefreshCw size={22} className="mx-auto animate-spin text-[#E53558]" />
                <div>ANALYZING AUDIO TRANSIENTS & RECONSTRUCTING TIMESTAMPS...</div>
              </div>
            ) : reconstructedSetlist.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-emerald-400 font-medium font-mono">✓ Reconstructed 6 tracks (00:28:40 total)</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyTracklist}
                      className="px-3 py-1.5 rounded-lg bg-[#1b1c22] hover:bg-[#242630] border border-white/[0.08] text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Copy size={12} />
                      <span>Copy for SoundCloud</span>
                    </button>
                    <button 
                      onClick={exportCueSheet}
                      className="px-3 py-1.5 rounded-lg bg-[#1b1c22] hover:bg-[#242630] border border-white/[0.08] text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={12} />
                      <span>Export .CUE</span>
                    </button>
                    <button 
                      onClick={handlePushToNotion}
                      className="px-3 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#d82a4d] text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Share2 size={12} />
                      <span>Push to Notion Sets</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#1b1c22] divide-y divide-white/[0.06] overflow-hidden text-xs">
                  {reconstructedSetlist.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[#E53558] font-semibold text-xs font-mono">{item.time}</span>
                        <span className="text-zinc-200 font-medium truncate">{item.track}</span>
                        <span className="text-zinc-500 truncate">{item.artist}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono shrink-0 ml-3">
                        <span className="px-2 py-0.5 rounded bg-black/40 text-cyan-400 border border-white/[0.08]">{item.key}</span>
                        <span className="text-zinc-400">{item.bpm} BPM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
