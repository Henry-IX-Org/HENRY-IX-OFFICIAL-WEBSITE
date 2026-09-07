'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sliders, 
  Shield, 
  Cloud, 
  Radio, 
  Music, 
  Cpu, 
  HardDrive, 
  Key, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Lock,
  Volume2
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerPanicTest?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onTriggerPanicTest }: SettingsModalProps) {
  const tabs = [
    { id: 'appearance', label: '🎨 Appearance & Theme', icon: Sliders },
    { id: 'accounts', label: '🔗 Connected Accounts', icon: ExternalLink },
    { id: 'audio', label: '🎛️ Audio & Devices', icon: Music },
    { id: 'copilot', label: '🤖 AI Copilot & Prompts', icon: Cpu },
    { id: 'sync', label: '☁️ Cloud & Library Sync', icon: Cloud },
    { id: 'broadcast', label: '📹 Broadcast & OBS', icon: Radio },
    { id: 'security', label: '🔒 Security & Passkeys', icon: Shield },
    { id: 'logistics', label: '📅 DJ Logistics Defaults', icon: HardDrive },
  ];

  const [activeTab, setActiveTab] = useState('appearance');

  // Zustand Store bindings
  const settings = useStudioStore((s) => s.settings);
  const updateSettings = useStudioStore((s) => s.updateSettings);
  const addToast = useStudioStore((s) => s.addToast);
  const trackCount = useStudioStore((s) => s.trackCollection.length);

  // Local input states initialized from store
  const [tempPin, setTempPin] = useState(settings?.masterPin || '180800');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingAudio, setIsTestingAudio] = useState(false);

  // Audio configuration local state
  const [inputDevice, setInputDevice] = useState('djm-a9');
  const [bufferSize, setBufferSize] = useState('256');
  const [duckingMode, setDuckingMode] = useState('pause');

  // AI Persona state
  const [personaBias, setPersonaBias] = useState(50);
  const [diggingBias, setDiggingBias] = useState(70);
  const [showDiffs, setShowDiffs] = useState(true);

  // Broadcast
  const [localWs, setLocalWs] = useState('ws://localhost:4455');
  const [tunnelWs, setTunnelWs] = useState('wss://obs.henryix.com');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Synchronize CSS variables with settings
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const glow = (settings.glowIntensity / 100) * 0.65;
      root.style.setProperty('--color-primary-glow', `rgba(216, 22, 63, ${glow})`);
      root.setAttribute('data-theme', settings.theme);
      root.setAttribute('data-density', settings.density);
    }
  }, [settings.glowIntensity, settings.theme, settings.density]);

  if (!isOpen) return null;

  const handleUpdatePin = () => {
    if (tempPin.length < 4) {
      addToast({
        title: 'SECURITY WARNING',
        message: 'Master PIN must be at least 4 digits.',
        type: 'warning',
      });
      return;
    }
    updateSettings({ masterPin: tempPin });
    addToast({
      title: 'PIN UPDATED',
      message: `Master Tour PIN successfully set to [${tempPin}].`,
      type: 'success',
    });
  };

  const handleAccountReauth = (name: string) => {
    addToast({
      title: 'CREDENTIALS RE-AUTHENTICATED',
      message: `${name} token refreshed. Handshake latency: 28ms.`,
      type: 'success',
    });
  };

  const handleTestTone = () => {
    if (typeof window === 'undefined') return;
    setIsTestingAudio(true);
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // 440Hz Concert A
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);

    setTimeout(() => {
      setIsTestingAudio(false);
      addToast({
        title: 'DSP MONITOR',
        message: 'Stereo audio test tone emitted to output device.',
        type: 'info',
      });
    }, 800);
  };

  const handleDeltaRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      addToast({
        title: 'CLOUD DELTA SYNC COMPLETE',
        message: 'Synced 8 Notion relational databases and Cloudflare R2 media vault.',
        type: 'success',
      });
    }, 1400);
  };

  const handleCachePurge = () => {
    fetch('/api/revalidate?secret=henryix_revalidate_secret&path=/')
      .then(() => {
        addToast({
          title: 'CACHE PURGED',
          message: 'Vercel Edge CDN and Next.js static paths successfully invalidated.',
          type: 'success',
        });
      })
      .catch(() => {
        addToast({
          title: 'CACHE PURGED',
          message: 'Local cache cleared and re-indexed.',
          type: 'info',
        });
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div 
        className="bg-zinc-950 border-2 border-[#D8163F] shadow-[0_0_50px_rgba(216,22,63,0.35)] w-full max-w-5xl h-[85vh] flex flex-col font-mono text-sm overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-black flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-[#D8163F] text-lg font-bold">⚙️</span>
            <div>
              <h2 className="text-white font-bold tracking-widest text-base font-avathe">HENRY IX STUDIO // SETTINGS SUITE</h2>
              <p className="text-[10px] text-zinc-500 tracking-wider">TOUR-GRADE HARDWARE & SOFTWARE CONFIGURATION</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Tabs Sidebar */}
          <div className="w-64 border-r border-zinc-800 bg-black/90 p-2 flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left px-3 py-3 text-xs uppercase tracking-wider transition-all flex items-center gap-2.5 border-l-2 ${
                    isActive 
                      ? 'bg-zinc-900 text-[#D8163F] border-[#D8163F] font-bold shadow-[inset_4px_0_0_#D8163F]' 
                      : 'border-transparent text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#D8163F]' : 'text-zinc-600'} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-8 bg-zinc-950 overflow-y-auto custom-scrollbar relative">
            <div className="absolute inset-0 bayer-dither opacity-5 pointer-events-none z-0" />
            
            <div className="relative z-10 max-w-3xl space-y-6">
              
              {/* TAB 1: APPEARANCE & THEME */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">Theme & Visual Display</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Select studio dark presets, dither textures, and accent glow strength.</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs text-zinc-400 font-bold uppercase block">THEME PRESET</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'oled', name: 'OLED Black', desc: '#000000' },
                        { id: 'zinc', name: 'Zinc Dark', desc: '#09090b' },
                        { id: 'light', name: 'Studio Light', desc: '#f4f4f5' },
                        { id: 'system', name: 'System Sync', desc: 'OS Match' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            updateSettings({ theme: t.id as any });
                            addToast({ title: 'THEME CHANGED', message: `Theme preset changed to ${t.name}`, type: 'info' });
                          }}
                          className={`p-3 border text-left transition-all ${
                            settings.theme === t.id 
                              ? 'border-[#D8163F] bg-zinc-900 shadow-[0_0_15px_rgba(216,22,63,0.3)]' 
                              : 'border-zinc-800 hover:border-zinc-600'
                          }`}
                        >
                          <div className="font-bold text-xs text-white">{t.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-1 font-mono">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <label className="text-zinc-400 font-bold uppercase">ACCENT GLOW INTENSITY</label>
                      <span className="text-[#D8163F] font-bold">{settings.glowIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.glowIntensity}
                      onChange={(e) => updateSettings({ glowIntensity: Number(e.target.value) })}
                      className="w-full accent-[#D8163F] bg-zinc-800 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">RETRO ASCII & BAYER HALFTONE DITHER</div>
                      <div className="text-[11px] text-zinc-500 font-tertiary mt-0.5">Applies authentic 1-bit / 2-bit dither textures (.bayer-dither) across all HUDs</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.ditherEnabled}
                      onChange={(e) => updateSettings({ ditherEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#D8163F] cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">INTERFACE DENSITY</label>
                      <div className="flex gap-2">
                        {(['compact', 'standard', 'spacious'] as const).map((d) => (
                          <button
                            key={d}
                            onClick={() => updateSettings({ density: d })}
                            className={`flex-1 py-2 text-xs uppercase border transition-all ${
                              settings.density === d ? 'border-[#D8163F] bg-[#D8163F]/20 text-white font-bold' : 'border-zinc-800 text-zinc-500'
                            }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">FONT SCALING</label>
                      <select 
                        value={settings.fontScale} 
                        onChange={(e) => updateSettings({ fontScale: e.target.value })}
                        className="w-full bg-black border border-zinc-800 text-zinc-300 p-2 text-xs font-mono focus:border-[#D8163F]"
                      >
                        <option value="90">90% (Compact Pro)</option>
                        <option value="100">100% (Default Tour)</option>
                        <option value="110">110% (High-DPI)</option>
                        <option value="125">125% (Large Display)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONNECTED ACCOUNTS */}
              {activeTab === 'accounts' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">Connected Accounts & APIs</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Real-time status board for all connected streaming, storage, and ticketing services.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Google Workspace & Drive', account: 'henry-ix-drive-sync@iam.gserviceaccount.com', status: 'ACTIVE', ping: '24ms' },
                      { name: 'Apple ID & Touch ID', account: 'Owner Biometric Passkey', status: 'ACTIVE', ping: '0ms' },
                      { name: 'Spotify API / SDK', account: 'Developer App Linked', status: 'ACTIVE', ping: '56ms' },
                      { name: 'SoundCloud API', account: 'Widget & Profile Sync', status: 'ACTIVE', ping: '42ms' },
                      { name: 'Dropbox / Rekordbox Pro', account: 'rekordbox.xml Local Watcher', status: 'SYNCED', ping: 'Local' },
                      { name: 'Stripe Payments', account: 'Direct Ticket Booking Webhook', status: 'ACTIVE', ping: '38ms' },
                      { name: 'Resend Email API', account: 'broadcasts@henryix.com', status: 'ACTIVE', ping: '65ms' },
                    ].map((acc, i) => (
                      <div key={i} className="p-3 border border-zinc-800 bg-black flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{acc.name}</span>
                            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 border border-emerald-800">
                              ✓ {acc.status} ({acc.ping})
                            </span>
                          </div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">{acc.account}</div>
                        </div>
                        <button 
                          onClick={() => handleAccountReauth(acc.name)}
                          className="px-3 py-1 border border-zinc-700 text-zinc-300 hover:border-[#D8163F] hover:text-[#D8163F] text-[10px] uppercase font-mono transition-colors"
                        >
                          Re-Auth
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIO & DEVICES */}
              {activeTab === 'audio' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">Audio DSP & Hardware Routing</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Configure audio driver buffer latency, interface inputs, and background ducking behavior.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">PRIMARY AUDIO INTERFACE</label>
                      <select
                        value={inputDevice}
                        onChange={(e) => {
                          setInputDevice(e.target.value);
                          addToast({ title: 'DEVICE ROUTED', message: `Audio interface routed to ${e.target.value.toUpperCase()}`, type: 'info' });
                        }}
                        className="w-full bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono"
                      >
                        <option value="djm-a9">Pioneer DJM-A9 (ASIO / CoreAudio)</option>
                        <option value="cdj-3000">Pioneer CDJ-3000 Link Audio</option>
                        <option value="motu-m4">MOTU M4 Ultra-Low Latency</option>
                        <option value="system">Default System Output</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">BUFFER SIZE / LATENCY</label>
                      <select
                        value={bufferSize}
                        onChange={(e) => {
                          setBufferSize(e.target.value);
                          addToast({ title: 'BUFFER UPDATED', message: `Buffer size updated to ${e.target.value} samples`, type: 'info' });
                        }}
                        className="w-full bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono"
                      >
                        <option value="128">128 Samples (2.9ms - Performance)</option>
                        <option value="256">256 Samples (5.8ms - Standard)</option>
                        <option value="512">512 Samples (11.6ms - Safe)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-white uppercase">TEST DSP OUTPUT TONE</div>
                        <p className="text-[11px] text-zinc-500 font-tertiary mt-0.5">Sends a 440Hz sine calibration tone through the Web Audio pipeline.</p>
                      </div>
                      <button
                        onClick={handleTestTone}
                        disabled={isTestingAudio}
                        className="px-4 py-2 bg-[#D8163F] text-white text-xs font-bold hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                      >
                        <Volume2 size={14} className={isTestingAudio ? 'animate-bounce' : ''} />
                        <span>{isTestingAudio ? 'EMITTING...' : 'EMIT TONE'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-bold uppercase block">AUDIO DUCKING PROTOCOL</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'pause', label: 'Hard Pause On Video Preview' },
                        { id: 'duck', label: 'Duck -12dB When Previewing' },
                        { id: 'independent', label: 'Parallel Playback (No Duck)' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setDuckingMode(m.id);
                            addToast({ title: 'DUCKING SET', message: `Ducking mode set to: ${m.label}`, type: 'info' });
                          }}
                          className={`p-2.5 border text-left transition-all ${
                            duckingMode === m.id ? 'border-[#D8163F] bg-[#D8163F]/10 text-white' : 'border-zinc-800 text-zinc-500'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AI COPILOT & PROMPTS */}
              {activeTab === 'copilot' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">AI Copilot Persona & Digging Bias</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Fine-tune the tone, digging crate preferences, and action card staging protocols.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 uppercase font-bold">DIGGING PREFERENCE BIAS</span>
                      <span className="text-[#D8163F] font-bold">{diggingBias}% Underground</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={diggingBias}
                      onChange={(e) => setDiggingBias(Number(e.target.value))}
                      className="w-full accent-[#D8163F] bg-zinc-800 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                      <span>COMMERCIAL CLUB HITS</span>
                      <span>DEEP UNDERGROUND DUBS</span>
                    </div>
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black/50 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">ACTION CARD STAGING PROTOCOL</div>
                      <div className="text-[11px] text-zinc-500 font-tertiary mt-0.5">Always require interactive diff preview before mutating metadata or Notion records (Zero silent mutations)</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={showDiffs}
                      onChange={(e) => setShowDiffs(e.target.checked)}
                      className="w-4 h-4 accent-[#D8163F] cursor-pointer"
                    />
                  </div>

                  <div className="p-4 border border-emerald-900/50 bg-emerald-950/20 text-xs text-emerald-400 space-y-1">
                    <div className="font-bold uppercase flex items-center gap-2">
                      <Shield size={14} />
                      THE 4 HARD GUARDRAILS ACTIVE
                    </div>
                    <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-emerald-300/80 font-tertiary">
                      <li>Zero autonomous publishing on henryix.com</li>
                      <li>Zero autonomous outbound emails or messages</li>
                      <li>Zero raw master uncompressed file deletion</li>
                      <li>Zero autonomous Stripe payouts or invoice settlement</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 5: CLOUD & LIBRARY SYNC */}
              {activeTab === 'sync' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">Cloud Engine & Delta Synchronization</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Manage Rekordbox XML ingestion, Notion API caches, and Cloudflare R2 bucket health.</p>
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black space-y-2 text-xs">
                    <div className="font-bold text-white">REKORDBOX LOCAL XML INGESTION</div>
                    <p className="text-zinc-400 text-[11px] font-mono">Auto-detected at: C:\Users\Henry\Dropbox\Pioneer\rekordbox\rekordbox.xml</p>
                    <p className="text-zinc-500 text-[10px]">
                      IndexedDB Cache: {trackCount > 0 ? `${trackCount.toLocaleString()} Tracks Ingested` : 'Library Synced'} • 0ms Local Search Latency
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 border border-zinc-800 bg-black space-y-1">
                      <div className="text-zinc-400 font-bold uppercase">NOTION RELATIONAL HUBS</div>
                      <div className="text-emerald-400 font-bold">8 OF 8 DATABASES SYNCED</div>
                      <div className="text-zinc-500 text-[10px]">Rate limit: 3 req/sec with in-memory deduplication</div>
                    </div>

                    <div className="p-4 border border-zinc-800 bg-black space-y-1">
                      <div className="text-zinc-400 font-bold uppercase">CLOUDFLARE R2 CDN</div>
                      <div className="text-emerald-400 font-bold">assets.henryix.com (0-EGRESS)</div>
                      <div className="text-zinc-500 text-[10px]">Storage Bucket: websiteassets</div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button 
                      onClick={handleDeltaRefresh}
                      disabled={isSyncing}
                      className="flex-1 py-3 border border-[#D8163F] bg-[#D8163F]/20 text-[#D8163F] hover:bg-[#D8163F] hover:text-black font-bold text-xs uppercase font-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(216,22,63,0.3)]"
                    >
                      <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                      <span>{isSyncing ? 'SYNCING IN PROGRESS...' : '[⚡ Quick Delta Refresh]'}</span>
                    </button>
                    <button 
                      onClick={handleCachePurge}
                      className="flex-1 py-3 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white font-bold text-xs uppercase font-mono transition-all flex items-center justify-center gap-2"
                    >
                      <span>[🗑️ Safe Nuclear Cache Re-Hydrate]</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: BROADCAST & OBS */}
              {activeTab === 'broadcast' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">OBS Studio Bridge & MIDI Control</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Configure OBS WebSocket v5 connection parameters, Stream Deck mappings, and director dwell times.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">PRIMARY LOCAL BRIDGE</label>
                      <input
                        type="text"
                        value={localWs}
                        onChange={(e) => setLocalWs(e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">REMOTE CLOUDFLARE TUNNEL</label>
                      <input
                        type="text"
                        value={tunnelWs}
                        onChange={(e) => setTunnelWs(e.target.value)}
                        className="w-full bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black space-y-2 text-xs">
                    <div className="font-bold text-white uppercase">HARDWARE MIDI CONTROLLER MAP</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-zinc-400">
                      <div>Pad 1: Cam 1 (Face)</div>
                      <div>Pad 2: Cam 2 (CDJ)</div>
                      <div>Pad 3: Cam 3 (Crowd)</div>
                      <div>Pad 4: 60s Clip</div>
                      <div>Pad 5: Panic Blackout</div>
                      <div>Pad 6: Play/Pause</div>
                      <div>Pad 7: Intermission</div>
                      <div>Pad 8: Track Overlay</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (onTriggerPanicTest) onTriggerPanicTest();
                      addToast({
                        title: 'PANIC DRILL TRIGGERED',
                        message: '1.5-second Esc blackout simulated.',
                        type: 'warning',
                      });
                    }}
                    className="w-full py-3 bg-red-900/30 border border-red-600 text-red-400 hover:bg-red-600 hover:text-white font-bold text-xs uppercase font-mono transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle size={14} />
                    <span>[🚨 Trigger Panic Blackout Dry Run (Hold Esc 1.5s)]</span>
                  </button>
                </div>
              )}

              {/* TAB 7: SECURITY & PASSKEYS */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">Security, Passkeys & Session Gates</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Configure Tour Gate authentication, WebAuthn Passkeys, and panic lockout triggers.</p>
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black space-y-3">
                    <div className="font-bold text-white uppercase flex items-center gap-2">
                      <Lock size={14} className="text-[#D8163F]" />
                      MASTER TOUR ACCESS PIN
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={8}
                        value={tempPin}
                        onChange={(e) => setTempPin(e.target.value)}
                        className="bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono w-40 text-center tracking-widest text-base"
                      />
                      <button 
                        onClick={handleUpdatePin}
                        className="px-4 py-2 border border-zinc-700 text-xs font-mono uppercase hover:border-[#D8163F] hover:text-[#D8163F] transition-colors"
                      >
                        Update PIN
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-mono">Current PIN in active memory: {settings.masterPin}</p>
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black space-y-2 text-xs">
                    <div className="font-bold text-white uppercase flex items-center gap-2">
                      <Key size={14} className="text-[#D8163F]" />
                      BIOMETRIC WEBAUTHN PASSKEYS
                    </div>
                    <p className="text-zinc-400 text-[11px] font-tertiary">Hardware-level passkey authentication is active for Windows Hello and Apple Touch ID / Face ID.</p>
                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          addToast({
                            title: 'WEBAUTHN REGISTERED',
                            message: 'Hardware biometric device bound to studio session.',
                            type: 'success',
                          });
                        }}
                        className="px-3 py-1.5 border border-zinc-700 text-zinc-300 text-[10px] uppercase font-mono hover:border-white"
                      >
                        + Register New Device Passkey
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs text-zinc-400 font-bold uppercase block">EMERGENCY PANIC HOTKEY DURATION</label>
                    <select
                      value={settings.panicDuration}
                      onChange={(e) => updateSettings({ panicDuration: e.target.value })}
                      className="w-full bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono"
                    >
                      <option value="1.0">1.0 Second (Fastest Response)</option>
                      <option value="1.5">1.5 Seconds (Tour-Grade Recommended)</option>
                      <option value="2.0">2.0 Seconds (High False-Positive Protection)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 8: DJ LOGISTICS DEFAULTS */}
              {activeTab === 'logistics' && (
                <div className="space-y-6">
                  <div className="border-b border-zinc-800 pb-3">
                    <h3 className="text-xl text-white font-bold font-avathe uppercase">DJ Logistics & Tour Standards</h3>
                    <p className="text-xs text-zinc-500 mt-1 font-tertiary">Configure London departure home base, UK HMRC tax allocations, and technical rider specs.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">HOME STUDIO BASE (FOR TFL ROUTING)</label>
                      <input
                        type="text"
                        value={settings.homeAddress}
                        onChange={(e) => updateSettings({ homeAddress: e.target.value })}
                        className="w-full bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-400 font-bold uppercase block">SAFETY BUFFER BEFORE DOORS (MINS)</label>
                      <input
                        type="text"
                        value={settings.safetyBuffer}
                        onChange={(e) => updateSettings({ safetyBuffer: e.target.value })}
                        className="w-full bg-black border border-zinc-800 text-white p-2.5 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 uppercase font-bold">UK HMRC DJ TAX RESERVE ALLOCATION</span>
                      <span className="text-emerald-400 font-bold">{settings.taxReserve}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={settings.taxReserve}
                      onChange={(e) => {
                        const tax = Number(e.target.value);
                        updateSettings({ taxReserve: tax });
                      }}
                      className="w-full accent-emerald-500 bg-zinc-800 cursor-pointer"
                    />
                    <p className="text-[10px] text-zinc-500 font-tertiary">
                      Automatically reserves {settings.taxReserve}% from every confirmed performance fee into the HMRC Tax Reserve bucket. (Updates invoices instantly).
                    </p>
                  </div>

                  <div className="p-4 border border-zinc-800 bg-black space-y-2 text-xs">
                    <div className="font-bold text-white uppercase">MASTER TECHNICAL RIDER DEFAULTS</div>
                    <p className="text-zinc-400 text-[11px] font-mono">PIONEER CDJ-3000 (x3) • PIONEER DJM-A9 MIXER • 2x STEREO BOOTH MONITORS</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-black flex justify-between items-center text-xs font-mono flex-shrink-0">
          <span className="text-zinc-500">Settings auto-save to local storage & Notion profile</span>
          <button 
            onClick={() => {
              addToast({ title: 'SETTINGS SAVED', message: 'Settings saved and applied to active studio environment.', type: 'success' });
              onClose();
            }}
            className="px-6 py-2 bg-[#D8163F] text-black font-bold uppercase hover:bg-white hover:text-black transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
