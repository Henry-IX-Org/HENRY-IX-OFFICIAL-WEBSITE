'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { playClick, playTick } from '@/lib/audioUtils';
import siteContent from '@/lib/siteContent';
import { TurnstileWidget, TurnstileWidgetHandle } from './TurnstileWidget';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !turnstileToken) return;
    setStatus('loading');
    setErrorMessage('');
    playClick(1000, 'sine', 0.1);

    try {
      const res = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      if (res.ok) {
        setStatus('success');
        setJoined(true);
      } else {
        const data = (await res.json().catch(() => ({}))) as any;
        throw new Error(data.error || 'Verification or subscription failed');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Transmission failed');
      turnstileRef.current?.reset();
      setTurnstileToken('');
    }
  };

  const validation = useMemo(() => {
    if (!email) return { status: 'waiting' as const, message: 'ENTER_INQUIRY...' };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      return { status: 'success' as const, message: 'ADDRESS_VERIFIED // TARGET_STAGED' };
    } else {
      return { status: 'warning' as const, message: 'VALIDATION_FAILED - RESUBMIT_REQUIRED' };
    }
  }, [email]);

  return (
    <section className="w-full px-6 py-12 md:py-24 max-w-xl mx-auto flex flex-col items-center text-center">
      <h3 className="font-mono text-xl font-bold tracking-[0.2em] uppercase mb-4 text-primary">
        {siteContent.newsletter.title}
      </h3>
      <p className="font-mono text-xs text-zinc-500 tracking-wider mb-8 max-w-md">
        {siteContent.newsletter.description}
      </p>

      <AnimatePresence mode="wait">
        {joined ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col items-center gap-3 py-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
            >
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <p className="font-mono text-xs tracking-widest uppercase text-primary">Transmission Received</p>
            <p className="text-xs text-zinc-500 font-mono">{email}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col sm:flex-row gap-3 relative"
            onSubmit={handleJoin}
          >
            <div className="flex-grow flex flex-col items-start w-full">
              <input 
                type="email"
                required
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (Math.random() < 0.3) playTick();
                }}
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-black border border-zinc-900 rounded-none px-4 py-3 text-xs font-mono tracking-[0.2em] focus:outline-none focus:border-primary transition-colors text-white placeholder-zinc-600"
              />
              
              {/* Terminal glowing validation status bar */}
              <div className="font-mono text-[9px] uppercase tracking-widest mt-1.5 flex items-center gap-1.5 select-none pl-1">
                <span className={cn(
                  "px-1 py-0.5 rounded-none text-[8px] font-bold",
                  status === 'error' && "bg-red-950 text-red-400 border border-red-800",
                  status !== 'error' && validation.status === 'waiting' && "bg-zinc-950 text-zinc-400 border border-zinc-900",
                  status !== 'error' && validation.status === 'success' && "bg-emerald-950 text-emerald-400 border border-emerald-800 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.2)]",
                  status !== 'error' && validation.status === 'warning' && "bg-amber-950 text-amber-400 border border-amber-800"
                )}>
                  [{status === 'error' ? 'ERROR' : validation.status.toUpperCase()}]
                </span>
                <span className="text-zinc-500 tracking-wider">
                  {status === 'error' && errorMessage ? errorMessage : validation.message}
                </span>
              </div>
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              action="subscribe"
              onVerify={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken('')}
              onExpire={() => setTurnstileToken('')}
              className="my-1"
            />

            <button
              type="submit"
              disabled={status === 'loading' || !turnstileToken}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono text-xs font-bold tracking-[0.2em] uppercase px-6 py-3 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 rounded-none self-start sm:self-auto"
            >
              <span>{status === 'loading' ? 'SENDING...' : 'JOIN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

export default NewsletterForm;
