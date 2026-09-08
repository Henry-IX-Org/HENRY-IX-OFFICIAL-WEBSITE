'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import PromotionalDisclaimerModal from './PromotionalDisclaimerModal';
import { playClick } from '@/lib/audioUtils';

export default function SiteFooter() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Only reveal when scrolled down past tabs (250px) and near the bottom
      const isPastTabs = currentScrollY > 250;
      const isAtBottom = currentScrollY + windowHeight >= documentHeight - 50;

      if (isPastTabs && isAtBottom) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openPreferences = () => {
    playClick(900, 'sine', 0.02);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-cookie-preferences'));
    }
  };

  const openDisclaimer = () => {
    playClick(900, 'sine', 0.02);
    setIsDisclaimerOpen(true);
  };

  return (
    <>
      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 py-3 px-6 md:px-12 bg-black/95 backdrop-blur-md border-t border-zinc-900 select-none font-mono text-[10px] text-zinc-500 transition-opacity duration-300 ${
          isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Copyright */}
          <div className="font-bold text-zinc-400 uppercase tracking-widest text-[9px]">
            HENRY IX © {new Date().getFullYear()} ALL RIGHTS RESERVED
          </div>

          {/* Legal Links & Modals */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-x-4 uppercase tracking-widest font-bold text-[9px]">
            <button
              onClick={openDisclaimer}
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer uppercase text-[9px]"
            >
              PROMOTIONAL DISCLAIMER
            </button>
            <span className="text-zinc-700">•</span>
            <Link 
              href="/privacy" 
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              PRIVACY POLICY
            </Link>
            <span className="text-zinc-700">•</span>
            <Link 
              href="/terms" 
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              TERMS OF SERVICE
            </Link>
            <span className="text-zinc-700">•</span>
            <button
              onClick={openPreferences}
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer uppercase text-[9px]"
            >
              COOKIE PREFERENCES
            </button>
          </div>
        </div>
      </footer>

      {/* Promotional Disclaimer Popup Modal */}
      <PromotionalDisclaimerModal 
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </>
  );
}
