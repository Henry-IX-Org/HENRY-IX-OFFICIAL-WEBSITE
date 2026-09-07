'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  ShieldCheck, 
  KeyRound, 
  Copy, 
  Check, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  AlertCircle,
  Clock,
  Mail,
  Shield,
  ExternalLink
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import { playTactileClick, playNotificationChime } from '@/lib/studioAudioFeedback';
import type { StudioRole } from '@/lib/studioPermissions';
import { ALL_STUDIO_ROLES, ROLE_METADATA } from '@/lib/studioPermissions';

interface OperatorRecord {
  id: string;
  name: string;
  role: StudioRole;
  primaryEmail: string;
  phone: string | null;
  active: boolean;
  lastLoginAt: string;
  createdAt: string;
  servicesConnectedCount: number;
}

interface InviteRecord {
  token: string;
  role: StudioRole;
  email?: string;
  createdBy: string;
  createdAt: string;
  expiresAt: number;
  used: boolean;
}

export default function TeamManagementTab() {
  const currentUser = useStudioStore((s) => s.currentUser);
  const addToast = useStudioStore((s) => s.addToast);
  const isOwner = currentUser?.role === 'owner';

  const [operators, setOperators] = useState<OperatorRecord[]>([]);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Invite generation form
  const [inviteRole, setInviteRole] = useState<StudioRole>('media');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/studio/team');
      const data = (await res.json()) as any;
      if (data.success) {
        setOperators(data.operators || []);
        setInvites(data.invites || []);
      }
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleUpdateRole = async (targetUserId: string, newRole: StudioRole) => {
    if (!isOwner) return;
    playTactileClick();
    setUpdatingId(targetUserId);

    try {
      const res = await fetch('/api/studio/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_role', targetUserId, newRole }),
      });
      const data = (await res.json()) as any;

      if (data.success) {
        playNotificationChime();
        addToast({
          title: 'ROLE UPDATED',
          message: `Operator assigned to ${ROLE_METADATA[newRole].title}.`,
          type: 'success',
        });
        fetchTeam();
      } else {
        addToast({ title: 'ERROR', message: data.error || 'Failed to update role', type: 'error' });
      }
    } catch {
      addToast({ title: 'ERROR', message: 'Failed to reach team service', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeactivate = async (targetUserId: string, name: string) => {
    if (!isOwner) return;
    playTactileClick();

    if (!confirm(`Are you sure you want to deactivate operator "${name}"?`)) {
      return;
    }

    setUpdatingId(targetUserId);
    try {
      const res = await fetch('/api/studio/team', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      const data = (await res.json()) as any;

      if (data.success) {
        playNotificationChime();
        addToast({
          title: 'OPERATOR DEACTIVATED',
          message: `${name} has been deactivated from studio access.`,
          type: 'warning',
        });
        fetchTeam();
      } else {
        addToast({ title: 'ERROR', message: data.error || 'Failed to deactivate operator', type: 'error' });
      }
    } catch {
      addToast({ title: 'ERROR', message: 'Failed to reach team service', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) return;

    playTactileClick();
    setIsGeneratingInvite(true);
    setGeneratedInviteUrl(null);

    try {
      const res = await fetch('/api/studio/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite',
          role: inviteRole,
          email: inviteEmail ? inviteEmail.trim().toLowerCase() : undefined,
        }),
      });
      const data = (await res.json()) as any;

      if (data.success && data.invite?.inviteUrl) {
        playNotificationChime();
        setGeneratedInviteUrl(data.invite.inviteUrl);
        setInviteEmail('');
        addToast({
          title: 'INVITE GENERATED',
          message: `1-Click link created for ${ROLE_METADATA[inviteRole].title}.`,
          type: 'success',
        });
        fetchTeam();
      } else {
        addToast({ title: 'ERROR', message: data.error || 'Failed to generate invite', type: 'error' });
      }
    } catch {
      addToast({ title: 'ERROR', message: 'Server error generating invite', type: 'error' });
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyInviteUrl = async () => {
    if (!generatedInviteUrl) return;
    playTactileClick();
    try {
      await navigator.clipboard.writeText(generatedInviteUrl);
      setHasCopied(true);
      playNotificationChime();
      addToast({ title: 'COPIED TO CLIPBOARD', message: 'Invite URL ready to share with operator.', type: 'info' });
      setTimeout(() => setHasCopied(false), 3000);
    } catch {
      addToast({ title: 'ERROR', message: 'Failed to copy to clipboard', type: 'error' });
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Tab Header */}
      <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">Team & Operator Management</h3>
          <p className="text-xs text-zinc-400 mt-1">
            Role-Based Access Control (RBAC), team permissions, and 1-click invitation links.
          </p>
        </div>
        <button
          onClick={() => {
            playTactileClick();
            fetchTeam();
            addToast({ title: 'REFRESHING ROSTER', message: 'Querying operator permissions...', type: 'info' });
          }}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#1b1c22] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 text-xs font-mono flex items-center gap-1.5 transition-colors font-medium disabled:opacity-50"
          title="Refresh Team Roster"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Roster</span>
        </button>
      </div>

      {/* ================================================================= */}
      {/* 1. ISSUE 1-CLICK OPERATOR INVITE LINK (OWNER ONLY)               */}
      {/* ================================================================= */}
      {isOwner && (
        <div className="p-5 rounded-xl border border-white/[0.08] bg-[#171820] space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus size={15} className="text-[#D8163F]" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Issue 1-Click Operator Invite
            </h4>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Generate an encrypted invite link that grants pre-approved role permissions without manual key handoffs.
          </p>

          <form onSubmit={handleGenerateInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-5 space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Target Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as StudioRole)}
                className="w-full px-3 py-2 bg-[#0E0F14] border border-white/[0.08] rounded-lg text-white text-xs font-mono focus:border-[#D8163F] focus:outline-none"
              >
                {ALL_STUDIO_ROLES.filter(r => r !== 'owner').map((roleKey) => (
                  <option key={roleKey} value={roleKey}>
                    {ROLE_METADATA[roleKey].title} [{ROLE_METADATA[roleKey].badge}]
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Restricted Email (Optional)</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="teammate@agency.com"
                className="w-full px-3 py-2 bg-[#0E0F14] border border-white/[0.08] rounded-lg text-white text-xs font-mono placeholder:text-zinc-600 focus:border-[#D8163F] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex items-end">
              <button
                type="submit"
                disabled={isGeneratingInvite}
                className="w-full py-2 px-3 bg-[#D8163F] hover:bg-[#c21337] active:bg-[#a8102f] text-white text-xs font-mono font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingInvite ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : (
                  <KeyRound size={12} />
                )}
                <span>Generate Link</span>
              </button>
            </div>
          </form>

          {/* Generated URL Display */}
          {generatedInviteUrl && (
            <div className="mt-3 p-3 bg-[#0B0C10] border border-[#D8163F]/40 rounded-lg flex items-center justify-between gap-3 animate-in fade-in">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-mono text-[#D8163F] uppercase font-semibold mb-0.5">
                  1-Click Invite Ready (Expires in 48 Hours)
                </div>
                <div className="text-xs font-mono text-zinc-300 truncate select-all">
                  {generatedInviteUrl}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyInviteUrl}
                className="px-3 py-1.5 rounded-md bg-[#D8163F] hover:bg-[#c21337] text-white text-xs font-mono font-medium flex items-center gap-1.5 flex-shrink-0 transition-colors"
              >
                {hasCopied ? (
                  <>
                    <Check size={12} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Active Invites List */}
          {invites.length > 0 && (
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-2">
                Active Pending Invites ({invites.length})
              </div>
              <div className="space-y-1.5">
                {invites.map((inv) => (
                  <div key={inv.token} className="p-2.5 rounded-lg bg-[#0E0F14] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#D8163F] font-bold">
                        [{ROLE_METADATA[inv.role]?.badge || inv.role.toUpperCase()}]
                      </span>
                      <span className="text-zinc-300">{inv.email || 'Open to designated invitee'}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      Expires in {Math.round((inv.expiresAt - Date.now()) / (1000 * 60 * 60))}h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. ACTIVE STUDIO OPERATORS DIRECTORY                              */}
      {/* ================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-[#D8163F]" />
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Registered Operators ({operators.length})
            </h4>
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            {operators.filter(o => o.active).length} Active
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {operators.map((op) => {
            const isSelf = op.id === currentUser?.id;
            const isMaster = op.id === 'usr_henryix_master' || op.role === 'owner';
            const isUpdating = updatingId === op.id;

            return (
              <div 
                key={op.id}
                className="p-4 rounded-xl border border-white/[0.08] bg-[#171820] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">{op.name}</span>
                    {isSelf && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        YOU
                      </span>
                    )}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                      op.role === 'owner'
                        ? 'text-[#D8163F] bg-[#D8163F]/10 border border-[#D8163F]/20'
                        : op.role === 'manager'
                        ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20'
                        : op.role === 'media'
                        ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                        : op.role === 'audio_engineer'
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-zinc-400 bg-zinc-800/40 border border-zinc-700/50'
                    }`}>
                      {ROLE_METADATA[op.role]?.badge || op.role.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-[11px] text-zinc-400 font-mono mt-1 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail size={11} className="text-zinc-500" />
                      <span>{op.primaryEmail}</span>
                    </span>
                    <span>•</span>
                    <span className="text-zinc-500">
                      Last Active: {op.lastLoginAt ? new Date(op.lastLoginAt).toLocaleDateString() : 'Never'}
                    </span>
                    <span>•</span>
                    <span className="text-zinc-500">
                      {op.servicesConnectedCount} Personal Tools Linked
                    </span>
                  </div>
                </div>

                {/* Operator Actions (Owner Only) */}
                {isOwner && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isMaster ? (
                      <>
                        {/* Role Switcher */}
                        <select
                          disabled={isUpdating}
                          value={op.role}
                          onChange={(e) => handleUpdateRole(op.id, e.target.value as StudioRole)}
                          className="px-2.5 py-1.5 bg-[#0E0F14] border border-white/[0.08] hover:border-white/20 rounded-lg text-white text-xs font-mono focus:border-[#D8163F] focus:outline-none disabled:opacity-50"
                        >
                          {ALL_STUDIO_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_METADATA[r].title}
                            </option>
                          ))}
                        </select>

                        {/* Deactivate Button */}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleDeactivate(op.id, op.name)}
                          className="p-1.5 rounded-lg border border-red-900/30 hover:border-red-800 bg-red-950/20 hover:bg-red-950/40 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                          title="Deactivate Operator Account"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-mono text-zinc-500 px-2 py-1 rounded bg-white/[0.03] border border-white/[0.06]">
                        PRIMARY OWNER
                      </span>
                    )}
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
