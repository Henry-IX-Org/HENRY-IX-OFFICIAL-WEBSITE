'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Sliders } from 'lucide-react';
import PageShell from '@/components/PageShell';
import BrandLogo from '@/components/BrandLogo';
import { siteContent } from '@/lib/siteContent';

export default function UnsubscribeClient() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUnsubscribed, setIsUnsubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleUnsubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setIsUnsubscribed(true);
      } else {
        setErrorMessage(data.error || 'Failed to process unsubscribe.');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUndo = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          unsubscribed: false,
        }),
      });

      const data = (await res.json()) as any;
      if (res.ok && data.success) {
        setIsUnsubscribed(false);
      } else {
        setErrorMessage('Failed to re-subscribe.');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageShell>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <BrandLogo size="md" color="#D8163F" className="mb-4" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              {siteContent.unsubscribe.badge}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-avathe font-bold tracking-wide text-white uppercase mb-2">
            {isUnsubscribed ? siteContent.unsubscribe.successTitle : siteContent.unsubscribe.title}
          </h1>
          <p className="text-sm font-tertiary text-zinc-400 max-w-sm">
            {isUnsubscribed ? siteContent.unsubscribe.successMessage : siteContent.unsubscribe.description}
          </p>
        </div>

        {/* Console Container */}
        <div className="bg-[#0c0d10] border border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {!isUnsubscribed ? (
            <form onSubmit={handleUnsubscribe} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
                  {siteContent.unsubscribe.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={siteContent.unsubscribe.emailPlaceholder}
                  className="w-full bg-[#14151a] border border-white/[0.1] rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-[#D8163F] focus:ring-1 focus:ring-[#D8163F] transition-all"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 px-6 rounded-xl bg-[#D8163F] hover:bg-[#c92646] text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(216,22,63,0.35)] active:scale-[0.99] disabled:opacity-50"
              >
                {isProcessing ? siteContent.unsubscribe.processingButton : siteContent.unsubscribe.confirmButton}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href={`/preferences${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
                >
                  <Sliders size={13} className="text-[#D8163F]" />
                  <span>{siteContent.unsubscribe.preferencesLinkText}</span>
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 size={24} />
              </div>

              <div className="space-y-1">
                <div className="font-mono text-xs text-zinc-400">
                  Target: <span className="text-white">{email}</span>
                </div>
                <div className="text-xs font-tertiary text-zinc-500">
                  You will no longer receive any broadcasts or updates.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleUndo}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#14151a] border border-white/[0.1] text-zinc-300 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {siteContent.unsubscribe.undoButton}
                </button>
                <Link
                  href={`/preferences${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider text-center transition-colors"
                >
                  Customise Alerts
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
