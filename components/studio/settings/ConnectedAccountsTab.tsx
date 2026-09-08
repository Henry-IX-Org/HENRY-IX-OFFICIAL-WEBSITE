'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Music, 
  Cloud, 
  Radio, 
  RefreshCw, 
  Power, 
  Lock, 
  ShieldCheck, 
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Mail,
  FolderSync,
  Layers,
  Key,
  Unlink,
  Check
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { playTactileClick, playNotificationChime } from '@/lib/studioAudioFeedback';
import type { MasterService } from '@/lib/studioAuth';

interface EnrichedUserService {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  configured: boolean;
  missingEnvKeys?: string[];
  accountName?: string;
  accountUsername?: string;
  avatarUrl?: string;
  profileUrl?: string;
  connectedAt?: string;
  detail?: string;
  isExpired?: boolean;
}

export default function ConnectedAccountsTab() {
  const currentUser = useStudioStore((s) => s.currentUser);
  const addToast = useStudioStore((s) => s.addToast);

  const [loading, setLoading] = useState(false);
  const [masterServices, setMasterServices] = useState<MasterService[]>([]);
  const [userServices, setUserServices] = useState<EnrichedUserService[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Direct Personal Access Token entry state (e.g. for Are.na)
  const [tokenInputService, setTokenInputService] = useState<string | null>(null);
  const [personalTokenValue, setPersonalTokenValue] = useState('');
  const [submittingToken, setSubmittingToken] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/services');
      const data = (await res.json()) as any;
      if (data.success) {
        setIsOwner(Boolean(data.isOwner));
        setMasterServices(data.masterServices || []);
        setUserServices(data.userServices || []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle URL redirect query parameters from OAuth callbacks
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const service = params.get('service');
    const error = params.get('error');

    if (status === 'connected' && service) {
      playNotificationChime();
      addToast({
        title: 'ACCOUNT CONNECTED',
        message: `Successfully authenticated and linked ${service.toUpperCase()}.`,
        type: 'success',
      });
      // Clean up URL without page reload
      const cleanUrl = window.location.pathname + (params.get('tab') ? `?tab=${params.get('tab')}` : '');
      window.history.replaceState({}, '', cleanUrl);
      fetchServices();
    } else if (error) {
      addToast({
        title: 'CONNECTION ERROR',
        message: decodeURIComponent(error),
        type: 'error',
      });
      const cleanUrl = window.location.pathname + (params.get('tab') ? `?tab=${params.get('tab')}` : '');
      window.history.replaceState({}, '', cleanUrl);
    }
  }, [addToast, fetchServices]);

  // Toggle Master Infrastructure services (Owner only)
  const handleToggleMasterService = async (service: MasterService) => {
    if (!isOwner) return;
    playTactileClick();
    setActionInProgress(`master-${service.id}`);
    const nextConnected = !service.connected;

    try {
      const res = await fetch('/api/studio/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'master',
          serviceId: service.id,
          connected: nextConnected,
        }),
      });
      const data = (await res.json()) as any;

      if (data.success) {
        setMasterServices(data.masterServices);
        playNotificationChime();
        addToast({
          title: nextConnected ? 'SERVICE RECONNECTED' : 'SERVICE ISOLATED',
          message: `${service.name} is now ${nextConnected ? 'active' : 'offline'}. All other services remain unaffected.`,
          type: nextConnected ? 'success' : 'warning',
        });
      } else {
        addToast({ title: 'ERROR', message: data.error || 'Failed to update service', type: 'error' });
      }
    } catch {
      addToast({ title: 'ERROR', message: 'Unable to reach studio services bridge', type: 'error' });
    } finally {
      setActionInProgress(null);
    }
  };

  // Trigger OAuth Redirect
  const handleConnectOAuth = (serviceId: string) => {
    playTactileClick();
    setActionInProgress(`user-${serviceId}`);
    // Navigate directly to OAuth initiation endpoint
    window.location.href = `/api/studio/auth/oauth/${serviceId}/connect`;
  };

  // Safe Disconnect without cascading failures
  const handleDisconnectService = async (service: EnrichedUserService) => {
    playTactileClick();
    setActionInProgress(`user-${service.id}`);

    try {
      const res = await fetch(`/api/studio/auth/oauth/${service.id}/disconnect`, {
        method: 'POST',
      });
      const data = (await res.json()) as any;

      if (data.success) {
        playNotificationChime();
        addToast({
          title: 'ACCOUNT UNLINKED',
          message: `${service.name} disconnected cleanly. Core systems and other connections are unaffected.`,
          type: 'success',
        });
        fetchServices();
      } else {
        addToast({ title: 'ERROR', message: data.error || 'Failed to disconnect account', type: 'error' });
      }
    } catch {
      addToast({ title: 'ERROR', message: 'Unable to disconnect account', type: 'error' });
    } finally {
      setActionInProgress(null);
    }
  };

  // Direct Personal Token Submission (for Are.na or manual keys)
  const handleSubmitPersonalToken = async (serviceId: string) => {
    if (!personalTokenValue.trim()) return;
    setSubmittingToken(true);
    playTactileClick();

    try {
      const res = await fetch('/api/studio/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          personalToken: personalTokenValue.trim(),
        }),
      });

      const data = (await res.json()) as any;
      if (data.success) {
        playNotificationChime();
        addToast({
          title: 'TOKEN VERIFIED',
          message: data.message || `${serviceId.toUpperCase()} token linked successfully.`,
          type: 'success',
        });
        setTokenInputService(null);
        setPersonalTokenValue('');
        fetchServices();
      } else {
        addToast({ title: 'TOKEN ERROR', message: data.error || 'Verification failed', type: 'error' });
      }
    } catch {
      addToast({ title: 'ERROR', message: 'Connection timeout', type: 'error' });
    } finally {
      setSubmittingToken(false);
    }
  };

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'notion':
        return <HardDrive size={15} className="text-[#D8163F]" />;
      case 'r2':
        return <Cloud size={15} className="text-cyan-400" />;
      case 'resend':
        return <Mail size={15} className="text-emerald-400" />;
      case 'obs':
        return <Radio size={15} className="text-purple-400" />;
      case 'spotify':
        return <Music size={15} className="text-emerald-500" />;
      case 'arena':
        return <Layers size={15} className="text-zinc-200" />;
      case 'soundcloud':
        return <Music size={15} className="text-amber-500" />;
      case 'google_drive':
      case 'dropbox':
        return <FolderSync size={15} className="text-blue-400" />;
      default:
        return <ExternalLink size={15} className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Connected Accounts & Infrastructure</h3>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Modular OAuth provider engine with strict fault isolation.
          </p>
        </div>
        <button
          onClick={() => {
            playTactileClick();
            fetchServices();
            addToast({ title: 'REFRESHING SERVICES', message: 'Verifying connection status...', type: 'info' });
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#1b1c22] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors font-medium disabled:opacity-50"
          title="Refresh All Connections"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Resilience / Fault-Tolerance Notice */}
      <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-xs text-zinc-300 font-mono leading-relaxed flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-emerald-400 font-semibold uppercase tracking-wider">Zero Kill Switch Architecture:</span> Every connection operates inside an independent sandbox. Disconnecting Spotify or Are.na will never disrupt Notion, Cloudflare R2, ticket bookings, or the live website.
        </div>
      </div>

      {/* ================================================================= */}
      {/* TIER 1: MASTER STUDIO INFRASTRUCTURE (HENRY IX OWNER ONLY)         */}
      {/* ================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D8163F]" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Tier 1: Master Studio Infrastructure
            </span>
            <span className="text-[10px] font-mono text-[#D8163F] px-1.5 py-0.5 rounded bg-[#D8163F]/10 border border-[#D8163F]/20 font-semibold">
              OWNER EXCLUSIVE
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            {masterServices.filter(s => s.connected).length} / {masterServices.length} Active
          </span>
        </div>

        {/* Master Services Cards */}
        <div className="space-y-2.5 pt-1">
          {masterServices.map((service) => {
            const isBusy = actionInProgress === `master-${service.id}`;
            return (
              <div 
                key={service.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  service.connected 
                    ? 'border-white/[0.08] bg-[#14151b]' 
                    : 'border-zinc-800 bg-[#0e0f14] opacity-75'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      {getServiceIcon(service.id)}
                    </div>
                    <span className="font-semibold text-white">{service.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                      service.connected 
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                        : 'text-zinc-500 bg-zinc-800/40 border border-zinc-700/50'
                    }`}>
                      {service.connected ? '● ONLINE' : '○ ISOLATED'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1.5 pl-8">
                    {service.detail}
                  </div>
                </div>

                {isOwner && (
                  <div className="flex items-center gap-2 flex-shrink-0 pl-8 sm:pl-0">
                    <button
                      onClick={() => handleToggleMasterService(service)}
                      disabled={isBusy}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
                        service.connected
                          ? 'border-zinc-800 hover:border-zinc-700 bg-white/[0.03] text-zinc-400 hover:text-zinc-200'
                          : 'border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300'
                      } disabled:opacity-50`}
                      title={service.connected ? 'Isolate Service' : 'Reconnect Service'}
                    >
                      {isBusy ? <RefreshCw size={12} className="animate-spin" /> : <Power size={12} />}
                      <span>{service.connected ? 'Isolate' : 'Reconnect'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* TIER 2: PER-USER PERSONAL OAUTH CONNECTIONS                       */}
      {/* ================================================================= */}
      <div className="space-y-3 pt-6 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Tier 2: Personal Accounts & OAuth Connections
            </span>
            <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 font-semibold">
              USER SPECIFIC
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Operator: {currentUser?.name || 'Henry IX'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed font-mono">
          Connect your individual Spotify, Are.na, SoundCloud, or cloud storage. Credentials and tokens are saved directly to your operator profile and will not leak or conflict with other teammates.
        </p>

        {/* User Services Cards */}
        <div className="space-y-2.5 pt-1">
          {userServices.map((service) => {
            const isBusy = actionInProgress === `user-${service.id}`;
            const isEnteringToken = tokenInputService === service.id;

            return (
              <div 
                key={service.id}
                className="p-4 rounded-xl border border-white/[0.08] bg-[#14151b] flex flex-col gap-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                        {getServiceIcon(service.id)}
                      </div>
                      <span className="font-semibold text-white">{service.name}</span>
                      
                      {/* Connection State Badge */}
                      {service.connected ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                          <Check size={10} />
                          <span>CONNECTED</span>
                        </span>
                      ) : !service.configured && service.id !== 'obs' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20">
                          SETUP REQUIRED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-800/40 border border-zinc-700/50">
                          DISCONNECTED
                        </span>
                      )}

                      {service.isExpired && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20">
                          TOKEN EXPIRED
                        </span>
                      )}
                    </div>

                    {/* Account Identity Line */}
                    <div className="text-[11px] text-zinc-400 font-mono mt-1.5 pl-8 flex items-center gap-2 flex-wrap">
                      {service.connected && service.accountName ? (
                        <>
                          <span className="text-zinc-200 font-medium">@{service.accountUsername || service.accountName}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-500">Linked {service.connectedAt ? new Date(service.connectedAt).toLocaleDateString() : 'Active'}</span>
                        </>
                      ) : (
                        <span>{service.detail || 'Ready to connect'}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 pl-8 sm:pl-0">
                    {service.connected ? (
                      <button
                        onClick={() => handleDisconnectService(service)}
                        disabled={isBusy}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border border-zinc-800 hover:border-rose-900/50 hover:bg-rose-950/20 text-zinc-400 hover:text-rose-300 disabled:opacity-50"
                        title="Disconnect Account"
                      >
                        {isBusy ? <RefreshCw size={12} className="animate-spin" /> : <Unlink size={12} />}
                        <span>Disconnect</span>
                      </button>
                    ) : service.configured ? (
                      <button
                        onClick={() => handleConnectOAuth(service.id)}
                        disabled={isBusy}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border border-[#D8163F]/50 bg-[#D8163F]/15 hover:bg-[#D8163F]/25 text-white hover:border-[#D8163F] disabled:opacity-50 shadow-sm"
                      >
                        {isBusy ? <RefreshCw size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                        <span>Connect</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        {service.id === 'arena' && (
                          <button
                            onClick={() => {
                              playTactileClick();
                              setTokenInputService(isEnteringToken ? null : service.id);
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300"
                          >
                            <Key size={12} />
                            <span>Enter Access Token</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleConnectOAuth(service.id)}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                          title="Configure API credentials in environment settings"
                        >
                          <span>Connect</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Missing Environment Config Help */}
                {!service.configured && service.missingEnvKeys && service.missingEnvKeys.length > 0 && (
                  <div className="mt-1 pt-2.5 border-t border-white/[0.04] pl-8 text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-amber-500/80" />
                    <span>To activate OAuth, add to your environment:</span>
                    <span className="text-zinc-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/[0.06]">
                      {service.missingEnvKeys.join(', ')}
                    </span>
                  </div>
                )}

                {/* Direct Personal Access Token Input (Are.na) */}
                {isEnteringToken && (
                  <div className="mt-2 p-3 rounded-lg bg-[#0d0e12] border border-white/[0.08] space-y-2.5 pl-4">
                    <div className="text-[11px] text-zinc-300 font-mono">
                      Paste your <span className="text-white font-semibold">Are.na Personal Access Token</span> (from <a href="https://dev.are.na" target="_blank" rel="noreferrer" className="text-[#D8163F] underline">dev.are.na</a>):
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="password"
                        placeholder="Paste Are.na token..."
                        value={personalTokenValue}
                        onChange={(e) => setPersonalTokenValue(e.target.value)}
                        className="flex-1 bg-[#14151b] border border-white/[0.1] focus:border-[#D8163F] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                      />
                      <button
                        onClick={() => handleSubmitPersonalToken(service.id)}
                        disabled={submittingToken || !personalTokenValue.trim()}
                        className="px-3 py-1.5 rounded-lg bg-[#D8163F] hover:bg-[#b01132] text-white text-xs font-mono font-medium disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {submittingToken ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                        <span>Verify & Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
