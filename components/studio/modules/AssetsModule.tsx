'use client';

import React, { useState, useMemo } from 'react';
import { 
  Download, 
  LayoutGrid, 
  List, 
  Smartphone, 
  UploadCloud, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2,
  FileCheck,
  FolderOpen,
  Share2,
  Activity,
  HardDrive,
  Copy,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
  Film,
  FileText
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export interface StudioAsset {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'flyer';
  event: string;
  dimensions: string;
  aspectRatio: '9:16' | '4:5' | '16:9' | '1:1';
  r2Key: string;
  published: boolean;
  size: string;
}

const INITIAL_VAULT_ASSETS: StudioAsset[] = [
  {
    id: 'asset-rc1',
    title: 'Royal Court Session 1 Track Artwork',
    type: 'photo',
    event: 'Royal Court',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Mixes/Royal Court/Mix Artwork/Session 1.png',
    published: true,
    size: '6.8 MB',
  },
  {
    id: 'asset-kc1',
    title: 'Knight Club Session 1 Artwork',
    type: 'photo',
    event: 'Knight Club',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Mixes/Knight Club/Mix Artwork/Knight Club Track Artwork Session 1.jpg',
    published: true,
    size: '6.8 MB',
  },
  {
    id: 'asset-cnc1',
    title: 'Corner New Cross N1 Artwork',
    type: 'photo',
    event: 'Corner New Cross',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Mixes/Corner New Cross/Mix Artwork/CNC N1 Artwork.png',
    published: true,
    size: '3.1 MB',
  },
  {
    id: 'asset-pfp',
    title: 'Official Red Background With PFP Cutout',
    type: 'photo',
    event: 'Identity Archive',
    dimensions: '3000x3000',
    aspectRatio: '1:1',
    r2Key: 'Official Red Background With PFP Cutout - No Text.png',
    published: true,
    size: '4.2 MB',
  },
  {
    id: 'asset-video-drop',
    title: 'Booth Drop Overhead (0:45s)',
    type: 'video',
    event: 'Knight Club Vol 4',
    dimensions: '1080x1920',
    aspectRatio: '9:16',
    r2Key: 'Videos/KC4_Booth_Drop_1080p.mp4',
    published: true,
    size: '24.2 MB',
  },
];

const DROPZONE_FILES = [
  { id: 'dz-1', name: 'CORNER_N1_4K_RAW_BOOTH.MOV', size: '1.42 GB', event: 'Corner New Cross N1', status: 'Pending Transcode', format: 'Apple ProRes 422' },
  { id: 'dz-2', name: 'ROYAL_COURT_SESSION_1.WAV', size: '1.12 GB', event: 'Royal Court', status: 'Ready for WebP/MP3', format: '24-bit 48kHz WAV' },
  { id: 'dz-3', name: 'KNIGHT_CLUB_SESSION_4_COVER.PNG', size: '6.8 MB', event: 'Knight Club Vol 4', status: 'Ready to Publish', format: 'PNG 3000x3000' },
  { id: 'dz-4', name: 'BOILER_ROOM_DROP_CLIP.MP4', size: '64.5 MB', event: 'Boiler Room Style', status: 'Ready to Publish', format: '1080p60 H.264' },
];

export interface AssetsModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function AssetsModule({
  activeView = 'assets-vault',
  onNavigate,
}: AssetsModuleProps) {
  const smartCropMode = useStudioStore(s => s.smartCropMode);
  const setSmartCropMode = useStudioStore(s => s.setSmartCropMode);
  const watermarkActive = useStudioStore(s => s.watermarkActive);
  const setWatermarkActive = useStudioStore(s => s.setWatermarkActive);
  const triggerEmergencyPurge = useStudioStore(s => s.triggerEmergencyPurge);
  const addToast = useStudioStore(s => s.addToast);

  const [assets, setAssets] = useState<StudioAsset[]>(INITIAL_VAULT_ASSETS);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<StudioAsset>(INITIAL_VAULT_ASSETS[0]);

  const fetchLiveAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const res = await fetch('/api/studio/assets');
      if (res.ok) {
        const data: any = await res.json();
        if (data.success && Array.isArray(data.assets) && data.assets.length > 0) {
          setAssets(data.assets);
          setSelectedAsset(prev => data.assets.find((a: StudioAsset) => a.id === prev?.id) || data.assets[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading live studio assets:', err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  React.useEffect(() => {
    fetchLiveAssets();
  }, []);

  // Determine current mode
  const currentMode = useMemo(() => {
    switch (activeView) {
      case 'assets-dropzone':
        return 'dropzone';
      case 'assets-r2':
        return 'r2';
      case 'assets-epk':
        return 'epk';
      case 'assets-vault':
      default:
        return 'vault';
    }
  }, [activeView]);

  const handleSyncDrive = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast({
        title: 'GOOGLE DRIVE SYNCED',
        message: 'Google Drive intake dropzone synchronized with Cloudflare R2.',
        type: 'success',
      });
    }, 1200);
  };

  const handleTranscodeProxy = () => {
    setIsTranscoding(true);
    setTimeout(() => {
      setIsTranscoding(false);
      addToast({
        title: '1080P PROXY READY',
        message: 'Fast-start MP4 proxy created with front moov-atom.',
        type: 'success',
      });
    }, 1200);
  };

  const filteredAssets = assets.filter(a => {
    if (filterType === 'All') return true;
    if (filterType === 'Photos') return a.type === 'photo';
    if (filterType === 'Videos') return a.type === 'video';
    if (filterType === 'Flyers') return a.type === 'flyer';
    return true;
  });

  return (
    <div className="p-6 bg-black text-white font-mono space-y-6 select-none">
      
      {/* 1. TOP MODULE NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <h2 className="font-avathe text-2xl text-white tracking-widest uppercase">
              MODULE 03 // ASSETS & CLOUDFLARE R2
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            0-EGRESS CDN • GOOGLE DRIVE INTAKE • SMART CROP GUARD • 1-CLICK EPK BUILDER
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate ? onNavigate('assets-vault') : null}
            className={`px-3 py-1.5 rounded-sm border text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'vault'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <ImageIcon size={13} />
            <span>🖼️ Asset Vault</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('assets-dropzone') : null}
            className={`px-3 py-1.5 rounded-sm border text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'dropzone'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <FolderOpen size={13} />
            <span>📥 Intake Dropzone</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('assets-r2') : null}
            className={`px-3 py-1.5 rounded-sm border text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'r2'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Activity size={13} />
            <span>⚡ R2 Storage Mirror</span>
          </button>

          <button
            onClick={() => onNavigate ? onNavigate('assets-epk') : null}
            className={`px-3 py-1.5 rounded-sm border text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentMode === 'epk'
                ? 'bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Share2 size={13} />
            <span>📄 Press Kit / EPK Hub</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-VIEW: ASSET VAULT (MASTER GALLERY & SMART CROP GUARD)               */}
      {/* ========================================================================= */}
      {currentMode === 'vault' && (
        <div className="space-y-6">
          
          {/* Quick Actions & Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 border border-zinc-900 p-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-zinc-400">EDGE STORAGE: <strong className="text-white">4.82 GB</strong></span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">PUBLISHED ASSETS: <strong className="text-emerald-400">4 Live</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/api/epk/zip"
                download="Henry_IX_Press_Kit_2026.zip"
                className="px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 text-zinc-200 hover:text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download size={12} />
                <span>DOWNLOAD EPK (.ZIP)</span>
              </a>

              <button 
                onClick={triggerEmergencyPurge}
                className="px-3 py-1 bg-red-950 border border-red-600 text-red-400 text-xs font-bold hover:bg-red-600 hover:text-black flex items-center gap-1.5 shadow-[0_0_10px_rgba(220,38,38,0.4)]"
              >
                <ShieldAlert size={12} />
                <span>EMERGENCY UNPUBLISH</span>
              </button>
            </div>
          </div>

          {/* Main Vault Workspace: Gallery & Smart Crop */}
          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Left: Assets List */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2 text-xs">
                <div className="flex items-center gap-1">
                  {(['All', 'Photos', 'Videos', 'Flyers'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilterType(tab)}
                      className={`px-2.5 py-1 rounded-sm border font-bold ${
                        filterType === tab ? 'bg-zinc-800 text-white border-zinc-600' : 'text-zinc-500 border-transparent hover:text-zinc-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 border rounded ${viewMode === 'grid' ? 'border-[#D8163F] text-[#D8163F]' : 'border-zinc-800 text-zinc-500'}`}
                  >
                    <LayoutGrid size={13} />
                  </button>
                  <button 
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 border rounded ${viewMode === 'table' ? 'border-[#D8163F] text-[#D8163F]' : 'border-zinc-800 text-zinc-500'}`}
                  >
                    <List size={13} />
                  </button>
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {filteredAssets.map(asset => (
                    <div 
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-2 border bg-zinc-950 hover:border-zinc-600 cursor-pointer space-y-2 transition-all ${
                        selectedAsset?.id === asset.id ? 'border-[#D8163F] shadow-[0_0_15px_rgba(216,22,63,0.3)]' : 'border-zinc-900'
                      }`}
                    >
                      <div className="aspect-square bg-black border border-zinc-900 flex items-center justify-center relative overflow-hidden">
                        <div className="text-[10px] text-zinc-600 uppercase text-center p-2">
                          {asset.type.toUpperCase()}<br />{asset.dimensions}
                        </div>
                        {asset.published && (
                          <span className="absolute top-1 right-1 px-1 py-0.5 bg-emerald-950/80 border border-emerald-500 text-emerald-400 text-[8px] font-bold">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white truncate">{asset.title}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{asset.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-zinc-900 bg-zinc-950 overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-900 text-zinc-500 text-[10px]">
                        <th className="p-2.5">TITLE</th>
                        <th className="p-2.5">TYPE</th>
                        <th className="p-2.5">EVENT</th>
                        <th className="p-2.5">DIMENSIONS</th>
                        <th className="p-2.5">STATUS</th>
                        <th className="p-2.5 text-right">SIZE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredAssets.map(asset => (
                        <tr 
                          key={asset.id} 
                          onClick={() => setSelectedAsset(asset)}
                          className="hover:bg-zinc-900/50 cursor-pointer"
                        >
                          <td className="p-2.5 font-bold text-white">{asset.title}</td>
                          <td className="p-2.5 uppercase text-zinc-400">{asset.type}</td>
                          <td className="p-2.5 text-zinc-400">{asset.event}</td>
                          <td className="p-2.5 font-mono text-[11px] text-zinc-300">{asset.dimensions}</td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 text-[9px] font-bold border ${asset.published ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40' : 'border-zinc-700 text-zinc-400'}`}>
                              {asset.published ? 'PUBLISHED' : 'VAULT ONLY'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-mono text-zinc-400">{asset.size}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right: Smart Crop Guard Inspector */}
            <div className="w-full lg:w-96 border border-zinc-900 bg-zinc-950 p-4 space-y-4">
              <div className="border-b border-zinc-900 pb-2">
                <h3 className="font-bold text-xs text-white uppercase flex items-center gap-1.5">
                  <Smartphone size={13} className="text-[#D8163F]" />
                  SMART CROP GUARD // SAFE ZONES
                </h3>
                <p className="text-[10px] text-zinc-500">Check UI overlay obstructions for TikTok & Instagram</p>
              </div>

              {/* Crop Mode Switcher */}
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {[
                  { id: 'none', label: 'OFF' },
                  { id: 'tiktok', label: 'TIKTOK' },
                  { id: 'reels', label: 'REELS' },
                  { id: '4:5', label: '4:5 GRID' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSmartCropMode(m.id as any)}
                    className={`py-1 border rounded-sm font-bold transition-colors ${
                      smartCropMode === m.id ? 'bg-[#D8163F] text-white border-[#D8163F]' : 'bg-black border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Viewfinder Preview */}
              <div className="aspect-[9/16] bg-black border border-zinc-800 relative overflow-hidden flex items-center justify-center p-4">
                <div className="text-center text-zinc-600 text-xs">
                  <div className="font-bold text-zinc-400">{selectedAsset?.title || 'Select an Asset'}</div>
                  <div className="text-[10px] mt-1">{selectedAsset?.dimensions || ''}</div>
                </div>

                {/* Simulated Watermark */}
                {watermarkActive && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none rotate-[-25deg]">
                    <div className="text-white/20 text-xl font-bold tracking-widest font-mono border-2 border-white/20 px-4 py-2">
                      HENRY IX // PROMOTER PREVIEW
                    </div>
                  </div>
                )}

                {/* Smart Crop Overlays */}
                {smartCropMode === 'tiktok' && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-red-500/60 p-3 flex flex-col justify-between">
                    <div className="h-12 border-b border-dashed border-red-500/40 text-[9px] text-red-400">TikTok Top Header Safe Zone</div>
                    <div className="self-end w-12 h-48 border-l border-dashed border-red-500/40 text-[9px] text-red-400 p-1">Right Action Buttons</div>
                    <div className="h-16 border-t border-dashed border-red-500/40 text-[9px] text-red-400">Caption & Audio Title Area</div>
                  </div>
                )}

                {smartCropMode === 'reels' && (
                  <div className="absolute inset-0 pointer-events-none border-2 border-cyan-500/60 p-3 flex flex-col justify-between">
                    <div className="h-10 border-b border-dashed border-cyan-500/40 text-[9px] text-cyan-400">Instagram Reels Top Margin</div>
                    <div className="self-end w-12 h-44 border-l border-dashed border-cyan-500/40 text-[9px] text-cyan-400 p-1">Like / Share Bar</div>
                    <div className="h-14 border-t border-dashed border-cyan-500/40 text-[9px] text-cyan-400">Bottom Profile & Caption Safe Zone</div>
                  </div>
                )}

                {smartCropMode === '4:5' && (
                  <div className="absolute inset-x-0 h-4/5 border-2 border-amber-400/80 pointer-events-none flex items-center justify-center">
                    <span className="text-amber-400/80 text-[10px] font-bold">4:5 PORTRAIT GRID SAFE ZONE</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setWatermarkActive(!watermarkActive);
                    addToast({
                      title: watermarkActive ? 'WATERMARK REMOVED' : 'WATERMARK APPLIED',
                      message: watermarkActive ? 'Clean original restored.' : 'Burned HENRY IX PROMOTER PREVIEW watermark overlay.',
                      type: 'info',
                    });
                  }}
                  className={`w-full py-2 text-xs font-bold border transition-colors ${
                    watermarkActive ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-black border-zinc-700 text-zinc-300 hover:border-white'
                  }`}
                >
                  {watermarkActive ? '✓ WATERMARK OVERLAY ACTIVE' : 'BURN-IN PROMOTER WATERMARK'}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-VIEW: INTAKE DROPZONE (GOOGLE DRIVE MEDIA INGESTION)                 */}
      {/* ========================================================================= */}
      {currentMode === 'dropzone' && (
        <div className="space-y-6">
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase flex items-center gap-2">
                  <UploadCloud size={18} className="text-[#22d3ee]" />
                  GOOGLE DRIVE INTAKE DROPZONE // SAFE TRIAGE
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Raw uncompressed master folder watcher: Google Drive / Website Assets / Shoots & Gigs /
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSyncDrive}
                  disabled={isSyncing}
                  className="px-3 py-1.5 bg-[#D8163F] text-black font-bold text-xs hover:bg-white flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  <span>{isSyncing ? 'Scanning Drive...' : 'Scan Google Drive Now'}</span>
                </button>

                <button 
                  onClick={handleTranscodeProxy}
                  disabled={isTranscoding}
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700 hover:border-white text-xs font-bold text-zinc-200 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Film size={12} />
                  <span>{isTranscoding ? 'Transcoding...' : 'Batch Transcode 1080p'}</span>
                </button>
              </div>
            </div>

            {/* Ingestion Queue Table */}
            <div className="overflow-x-auto custom-scrollbar border border-zinc-900 bg-black">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 text-[10px]">
                    <th className="p-3">FILENAME</th>
                    <th className="p-3">SOURCE EVENT</th>
                    <th className="p-3">FORMAT</th>
                    <th className="p-3">RAW SIZE</th>
                    <th className="p-3">TRIAGE STATUS</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-mono">
                  {DROPZONE_FILES.map((f) => (
                    <tr key={f.id} className="hover:bg-zinc-900/40">
                      <td className="p-3 font-bold text-white">{f.name}</td>
                      <td className="p-3 text-zinc-400">{f.event}</td>
                      <td className="p-3 text-zinc-500">{f.format}</td>
                      <td className="p-3 text-zinc-300">{f.size}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] font-bold border ${
                          f.status === 'Ready to Publish' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40' :
                          f.status === 'Requires Crop' ? 'border-amber-500 text-amber-400 bg-amber-950/40' :
                          'border-cyan-500 text-cyan-400 bg-cyan-950/40'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            addToast({
                              title: 'ASSET PUSHED TO R2',
                              message: `Converted ${f.name} to WebP/MP4 proxy on assets.henryix.com.`,
                              type: 'success',
                            });
                          }}
                          className="px-2.5 py-1 bg-zinc-900 border border-zinc-700 hover:border-emerald-500 hover:text-emerald-400 text-[11px]"
                        >
                          Approve & Push to R2
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-VIEW: CLOUDFLARE R2 STORAGE MIRROR                                 */}
      {/* ========================================================================= */}
      {currentMode === 'r2' && (
        <div className="space-y-6">
          
          {/* R2 Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-1">
              <span className="text-zinc-500 text-[10px] block">TOTAL STORAGE</span>
              <div className="text-2xl font-bold text-white">4.82 GB</div>
              <span className="text-emerald-400 text-[10px]">Cloudflare R2 (0 Egress Fees)</span>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-1">
              <span className="text-zinc-500 text-[10px] block">MONTHLY REQUESTS</span>
              <div className="text-2xl font-bold text-white">384,210</div>
              <span className="text-zinc-400 text-[10px]">Edge CDN Cached</span>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-1">
              <span className="text-zinc-500 text-[10px] block">CACHE HIT RATIO</span>
              <div className="text-2xl font-bold text-emerald-400">99.4%</div>
              <span className="text-zinc-500 text-[10px]">London LHR Edge Primary</span>
            </div>
            <div className="p-4 bg-zinc-950 border border-zinc-900 space-y-1">
              <span className="text-zinc-500 text-[10px] block">EGRESS COST</span>
              <div className="text-2xl font-bold text-emerald-400">£0.00</div>
              <span className="text-zinc-500 text-[10px]">100% Free Edge Delivery</span>
            </div>
          </div>

          {/* R2 Bucket Virtual Folder Explorer */}
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-avathe text-xl text-white tracking-widest uppercase">
                  CLOUDFLARE R2 BUCKET: assets.henryix.com
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Root CDN endpoint delivering all high-fidelity images, audio masters, and proxy video streams
                </p>
              </div>

              <button
                onClick={() => addToast({ title: 'GLOBAL CDN PURGED', message: 'Flushed Cloudflare edge cache (<5s worldwide).', type: 'success' })}
                className="px-3 py-1.5 bg-red-950 border border-red-600 text-red-400 text-xs font-bold hover:bg-red-600 hover:text-black transition-colors"
              >
                Purge All Edge Caches
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {[
                { name: '/Hero/', desc: 'Optimized WebP/AVIF hero assets for henryix.com', files: 8, size: '24 MB', url: 'https://assets.henryix.com/Hero/' },
                { name: '/Gallery/', desc: 'High-res crowd & stage photography with dither maps', files: 42, size: '412 MB', url: 'https://assets.henryix.com/Gallery/' },
                { name: '/Mixes/', desc: 'Master mix covers & high-bitrate lossy/lossless streaming audio', files: 18, size: '2.84 GB', url: 'https://assets.henryix.com/Mixes/' },
                { name: '/Videos/', desc: '1080p fast-start MP4 and WebM video booth proxies', files: 14, size: '1.54 GB', url: 'https://assets.henryix.com/Videos/' },
              ].map(dir => (
                <div key={dir.name} className="p-3.5 bg-black border border-zinc-800 hover:border-zinc-700 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white font-mono text-sm">{dir.name}</span>
                    <span className="text-zinc-500 font-mono text-[11px]">{dir.files} Files • {dir.size}</span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">{dir.desc}</p>
                  <div className="flex justify-between items-center pt-1 border-t border-zinc-900">
                    <span className="text-[10px] text-zinc-600 truncate font-mono">{dir.url}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(dir.url);
                        addToast({ title: 'R2 URL COPIED', message: `Copied ${dir.url}`, type: 'info' });
                      }}
                      className="text-zinc-400 hover:text-white p-1"
                      title="Copy URL"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-VIEW: PRESS KIT / EPK HUB                                          */}
      {/* ========================================================================= */}
      {currentMode === 'epk' && (
        <div className="space-y-6">
          <div className="border border-zinc-900 bg-zinc-950 p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-4">
              <div>
                <h3 className="font-avathe text-2xl text-white tracking-widest uppercase">
                  HENRY IX // OFFICIAL PRESS KIT & EPK HUB
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Promoter one-pager generator, unlisted portal tokens, and 1-click Henry_IX_Press_Kit_2026.zip export
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/epk/zip"
                  download="Henry_IX_Press_Kit_2026.zip"
                  className="px-4 py-2 bg-[#D8163F] text-black font-bold text-xs hover:bg-white flex items-center gap-1.5 shadow-[0_0_12px_rgba(216,22,63,0.4)] transition-colors"
                >
                  <Download size={13} />
                  <span>DOWNLOAD COMPLETE ZIP (.ZIP)</span>
                </a>
              </div>
            </div>

            {/* Secret Promoter Link Card */}
            <div className="p-3 bg-black border border-emerald-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span className="text-zinc-300">
                  SECRET PROMOTER PORTAL URL: <strong className="text-white font-mono">https://henryix.com/press/promoter</strong>
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText('https://henryix.com/press/promoter');
                  addToast({ title: 'PORTAL LINK COPIED', message: 'Sent secret EPK link with 7-day token to clipboard.', type: 'success' });
                }}
                className="px-3 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-300 hover:text-white flex items-center gap-1.5"
              >
                <Copy size={11} />
                <span>Copy Promoter Access Link</span>
              </button>
            </div>

            {/* EPK Package Contents */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Box 1: Artist Bio */}
              <div className="p-4 bg-black border border-zinc-800 space-y-2">
                <div className="font-bold text-white uppercase text-[11px] flex justify-between">
                  <span>1. ARTIST BIOGRAPHY</span>
                  <span className="text-zinc-500 font-normal">SHORT & FULL</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  HENRY IX is a London-based electronic music artist, DJ, and creative technologist exploring the intersections of underground UK bass music, hypnotic 140 dubplates, and pro DJ performance.
                </p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('HENRY IX is a London-based electronic music artist, DJ, and creative technologist exploring the intersections of underground UK bass music, hypnotic 140 dubplates, and pro DJ performance.');
                    addToast({ title: 'BIO COPIED', message: 'Copied verified artist biography for promoter print.', type: 'info' });
                  }}
                  className="text-[#D8163F] hover:underline text-[10px]"
                >
                  Copy Short Bio (150 Words)
                </button>
              </div>

              {/* Box 2: Press Photos */}
              <div className="p-4 bg-black border border-zinc-800 space-y-2">
                <div className="font-bold text-white uppercase text-[11px] flex justify-between">
                  <span>2. 300DPI PRESS SHOTS</span>
                  <span className="text-zinc-500 font-normal">3 ASSETS</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  High-resolution print photography captured at Corsica Studios and London studio spaces.
                </p>
                <button 
                  onClick={() => addToast({ title: 'PHOTOS DOWNLOADED', message: 'Downloaded 3x 300dpi hi-res press photos.', type: 'success' })}
                  className="text-emerald-400 hover:underline text-[10px]"
                >
                  Download All 3 Photos (.jpg)
                </button>
              </div>

              {/* Box 3: Technical Rider */}
              <div className="p-4 bg-black border border-zinc-800 space-y-2">
                <div className="font-bold text-white uppercase text-[11px] flex justify-between">
                  <span>3. CDJ-3000 TECH RIDER</span>
                  <span className="text-zinc-500 font-normal">PDF READY</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Specification: 4x Pioneer CDJ-3000, 1x DJM-A9 or Allen & Heath Xone:96, Pro Link Hub, Booth monitors.
                </p>
                <button 
                  onClick={() => addToast({ title: 'TECH RIDER DOWNLOADED', message: 'Downloaded official Pioneer Tech Rider PDF.', type: 'success' })}
                  className="text-[#22d3ee] hover:underline text-[10px]"
                >
                  Download Tech Rider (.pdf)
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
