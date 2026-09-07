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
  FolderSync
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { playTactileClick, playNotificationChime } from '@/lib/studioAudioFeedback';
import type { MasterService, UserConnectedService } from '@/lib/studioAuth';

export default function ConnectedAccountsTab() {
  const currentUser = useStudioStore((s) => s.currentUser);
  const addToast = useStudioStore((s) => s.addToast);

  const [loading, setLoading] = useState(false);
  const [masterServices, setMasterServices] = useState<MasterService[]>([]);
  const [userServices, setUserServices] = useState<UserConnectedService[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

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
          title: nextConnected ? 'SERVICE RECONNECTED' : 'SERVICE DISCONNECTED',
          message: `Master infrastructure for ${service.name} is now ${nextConnected ? 'active' : 'offline'}.`,
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

  const handleToggleUserService = async (service: UserConnectedService) => {
    playTactileClick();
    setActionInProgress(`user-${service.id}`);
    const nextConnected = !service.connected;

    try {
      const res = await fetch('/api/studio/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'user',
          serviceId: service.id,
          connected: nextConnected,
        }),
      });
      const data = (await res.json()) as any;

      if (data.success) {
        setUserServices(data.userServices);
        playNotificationChime();
        addToast({
          title: nextConnected ? 'PERSONAL ACCOUNT LINKED' : 'PERSONAL ACCOUNT UNLINKED',
          message: `Your personal ${service.name} connection was updated.`,
          type: 'success',
        });
      } else {
        addToast({ title: 'ERROR', message: data.error || 'Failed to update account', type: 'error' });
      }
    } catch {
      addToast({ title: 'ERROR', message: 'Unable to reach studio services bridge', type: 'error' });
    } finally {
      setActionInProgress(null);
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
      {/* Tab Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Connected Accounts & Infrastructure</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Two-tier multi-tenant services architecture with strict API isolation.
          </p>
        </div>
        <button
          onClick={() => {
            playTactileClick();
            fetchServices();
            addToast({ title: 'REFRESHING SERVICES', message: 'Querying connection status...', type: 'info' });
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#1b1c22] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors font-medium disabled:opacity-50"
          title="Refresh All Connections"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh All</span>
        </button>
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

        {/* Security Notice Banner */}
        <div className="p-3 rounded-xl border border-white/[0.06] bg-[#101116] text-xs text-zinc-400 font-mono leading-relaxed">
          {isOwner ? (
            <div className="flex items-start gap-2.5 text-zinc-300">
              <ShieldCheck size={16} className="text-[#D8163F] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-white font-semibold">Verified Private Server Vault:</span> All Master APIs (Notion, Cloudflare R2, Resend, Master OBS) execute strictly on the server and are isolated from other teammates. You can temporarily disconnect any master service below at any time.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 text-zinc-400">
              <Lock size={15} className="text-zinc-500 flex-shrink-0 mt-0.5" />
              <div>
                Master infrastructure is maintained exclusively by Henry IX (Owner). You can link your own individual tools in Tier 2 below.
              </div>
            </div>
          )}
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
                    ? 'border-white/[0.08] bg-[#171820]' 
                    : 'border-amber-900/30 bg-[#141215] opacity-80'
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
                        : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                    }`}>
                      {service.connected ? '● ONLINE' : '○ DISCONNECTED'}
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
                          ? 'border-amber-900/50 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300'
                          : 'border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300'
                      } disabled:opacity-50`}
                      title={service.connected ? 'Disconnect Master Service' : 'Reconnect Master Service'}
                    >
                      {isBusy ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <Power size={12} />
                      )}
                      <span>{service.connected ? 'Disconnect' : 'Reconnect'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* TIER 2: PER-USER PERSONAL CONNECTIONS (EACH OPERATOR'S TOOLS)     */}
      {/* ================================================================= */}
      <div className="space-y-3 pt-6 border-t border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Tier 2: My Personal Accounts & Integrations
            </span>
            <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 font-semibold">
              USER SPECIFIC
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Linked to {currentUser?.name || 'Operator'}
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Connect your individual Spotify, SoundCloud, Google Drive, or local OBS instances. Your personal links are bound to your profile and will not overwrite master studio assets or leak credentials to other teammates.
        </p>

        {/* User Services Cards */}
        <div className="space-y-2.5 pt-1">
          {userServices.map((service) => {
            const isBusy = actionInProgress === `user-${service.id}`;
            return (
              <div 
                key={service.id}
                className="p-4 rounded-xl border border-white/[0.08] bg-[#171820] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                      {getServiceIcon(service.id)}
                    </div>
                    <span className="font-semibold text-white">{service.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                      service.connected 
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20' 
                        : 'text-zinc-500 bg-zinc-800/40 border border-zinc-700/50'
                    }`}>
                      {service.connected ? '● LINKED' : '○ NOT LINKED'}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1.5 pl-8">
                    {service.detail || 'Personal tool connection'}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 pl-8 sm:pl-0">
                  <button
                    onClick={() => handleToggleUserService(service)}
                    disabled={isBusy}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 border ${
                      service.connected
                        ? 'border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200'
                        : 'border-[#D8163F]/40 bg-[#D8163F]/10 hover:bg-[#D8163F]/20 text-[#D8163F]'
                    } disabled:opacity-50`}
                  >
                    {isBusy ? (
                      <RefreshCw size={12} className="animate-spin" />
                    ) : null}
                    <span>{service.connected ? 'Unlink' : 'Link Account'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
