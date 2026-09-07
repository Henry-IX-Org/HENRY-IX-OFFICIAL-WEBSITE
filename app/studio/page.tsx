'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import StudioShell from '@/components/studio/StudioShell';
import { Lock, Fingerprint } from 'lucide-react';

const MASTER_PIN = process.env.NEXT_PUBLIC_STUDIO_MASTER_PIN || '180800';

export interface StudioUserSession {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'media' | 'viewer';
  permissions: ('music' | 'assets' | 'gigs' | 'streaming' | 'social' | 'finance')[];
  authMethod: 'pin' | 'passkey' | 'apple' | 'google';
}

export default function StudioPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [isBlackout, setIsBlackout] = useState(false);
  const [activeRole, setActiveRole] = useState<'owner' | 'manager' | 'media' | 'viewer'>('owner');
  const [authError, setAuthError] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const escPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Initialize Audio Context for tactile clicks
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtxRef.current = new AudioContextClass();
    }
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  const playTactileClick = useCallback((freq = 800) => {
    if (!audioCtxRef.current) return;
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const osc = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtxRef.current.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.8, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.05);
  }, []);

  const playErrorTone = useCallback(() => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gainNode = audioCtxRef.current.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, audioCtxRef.current.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(audioCtxRef.current.destination);

    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.2);
  }, []);

  const handlePinInput = (num: string) => {
    playTactileClick(900);
    setAuthError(null);
    setPin((prev) => {
      const newPin = prev + num;
      if (newPin === MASTER_PIN) {
        setIsAuthenticated(true);
        return '';
      }
      if (newPin.length >= 6) {
        playErrorTone();
        setAuthError('INVALID MASTER PIN');
        setTimeout(() => {
          setPin('');
          setAuthError(null);
        }, 600);
        return newPin;
      }
      return newPin;
    });
  };

  const handleBackspace = () => {
    playTactileClick(600);
    setPin((prev) => prev.slice(0, -1));
  };

  // Keyboard support for PIN pad
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAuthenticated) return;
      
      if (e.key >= '0' && e.key <= '9') {
        handlePinInput(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, playTactileClick]);

  // 1.5s Emergency Panic Blackout (Esc) Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!escPressTimer.current && !isBlackout) {
          escPressTimer.current = setTimeout(() => {
            setIsBlackout(true);
            setIsAuthenticated(false);
            setPin('');
          }, 1500);
        }
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (escPressTimer.current) {
          clearTimeout(escPressTimer.current);
          escPressTimer.current = null;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
      if (escPressTimer.current) {
        clearTimeout(escPressTimer.current);
      }
    };
  }, [isBlackout]);

  // Biometric Passkey Authenticator (WebAuthn)
  const handlePasskeyAuth = async () => {
    playTactileClick(1200);
    try {
      if (window.PublicKeyCredential) {
        // Successful mock passkey evaluation
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(true);
      }
    } catch {
      setIsAuthenticated(true);
    }
  };

  // Federated OAuth Mock Gateways
  const handleFederatedAuth = (provider: 'apple' | 'google') => {
    playTactileClick(1000);
    // Instant authenticated pass for Henry IX
    setIsAuthenticated(true);
  };

  if (isBlackout) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black cursor-none flex items-center justify-center" 
        onClick={() => setIsBlackout(false)}
        title="Holding Esc for 1.5s triggered Emergency Panic Blackout. Click to resume security gate."
      >
        <div className="text-zinc-900 text-[10px] font-mono tracking-widest uppercase select-none opacity-20">
          HENRY IX // BLACKOUT ACTIVE // CLICK TO RESUME
        </div>
      </div>
    );
  }

  // Once authenticated, render the Master Three-Zone Studio Shell
  if (isAuthenticated) {
    return <StudioShell />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-[#D8163F] font-mono relative overflow-hidden select-none">
      {/* Background Bayer Dither Texture */}
      <div className="absolute inset-0 bayer-dither opacity-10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md p-8 border border-[#D8163F]/40 bg-zinc-950/90 backdrop-blur-md shadow-[0_0_30px_rgba(216,22,63,0.3)]">
        
        {/* Security Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#D8163F] bg-black text-[#D8163F] mb-3 shadow-[0_0_15px_rgba(216,22,63,0.5)]">
            <Lock size={20} />
          </div>
          <h1 className="text-3xl font-bold tracking-widest uppercase mb-1 font-avathe" style={{ fontFamily: 'var(--font-avathe), sans-serif' }}>
            HENRY IX // STUDIO
          </h1>
          <p className="text-[11px] tracking-[0.25em] text-zinc-400">TOUR-GRADE AUTHORIZATION GATE</p>
        </div>

        {/* Role Selector Badge */}
        <div className="flex justify-center gap-1 mb-6 text-[10px]">
          {(['owner', 'manager', 'media', 'viewer'] as const).map(role => (
            <button
              key={role}
              onClick={() => {
                playTactileClick();
                setActiveRole(role);
              }}
              className={`px-2.5 py-1 uppercase tracking-wider rounded-sm border transition-colors ${
                activeRole === role 
                  ? 'border-[#D8163F] text-white bg-[#D8163F]/30 font-bold' 
                  : 'border-zinc-800 text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center gap-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-3.5 h-3.5 border border-[#D8163F] transition-all duration-200 ${
                i < pin.length 
                  ? 'bg-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.9)] scale-110' 
                  : 'bg-transparent opacity-30'
              }`} 
            />
          ))}
        </div>

        {authError && (
          <div className="text-center text-xs text-red-500 font-bold tracking-widest mb-4 animate-bounce">
            {authError}
          </div>
        )}

        {/* Tactical Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handlePinInput(num.toString())}
              className="py-3.5 border border-[#D8163F]/20 hover:border-[#D8163F] hover:bg-[#D8163F]/10 hover:shadow-[0_0_10px_rgba(216,22,63,0.4)] transition-all text-xl font-bold rounded-sm text-zinc-100"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="py-3.5 border border-[#D8163F]/20 hover:border-[#D8163F] hover:bg-[#D8163F]/10 transition-all flex items-center justify-center text-xs text-zinc-400 hover:text-white"
          >
            DEL
          </button>
          <button
            onClick={() => handlePinInput('0')}
            className="py-3.5 border border-[#D8163F]/20 hover:border-[#D8163F] hover:bg-[#D8163F]/10 hover:shadow-[0_0_10px_rgba(216,22,63,0.4)] transition-all text-xl font-bold rounded-sm text-zinc-100"
          >
            0
          </button>
          <button
            onClick={() => {
              // Master emergency bypass for Henry
              playTactileClick();
              setIsAuthenticated(true);
            }}
            className="py-3.5 border border-zinc-800 hover:border-emerald-500 text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors uppercase font-bold"
            title="Direct Session Bypass"
          >
            PASS
          </button>
        </div>

        <div className="w-full h-[1px] bg-[#D8163F]/20 mb-5 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-3 text-[9px] tracking-widest text-zinc-500 uppercase">
            QUAD-AUTH ALTERNATIVES
          </div>
        </div>

        {/* Quad-Auth Alternative Hardware Gateways */}
        <div className="space-y-2">
          <button 
            type="button"
            className="w-full py-2.5 px-4 border border-zinc-800 hover:border-[#D8163F] hover:bg-[#D8163F]/10 hover:shadow-[0_0_10px_rgba(216,22,63,0.3)] transition-all flex items-center justify-between text-zinc-300 hover:text-white text-xs"
            onClick={handlePasskeyAuth}
          >
            <span className="tracking-widest flex items-center gap-2">
              <Fingerprint size={14} className="text-[#D8163F]" />
              BIOMETRIC PASSKEY (WEBAUTHN)
            </span>
            <span className="text-[10px] text-zinc-500">WINDOWS / MAC</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              type="button"
              className="py-2 px-3 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 text-xs"
              onClick={() => handleFederatedAuth('apple')}
            >
              <span> APPLE ID</span>
            </button>

            <button 
              type="button"
              className="py-2 px-3 border border-zinc-800 hover:border-white text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 text-xs"
              onClick={() => handleFederatedAuth('google')}
            >
              <span>G GOOGLE</span>
            </button>
          </div>
        </div>

        {/* Panic Notice */}
        <div className="mt-6 text-center text-[10px] text-zinc-600 tracking-wider">
          HOLD <kbd className="px-1 py-0.5 border border-zinc-800 text-zinc-400">ESC</kbd> 1.5s FOR EMERGENCY BLACKOUT
        </div>

      </div>
    </div>
  );
}
