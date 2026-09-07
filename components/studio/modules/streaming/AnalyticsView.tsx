'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, Download } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface AnalyticsViewProps {
  streamDuration: number;
  formatDuration: (seconds: number) => string;
}

export default function AnalyticsView({ streamDuration, formatDuration }: AnalyticsViewProps) {
  const addToast = useStudioStore((s) => s.addToast);
  const [chatVelocity, setChatVelocity] = useState(42);

  // Chat velocity simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setChatVelocity((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        return Math.max(10, Math.min(85, prev + delta));
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const pastBroadcasts = [
    {
      id: 'bc-1',
      title: 'Knight Club Session 4 // Live Stream',
      date: '2026-10-18',
      duration: '02:14:20',
      peakViewers: 1240,
      avgRetention: '48m 12s',
      tracksPlayed: 24,
      fileSize: '10.4 GB MKV',
      health: '100% (0 Dropped)',
    },
    {
      id: 'bc-2',
      title: 'Knight Club Warm-Up Broadcast // 145-155 BPM',
      date: '2026-10-11',
      duration: '01:45:00',
      peakViewers: 890,
      avgRetention: '42m 30s',
      tracksPlayed: 18,
      fileSize: '7.8 GB MKV',
      health: '99.8% (12 Dropped)',
    },
    {
      id: 'bc-3',
      title: 'Corner N1 Bass Pressure Stream // UKG & Dubplates',
      date: '2026-10-04',
      duration: '02:30:15',
      peakViewers: 1520,
      avgRetention: '54m 00s',
      tracksPlayed: 31,
      fileSize: '12.1 GB MKV',
      health: '100% (0 Dropped)',
    },
    {
      id: 'bc-4',
      title: 'Boiler Room Style Showcase // Vinyl & CDJ-3000',
      date: '2026-09-27',
      duration: '01:15:00',
      peakViewers: 2100,
      avgRetention: '59m 10s',
      tracksPlayed: 15,
      fileSize: '5.9 GB MKV',
      health: '100% (0 Dropped)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Live Telemetry Health Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Framerate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">60.0 FPS</div>
          <span className="text-[11px] text-zinc-500 font-mono">Zero Jitter Lock</span>
        </div>
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Video Bitrate</span>
          <div className="text-2xl font-bold font-mono text-white">
            6,240 <span className="text-xs font-normal text-zinc-400">KBPS</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">Constant (CBR)</span>
        </div>
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Dropped Frames</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            0 <span className="text-xs font-normal text-zinc-400">(0.0%)</span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">0 ms network stall</span>
        </div>
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Audio Lossless</span>
          <div className="text-2xl font-bold font-mono text-white">
            320 <span className="text-xs font-normal text-zinc-400">KBPS</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Stereo 48kHz AAC</span>
        </div>
        <div className="p-4 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] font-mono uppercase block">Encoder Load</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">14.2%</div>
          <span className="text-[11px] text-zinc-500 font-mono">NVENC RTX Hardware</span>
        </div>
      </div>

      {/* Real-time Audience Retention & Chat Velocity Curve */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wider uppercase flex items-center gap-2">
              <TrendingUp size={14} className="text-[#3b82f6]" />
              Audience Retention Curve & Chat Flame Telemetry
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Real-time viewer density synchronized with track transitions and peak drops
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E53558]" />
              <span className="text-zinc-400">
                Live Viewers: <strong className="text-white font-mono">842 Peak</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 border-l border-white/[0.08] pl-3">
              <Flame size={13} className="text-amber-400" />
              <span className="text-zinc-400">
                Chat Velocity: <strong className="text-white font-mono">{chatVelocity} msgs/min</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Simulated 2-Hour Timeline Curve */}
        <div className="h-44 rounded-lg bg-[#0c0d10] border border-white/[0.06] p-4 relative flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />

          {/* Peak Annotation Markers */}
          <div className="relative z-10 flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>00:00 (Warm-up)</span>
            <span>00:30 (Build-up)</span>
            <span className="text-[#E53558] font-semibold">01:00 (⚡ Peak Drop: 1,240 Viewers)</span>
            <span>01:30 (Deep Dubs)</span>
            <span>02:00 (Closing)</span>
          </div>

          {/* Dynamic Waveform Graph Bars */}
          <div className="relative z-10 flex items-end gap-1.5 h-28 pt-2">
            {[35, 42, 50, 62, 70, 75, 88, 94, 98, 100, 85, 80, 82, 90, 95, 99, 92, 88, 78, 65].map(
              (val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-white/[0.04] rounded-t overflow-hidden flex flex-col justify-end group relative"
                >
                  <div
                    className={`w-full rounded-t transition-all duration-300 ${
                      val > 90
                        ? 'bg-[#E53558] shadow-[0_0_8px_rgba(229,53,88,0.5)]'
                        : val > 70
                        ? 'bg-amber-400'
                        : 'bg-emerald-400/80'
                    }`}
                    style={{ height: `${val}%` }}
                  />
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-[#1b1c22] border border-white/10 rounded px-2 py-0.5 text-[10px] text-white font-mono whitespace-nowrap z-20 pointer-events-none shadow-lg">
                    {Math.round(val * 8.42)} Viewers
                  </div>
                </div>
              )
            )}
          </div>

          <div className="relative z-10 flex justify-between text-[10px] text-zinc-400 pt-2 border-t border-white/[0.06] font-mono">
            <span>Stream Duration: {formatDuration(streamDuration)}</span>
            <span className="text-emerald-400">98% Sentiment Positive • High Track ID demand</span>
          </div>
        </div>
      </div>

      {/* Past Broadcasts Archive Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase">
            Historical Broadcasts Archive ({pastBroadcasts.length} Sessions)
          </h3>
          <button
            onClick={() => {
              const csv = pastBroadcasts
                .map(
                  (b) =>
                    `${b.date},${b.title},${b.duration},${b.peakViewers},${b.tracksPlayed},${b.health}`
                )
                .join('\n');
              const blob = new Blob([`Date,Title,Duration,PeakViewers,Tracks,Health\n${csv}`], {
                type: 'text/csv',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Henry_IX_Broadcast_Telemetry_${Date.now()}.csv`;
              a.click();
              addToast({ title: 'TELEMETRY EXPORTED', message: 'Downloaded stream analytics CSV.', type: 'success' });
            }}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download size={12} />
            <span>Export Telemetry CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 text-[10px] uppercase font-mono">
                <th className="p-3 font-medium">Session Title</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Duration</th>
                <th className="p-3 font-medium">Peak Viewers</th>
                <th className="p-3 font-medium">Avg Retention</th>
                <th className="p-3 font-medium">Tracks</th>
                <th className="p-3 font-medium">Stream Health</th>
                <th className="p-3 text-right font-medium">Master MKV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {pastBroadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="p-3 font-medium text-white">{b.title}</td>
                  <td className="p-3 text-zinc-400 font-mono text-[11px]">{b.date}</td>
                  <td className="p-3 text-zinc-300 font-mono text-[11px]">{b.duration}</td>
                  <td className="p-3 font-bold font-mono text-[#E53558]">{b.peakViewers}</td>
                  <td className="p-3 text-zinc-400">{b.avgRetention}</td>
                  <td className="p-3 text-zinc-300 font-mono">{b.tracksPlayed}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                      {b.health}
                    </span>
                  </td>
                  <td className="p-3 text-right text-zinc-400 font-mono text-[11px]">{b.fileSize}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
