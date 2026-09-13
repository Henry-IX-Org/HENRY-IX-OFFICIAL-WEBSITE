'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playClick } from '@/lib/audioUtils';
import { TurnstileWidget, TurnstileWidgetHandle } from './TurnstileWidget';

export { GigSchedule as Schedule } from './GigSchedule';
export { NewsletterForm as MailingList } from './NewsletterForm';
export { ContactForm } from './ContactForm';

const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 20 };

export function MerchVault({ isDepth }: { isDepth: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitted' | 'error'>('idle');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !turnstileToken) return;
    playClick(900, 'sine', 0.03);
    setStatus('loading');

    try {
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      if (res.ok) {
        setStatus('submitted');
      } else {
        setStatus('error');
        turnstileRef.current?.reset();
        setTurnstileToken('');
      }
    } catch {
      setStatus('error');
      turnstileRef.current?.reset();
      setTurnstileToken('');
    }
  };

  return (
    <section id="merch" className="min-h-[40vh] flex flex-col justify-center items-center w-full px-6 relative max-w-4xl mx-auto py-16 scroll-mt-24 font-mono">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ ...SPRING_CONFIG }}
        className="w-full mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <h2 className="text-lg md:text-xl tracking-[0.2em] font-semibold uppercase">03 // VIP Secret Drops & Guestlist</h2>
        <div className={cn("h-[1px] flex-grow w-full md:w-auto md:ml-8", isDepth ? "bg-zinc-800" : "bg-black/20")} />
      </motion.div>

      <div className="w-full border border-zinc-900 bg-black p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-primary text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Priority Access Dispatch</span>
          </div>
          <p className="text-xs text-zinc-400 max-w-md">
            Receive unreleased dubplates, secret London warehouse coordinates, and limited vinyl drops directly to your inbox.
          </p>
        </div>

        {status === 'submitted' ? (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-widest uppercase bg-zinc-950 border border-emerald-800/60 px-4 py-3">
            <Check className="w-4 h-4" />
            <span>Access Granted</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row w-full md:w-auto items-center gap-3">
            <div className="flex w-full md:w-auto items-stretch gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL..."
                className="bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-primary font-mono tracking-wider w-full md:w-56"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !turnstileToken}
                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-4 py-2 text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{status === 'loading' ? 'Joining...' : 'Join'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <TurnstileWidget
              ref={turnstileRef}
              action="subscribe"
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken('')}
              onExpire={() => setTurnstileToken('')}
              className="my-0"
            />
          </form>
        )}
      </div>
    </section>
  );
}
