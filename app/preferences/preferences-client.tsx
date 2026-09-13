'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Check, Bell, Disc, Ticket, Star, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PageShell from '@/components/PageShell';
import BrandLogo from '@/components/BrandLogo';
import { siteContent } from '@/lib/siteContent';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  live_broadcasts: Bell,
  mix_releases: Disc,
  events_tickets: Ticket,
  inner_circle: Star,
};

export default function PreferencesClient() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [activeTopics, setActiveTopics] = useState<Record<string, boolean>>({
    live_broadcasts: true,
    mix_releases: true,
    events_tickets: true,
    inner_circle: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsubscribedAll, setHasUnsubscribedAll] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleToggle = (id: string) => {
    setActiveTopics((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setStatusMessage(null);
    setHasUnsubscribedAll(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    const topicsPayload = siteContent.preferences.categories.map((cat) => ({
      id: cat.topicId,
      subscription: activeTopics[cat.id] ? ('opt_in' as const) : ('opt_out' as const),
    }));

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          topics: topicsPayload,
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: siteContent.preferences.savedMessage });
        setHasUnsubscribedAll(false);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to save preferences.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    if (!email || !email.includes('@')) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          unsubscribed: true,
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setActiveTopics({
          live_broadcasts: false,
          mix_releases: false,
          events_tickets: false,
          inner_circle: false,
        });
        setHasUnsubscribedAll(true);
        setStatusMessage({ type: 'success', text: 'You have been unsubscribed from all emails.' });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to unsubscribe.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <BrandLogo size="md" color="#D8163F" className="mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D8163F]" />
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              {siteContent.preferences.badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-avathe font-bold tracking-wide text-white uppercase mb-2">
            {siteContent.preferences.title}
          </h1>
          <p className="text-sm font-tertiary text-zinc-400 max-w-md">
            {siteContent.preferences.description}
          </p>
        </div>

        {/* Console Container */}
        <div className="bg-[#0c0d10] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
              {siteContent.preferences.emailLabel}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={siteContent.preferences.emailPlaceholder}
              className="w-full bg-[#14151a] border border-white/[0.1] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#D8163F] focus:ring-1 focus:ring-[#D8163F] transition-all"
            />
          </div>

          {/* Category Toggle Cards */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-mono tracking-wider text-zinc-500 uppercase">
              Alert Categories
            </div>
            {siteContent.preferences.categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Bell;
              const isChecked = Boolean(activeTopics[cat.id]);

              return (
                <div
                  key={cat.id}
                  onClick={() => handleToggle(cat.id)}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer select-none ${
                    isChecked
                      ? 'bg-[#14151a] border-[#D8163F]/40 shadow-[0_0_15px_rgba(216,22,63,0.1)]'
                      : 'bg-[#0f1013] border-white/[0.05] opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3.5 pr-4">
                    <div
                      className={`p-2 rounded-lg mt-0.5 transition-colors ${
                        isChecked ? 'bg-[#D8163F]/15 text-[#D8163F]' : 'bg-white/[0.04] text-zinc-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white tracking-tight">{cat.label}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-zinc-400 uppercase">
                          {cat.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-tertiary mt-1 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Tactile Hardware Switch */}
                  <div
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 mt-1 shrink-0 ${
                      isChecked ? 'bg-[#D8163F]' : 'bg-zinc-800'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                        isChecked ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    >
                      {isChecked && <Check size={10} className="text-[#D8163F] stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback Toast */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle2 size={14} className="shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleSave()}
              disabled={isSaving}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-[#D8163F] hover:bg-[#c92646] text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(216,22,63,0.35)] active:scale-[0.99] disabled:opacity-50"
            >
              {isSaving ? siteContent.preferences.savingButton : siteContent.preferences.saveButton}
            </button>

            <button
              onClick={handleUnsubscribeAll}
              disabled={isSaving || hasUnsubscribedAll}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-transparent hover:bg-white/[0.04] border border-white/[0.1] text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-40"
            >
              {siteContent.preferences.unsubscribeAllButton}
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>{siteContent.preferences.backToHome}</span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
