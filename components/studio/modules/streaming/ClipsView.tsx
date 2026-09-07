'use client';

import React, { useState } from 'react';
import { Scissors, Download, Sparkles, RotateCcw, Share2, Video } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface HighlightMarker {
  id: string;
  time: string;
  seconds: number;
  note: string;
  energy: number;
}

interface ClipsViewProps {
  highlightMarkers: HighlightMarker[];
  onMarkHighlight: (note: string) => void;
}

export default function ClipsView({ highlightMarkers, onMarkHighlight }: ClipsViewProps) {
  const addToast = useStudioStore((s) => s.addToast);
  const addInstagramPost = useStudioStore((s) => s.addInstagramPost);

  const [extractingClipId, setExtractingClipId] = useState<string | null>(null);
  const [previewClipRatio, setPreviewClipRatio] = useState<'9:16' | '16:9'>('9:16');

  // Export DaVinci / Premiere EDL file
  const handleExportEDL = () => {
    let edlContent = `TITLE: HENRY_IX_BROADCAST_HIGHLIGHTS\nFCM: NON-DROP FRAME\n\n`;
    highlightMarkers.forEach((m, idx) => {
      const clipIndex = (idx + 1).toString().padStart(3, '0');
      edlContent += `${clipIndex}  AX       V     C        ${m.time}:00 ${m.time}:00 ${m.time}:00 ${m.time}:00\n* FROM CLIP NAME: MASTER_STREAM_CAPTURE.MKV\n* COMMENT: ${m.note}\n\n`;
    });

    const blob = new Blob([edlContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Henry_IX_Stream_Highlights_${Date.now()}.edl`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'EDL TIMELINE EXPORTED',
      message: 'Loaded markers exported for DaVinci Resolve & Premiere Pro.',
      type: 'success',
    });
  };

  // Extract Single Clip simulation
  const handleExtractSingleClip = (marker: HighlightMarker) => {
    setExtractingClipId(marker.id);
    setTimeout(() => {
      setExtractingClipId(null);
      addToast({
        title: '60S PROXY EXTRACTED',
        message: `Clip at ${marker.time} packaged as 1080p MP4. Ready for social handoff.`,
        type: 'success',
      });
    }, 1400);
  };

  // Send Clip to Social Grid
  const handleSendClipToSocial = (marker: HighlightMarker) => {
    addInstagramPost({
      title: `Live Drop // ${marker.note}`,
      date: 'Day of Show',
      type: 'Video Clip',
      scheduled: true,
      image: 'https://assets.henryix.com/Mixes/Knight%20Club/Mix%20Artwork/Session%204.png',
      caption: `Unreleased pressure tested live on stream at ${marker.time}. #HENRYIX #LondonUnderground`,
    });
    addToast({
      title: 'STAGED TO SOCIAL GRID',
      message: `Clip at ${marker.time} queued into 3x3 Instagram Grid.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-4 shadow-sm">
        <div>
          <h3 className="text-xs font-semibold text-white tracking-wider uppercase flex items-center gap-2">
            <Scissors size={14} className="text-[#8b5cf6]" />
            60s Highlight Clips Studio & Export Deck
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Marked stream timestamps extracted into 1080p vertical video ready for TikTok, Instagram Reels, and NLE export
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportEDL}
            className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-xs font-medium text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Download size={13} />
            <span>Export DaVinci / Premiere EDL</span>
          </button>

          <button
            onClick={() => onMarkHighlight('Manual Clip Drop')}
            className="px-3 py-1.5 rounded-lg bg-[#E53558] hover:bg-[#c92646] text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles size={13} />
            <span>+ Mark Current Timestamp</span>
          </button>
        </div>
      </div>

      {/* Dual Workbench: Clips Gallery & Trimmer Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Clips List */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
            <span className="font-semibold text-zinc-200 uppercase tracking-wider">
              Recorded Highlight Markers ({highlightMarkers.length})
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">TIMECODES REFERENCED TO MKV MASTER</span>
          </div>

          <div className="space-y-2.5">
            {highlightMarkers.map((marker) => (
              <div
                key={marker.id}
                className="p-3.5 rounded-lg bg-[#1b1c22]/60 border border-white/[0.06] hover:border-white/10 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#0c0d10] border border-white/10 flex items-center justify-center font-mono text-[11px] font-bold text-[#E53558] flex-shrink-0">
                    60s
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-white">{marker.time}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-mono">
                        ENERGY {marker.energy}/10
                      </span>
                    </div>
                    <div className="text-zinc-400 truncate text-[11px] mt-0.5">{marker.note}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    onClick={() => handleExtractSingleClip(marker)}
                    disabled={extractingClipId === marker.id}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {extractingClipId === marker.id ? (
                      <>
                        <RotateCcw size={11} className="animate-spin text-[#E53558]" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Download size={11} />
                        <span>Extract 60s</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSendClipToSocial(marker)}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 hover:bg-[#E53558]/20 hover:text-[#E53558] text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    title="Send to 3x3 Social Grid"
                  >
                    <Share2 size={11} />
                    <span>Send to Grid</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Trimmer Preview & Safe-Zone Guides */}
        <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <span className="font-semibold text-xs text-white uppercase tracking-wider">Clip Viewport Preview</span>
            <div className="flex gap-1 bg-[#0c0d10] p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setPreviewClipRatio('9:16')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                  previewClipRatio === '9:16' ? 'bg-white/[0.12] text-white' : 'text-zinc-400'
                }`}
              >
                9:16
              </button>
              <button
                onClick={() => setPreviewClipRatio('16:9')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                  previewClipRatio === '16:9' ? 'bg-white/[0.12] text-white' : 'text-zinc-400'
                }`}
              >
                16:9
              </button>
            </div>
          </div>

          <div
            className={`rounded-lg bg-[#0c0d10] border border-white/10 relative overflow-hidden flex items-center justify-center mx-auto ${
              previewClipRatio === '9:16' ? 'aspect-[9/16] w-52' : 'aspect-video w-full'
            }`}
          >
            <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none" />

            {/* Safe Zone Overlay for 9:16 */}
            {previewClipRatio === '9:16' && (
              <div className="absolute inset-0 pointer-events-none border border-red-500/30 p-2 flex flex-col justify-between text-[8px] text-red-400 font-mono">
                <div className="border-b border-dashed border-red-500/30 pb-1">Top Danger Zone</div>
                <div className="self-end w-8 h-28 border-l border-dashed border-red-500/30 p-0.5">Icons</div>
                <div className="border-t border-dashed border-red-500/30 pt-1">Captions Safe Zone</div>
              </div>
            )}

            <div className="text-center p-3 z-10">
              <Video size={28} className="mx-auto text-zinc-500 mb-2" />
              <div className="text-xs font-medium text-white">{highlightMarkers[0]?.note}</div>
              <div className="text-[10px] text-zinc-400 font-mono mt-1">{highlightMarkers[0]?.time} (60s Trim)</div>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-white/[0.06] bg-[#0c0d10] text-[11px] text-zinc-400 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-zinc-500">FORMAT:</span>
              <span className="text-white">1080p60 H.264 MP4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">AUDIO INGEST:</span>
              <span className="text-white">320 kbps Lossless</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">DESTINATION:</span>
              <span className="text-emerald-400">assets.henryix.com / Videos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
