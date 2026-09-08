'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Mail } from 'lucide-react';
import { playClick } from '@/lib/audioUtils';

interface PromotionalDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromotionalDisclaimerModal({
  isOpen,
  onClose,
}: PromotionalDisclaimerModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleClose = () => {
    playClick(900, 'sine', 0.02);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[210] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="disclaimer-modal-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative w-full max-w-xl border border-zinc-800 bg-zinc-950 rounded-none p-6 sm:p-8 shadow-2xl font-mono text-zinc-300 z-10 select-none overflow-hidden"
          >
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-neon-glow" />

            {/* Header */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <h2 
                  id="disclaimer-modal-title"
                  className="text-white text-xs sm:text-sm font-black tracking-widest uppercase"
                >
                  PROMOTIONAL & COPYRIGHT DISCLAIMER
                </h2>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close disclaimer modal"
                className="text-zinc-500 hover:text-white p-1 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Content */}
            <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
              <p>
                All DJ mixes, live audio sets, track selections, and streaming sessions hosted on this website are provided strictly for <span className="text-white font-bold">promotional portfolio purposes</span> to showcase live performance, mixing techniques, track programming, and sound curation.
              </p>
              <p>
                All rights, ownership, and copyright in and to the underlying musical works, sound recordings, compositions, and samples belong entirely to their respective original artists, producers, songwriters, and record labels. No commercial sale, monetization, or distribution of third-party musical master recordings is conducted via this website.
              </p>
              <p>
                If you are a copyright owner or licensing representative and wish to request the removal of any content or file a notice under applicable copyright laws (including DMCA), please contact our reporting address directly with the relevant track details:
              </p>

              {/* Direct Email Action Box */}
              <div className="mt-4 p-3.5 bg-black border border-zinc-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-zinc-400">Direct Inquiries:</span>
                  <a
                    href="mailto:sitereporting@henryix.com"
                    className="text-white hover:text-primary transition-colors underline underline-offset-2"
                  >
                    sitereporting@henryix.com
                  </a>
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Prompt Response
                </span>
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-6 pt-4 border-t border-zinc-900 flex justify-end">
              <button
                onClick={handleClose}
                aria-label="Acknowledge and close disclaimer"
                className="px-5 py-2 bg-primary hover:bg-[#b01032] text-white text-xs font-bold tracking-wider uppercase transition-colors active:scale-95 cursor-pointer shadow-neon-glow"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
