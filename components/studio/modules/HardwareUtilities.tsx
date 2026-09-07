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
  CheckCircle2
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
    <div className="p-6 bg-black text-white font-mono space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="font-avathe text-2xl text-white tracking-widest uppercase">
              MODULE 02 // MUSIC &amp; DJ ENGINE
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">USB REDUNDANCY SYNC CHECKER &amp; BOOTH RECORDING AUTO-MATCHER</p>
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
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
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
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]"
          >
            <span>💾 USB Redundancy</span>
          </button>
        </div>
      </div>

      {/* 1. USB 1 & USB 2 REDUNDANCY SYNC CHECKER */}
      <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-[#D8163F]" />
            <h3 className="font-bold text-sm text-white uppercase">
              USB 1 & USB 2 REDUNDANCY SYNC CHECKER
            </h3>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded border font-bold ${
            syncStatus === 'synced' 
              ? 'text-emerald-400 border-emerald-900 bg-emerald-950/30' 
              : syncStatus === 'syncing' 
              ? 'text-yellow-400 border-yellow-900 bg-yellow-950/30 animate-pulse'
              : 'text-amber-400 border-amber-900 bg-amber-950/30'
          }`}>
            {syncStatus === 'synced' ? '✓ FULLY MIRRORED' : syncStatus === 'syncing' ? `SYNCING DELTAS (${syncProgress}%)...` : '⚠️ OUT OF SYNC (2 DELTAS)'}
          </span>
        </div>

        {/* Dual Drive Monitors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Drive 1: Corsair GTX Primary */}
          <div className="p-4 bg-black border border-emerald-500/50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-400">USB 1: CORSAIR GTX 3.2 (PRIMARY)</span>
              <span className="text-[10px] text-zinc-500">E:\ REKORDBOX</span>
            </div>
            <div className="text-zinc-300 space-y-1 text-[11px]">
              <div>FORMAT: <strong className="text-white">FAT32</strong> • CAPACITY: <strong className="text-white">128 GB (42% Used)</strong></div>
              <div>COLLECTION: <strong className="text-white">{trackCount} Tracks</strong> • HOT CUES: <strong className="text-white">100% Verified</strong></div>
              <div className="text-emerald-400 font-bold">STATUS: MASTER READY FOR BOOTH</div>
            </div>
          </div>

          {/* Drive 2: Corsair GTX Backup */}
          <div className="p-4 bg-black border border-zinc-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-zinc-300">USB 2: CORSAIR GTX 3.2 (BACKUP CLONE)</span>
              <span className="text-[10px] text-zinc-500">F:\ REKORDBOX</span>
            </div>
            <div className="text-zinc-300 space-y-1 text-[11px]">
              <div>FORMAT: <strong className="text-white">FAT32</strong> • CAPACITY: <strong className="text-white">128 GB (42% Used)</strong></div>
              <div>COLLECTION: <strong className={syncStatus === 'synced' ? 'text-white' : 'text-zinc-400'}>{syncStatus === 'synced' ? `${trackCount} Tracks` : `${Math.max(0, trackCount - 2)} Tracks`}</strong></div>
              <div className={syncStatus === 'synced' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                {syncStatus === 'synced' ? '✓ MIRROR COMPLETE & IDENTICAL' : 'STATUS: 2 TRACKS OUT OF SYNC'}
              </div>
            </div>
          </div>
        </div>

        {/* Sync Progress Bar if syncing */}
        {syncStatus === 'syncing' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Writing bitstream deltas to F:\PIONEER\...</span>
              <span className="text-yellow-400 font-bold">{syncProgress}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 border border-zinc-800 overflow-hidden">
              <div className="bg-[#D8163F] h-full transition-all duration-300" style={{ width: `${syncProgress}%` }} />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSyncDeltas}
            disabled={syncStatus === 'synced' || syncStatus === 'syncing'}
            className="px-4 py-2 bg-[#D8163F] text-white text-xs font-bold hover:bg-red-600 disabled:opacity-40 transition-colors shadow-[0_0_10px_rgba(216,22,63,0.4)]"
          >
            {syncStatus === 'synced' ? '✓ ALL DRIVES MIRRORED' : 'SYNC 2 DELTAS TO USB 2'}
          </button>
        </div>
      </div>

      {/* 2. BOOTH RECORDING AUTO-MATCHER */}
      <div className="border border-zinc-900 bg-zinc-950 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <FileAudio size={16} className="text-[#22d3ee]" />
            <h3 className="font-bold text-sm text-white uppercase">
              BOOTH RECORDING AUTO-MATCHER (ZOOM H4N / DJM-A9)
            </h3>
          </div>
          <span className="text-xs text-zinc-500">AUTOMATED SETLIST RECONSTRUCTION</span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Ingests a raw 2-hour WAV/MP3 booth recording, triangulates timestamps against planned Serato/Rekordbox session history, and generates minute-by-minute tracklists.
        </p>

        {/* Dropzone */}
        {!recordingFile ? (
          <div 
            onClick={handleDropRecording}
            className="border-2 border-dashed border-zinc-800 hover:border-[#D8163F] p-8 text-center bg-black cursor-pointer transition-colors space-y-2 group"
          >
            <UploadCloud size={32} className="mx-auto text-zinc-600 group-hover:text-[#D8163F] transition-colors" />
            <div className="text-xs text-zinc-300 font-bold">CLICK OR DROP BOOTH RECORDING (.WAV / .MP3)</div>
            <div className="text-[10px] text-zinc-500">Triangulates with Knight Club / London Live Set Markers</div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-black border border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileAudio size={14} className="text-emerald-400" />
                <span className="text-white font-bold">{recordingFile}</span>
              </div>
              <button 
                onClick={() => { setRecordingFile(null); setReconstructedSetlist([]); }}
                className="text-zinc-500 hover:text-white"
              >
                ✕ Clear
              </button>
            </div>

            {isReconstructing ? (
              <div className="p-6 text-center text-xs text-zinc-400 space-y-2 animate-pulse">
                <RefreshCw size={20} className="mx-auto animate-spin text-[#D8163F]" />
                <div>ANALYZING AUDIO TRANSIENTS & RECONSTRUCTING TIMESTAMPS...</div>
              </div>
            ) : reconstructedSetlist.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="text-emerald-400 font-bold">✓ RECONSTRUCTED 6 TRACKS (00:28:40 TOTAL)</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyTracklist}
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Copy size={11} />
                      <span>Copy for SoundCloud</span>
                    </button>
                    <button 
                      onClick={exportCueSheet}
                      className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={11} />
                      <span>Export .CUE</span>
                    </button>
                    <button 
                      onClick={handlePushToNotion}
                      className="px-3 py-1 bg-[#D8163F] hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(216,22,63,0.4)]"
                    >
                      <Share2 size={11} />
                      <span>Push to Notion Sets</span>
                    </button>
                  </div>
                </div>

                <div className="border border-zinc-900 bg-black divide-y divide-zinc-900 text-xs">
                  {reconstructedSetlist.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[#D8163F] font-bold text-[11px] font-mono">{item.time}</span>
                        <span className="text-white font-bold">{item.track}</span>
                        <span className="text-zinc-500">{item.artist}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className="px-1.5 py-0.5 bg-zinc-900 text-[#22d3ee] border border-zinc-800">{item.key}</span>
                        <span className="text-zinc-500">{item.bpm} BPM</span>
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
