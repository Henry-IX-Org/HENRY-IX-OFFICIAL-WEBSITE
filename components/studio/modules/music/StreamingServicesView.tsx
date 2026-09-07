'use client';

import React from 'react';
import { Radio, CheckCircle2, RefreshCw, Download } from 'lucide-react';
import { useStudioStore, StudioTrack } from '@/store/studioStore';

interface StreamingServicesViewProps {
  mode: 'spotify' | 'soundcloud';
  filteredTracks: StudioTrack[];
}

export default function StreamingServicesView({ mode, filteredTracks }: StreamingServicesViewProps) {
  const addToSetlist = useStudioStore((s) => s.addToSetlist);
  const addToast = useStudioStore((s) => s.addToast);

  if (mode === 'spotify') {
    return (
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
        <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
                <Radio size={18} className="text-emerald-400" />
                SYNCED SPOTIFY PLAYLISTS // ARTIST PRO
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Live connection with Henry IX Spotify for Artists account. Bi-directional track importing and
                public playlist curation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Token Active</span>
              </span>
              <button
                onClick={() =>
                  addToast({
                    title: 'SPOTIFY SYNC COMPLETE',
                    message: 'Imported 8 new saved tracks into Rekordbox pool.',
                    type: 'success',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw size={12} />
                <span>Sync New Saves</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
              <div className="font-semibold text-white">HENRY IX // SELECTS (Official)</div>
              <div className="text-zinc-500 text-[11px] font-mono">50 Tracks • 4,280 Followers</div>
              <button
                onClick={() =>
                  addToast({
                    title: 'PLAYLIST SYNCED',
                    message: 'Updated public Spotify playlist.',
                    type: 'info',
                  })
                }
                className="text-emerald-400 hover:underline text-[11px] font-medium block pt-1"
              >
                + Push Setlist to Spotify
              </button>
            </div>
            <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
              <div className="font-semibold text-white">Late Night London 140</div>
              <div className="text-zinc-500 text-[11px] font-mono">38 Tracks • 1,840 Followers</div>
              <button
                onClick={() =>
                  addToast({
                    title: 'IMPORT COMPLETE',
                    message: 'Imported 38 tracks to Crate.',
                    type: 'info',
                  })
                }
                className="text-emerald-400 hover:underline text-[11px] font-medium block pt-1"
              >
                + Import to Local Crate
              </button>
            </div>
            <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
              <div className="font-semibold text-white">Knight Club Heavy Rotation</div>
              <div className="text-zinc-500 text-[11px] font-mono">24 Tracks • 910 Followers</div>
              <button
                onClick={() =>
                  addToast({
                    title: 'IMPORT COMPLETE',
                    message: 'Imported 24 tracks to Crate.',
                    type: 'info',
                  })
                }
                className="text-emerald-400 hover:underline text-[11px] font-medium block pt-1"
              >
                + Import to Local Crate
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 p-5 shadow-sm">
          <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">
            SPOTIFY IMPORT QUEUE (READY FOR REKORDBOX)
          </h4>
          <div className="space-y-2">
            {filteredTracks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3 bg-[#1b1c22]/40 border border-white/[0.05] rounded-lg flex items-center justify-between text-xs hover:border-white/[0.1] transition-colors"
              >
                <div>
                  <div className="font-medium text-white">{t.title}</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5">
                    {t.artist} • <span className="font-mono text-zinc-300">{t.bpm} BPM</span> •{' '}
                    <span className="font-mono text-cyan-400">{t.key}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    addToSetlist(t);
                    addToast({
                      title: 'TRACK ADDED',
                      message: `${t.title} imported from Spotify to Setlist.`,
                      type: 'success',
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-[#E53558]/50 hover:text-[#E53558] text-zinc-200 text-xs font-medium transition-colors"
                >
                  + Import to Set
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // mode === 'soundcloud'
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-6 space-y-4 font-sans">
      <div className="border border-white/[0.08] bg-[#14151a] p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
          <div>
            <h3 className="font-semibold text-base text-white tracking-wide uppercase flex items-center gap-2">
              <Radio size={18} className="text-amber-500" />
              SOUNDCLOUD PRO // UNRELEASED DUBS &amp; LIVE ARCHIVE
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Lossless WAV upload pipeline, private secret dubs sharing, and automated chapter marker syncing.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-400 text-xs font-mono font-medium">
            Next Pro Unlimited
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
            <div className="font-semibold text-white">Secret Dubs (Private Playlist)</div>
            <div className="text-zinc-500 text-[11px] font-mono">12 Unreleased Tracks • Secret Token Link</div>
            <button
              onClick={() =>
                addToast({
                  title: 'LINK COPIED',
                  message: 'Secret dubs link copied to clipboard.',
                  type: 'info',
                })
              }
              className="text-amber-400 hover:underline text-[11px] font-medium block pt-1"
            >
              Copy Private Inner Circle URL
            </button>
          </div>
          <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
            <div className="font-semibold text-white">Live at Corsica Studios (Room 2)</div>
            <div className="text-zinc-500 text-[11px] font-mono">02:14:20 • 24 Chapter Markers Sync</div>
            <button
              onClick={() =>
                addToast({
                  title: 'METADATA SYNCED',
                  message: 'Chapter markers pushed to SoundCloud.',
                  type: 'info',
                })
              }
              className="text-amber-400 hover:underline text-[11px] font-medium block pt-1"
            >
              Sync Timestamps &amp; Tracklist
            </button>
          </div>
          <div className="p-4 bg-[#1b1c22]/50 border border-white/[0.06] rounded-xl space-y-1.5 shadow-sm">
            <div className="font-semibold text-white">Knight Club Session 03</div>
            <div className="text-zinc-500 text-[11px] font-mono">14,200 Plays • Public DJ Mix</div>
            <button
              onClick={() =>
                addToast({
                  title: 'STATS PULLED',
                  message: 'Analytics updated from SoundCloud API.',
                  type: 'info',
                })
              }
              className="text-amber-400 hover:underline text-[11px] font-medium block pt-1"
            >
              Refresh Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar border border-white/[0.08] rounded-xl bg-[#14151a]/50 p-5 shadow-sm">
        <h4 className="font-semibold text-xs text-zinc-400 uppercase tracking-wider mb-3">
          UNRELEASED DUBS INGESTION
        </h4>
        <div className="space-y-2 text-xs">
          {filteredTracks.map((t) => (
            <div
              key={t.id}
              className="p-3 bg-[#1b1c22]/40 border border-white/[0.05] rounded-lg flex items-center justify-between hover:border-white/[0.1] transition-colors"
            >
              <div>
                <div className="font-medium text-white">{t.title}</div>
                <div className="text-zinc-400 text-[11px] mt-0.5">
                  {t.artist} • <span className="font-mono text-zinc-300">24-bit 48kHz WAV</span> •{' '}
                  <span className="font-mono text-cyan-400">{t.bpm} BPM</span>
                </div>
              </div>
              <button
                onClick={() =>
                  addToast({
                    title: 'MASTER DOWNLOADED',
                    message: `Downloaded ${t.title} master audio to local library.`,
                    type: 'success',
                  })
                }
                className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-amber-500/50 text-zinc-200 text-xs flex items-center gap-1.5 transition-colors font-medium"
              >
                <Download size={12} />
                <span>Download Master</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
