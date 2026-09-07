'use client';

import React, { useState, useEffect, useRef } from 'react';
import StudioShell from '@/components/studio/StudioShell';
import { useStudioStore } from '@/store/studioStore';
import { 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  User,
  Shield,
  LogIn,
  UserPlus
} from 'lucide-react';
import { playTactileClick, playNotificationChime } from '@/lib/studioAudioFeedback';

type AuthView = 'sign-in' | 'register';

export default function StudioPage() {
  const { currentUser, setCurrentUser, fetchCurrentSession } = useStudioStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('sign-in');

  // Form Fields
  const [signInEmail, setSignInEmail] = useState('henryixdj@gmail.com');
  const [regName, setRegName] = useState('Henry IX');
  const [regEmail, setRegEmail] = useState('henryixdj@gmail.com');
  const [regRole, setRegRole] = useState<'owner' | 'manager' | 'media' | 'viewer'>('owner');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBlackout, setIsBlackout] = useState(false);

  const escPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Check active session on mount
  useEffect(() => {
    fetchCurrentSession().then((user) => {
      if (user) {
        setIsAuthenticated(true);
      }
    });
  }, [fetchCurrentSession]);

  // Emergency Panic Blackout (Hold Esc 1.5s)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!escPressTimer.current && !isBlackout) {
          escPressTimer.current = setTimeout(() => {
            setIsBlackout(true);
            setIsAuthenticated(false);
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

  // -------------------------------------------------------------------
  // 1. Sign In Handlers
  // -------------------------------------------------------------------
  const handleSignIn = async (e?: React.FormEvent, targetEmail?: string) => {
    if (e) e.preventDefault();
    const emailToUse = (targetEmail || signInEmail).trim().toLowerCase();

    if (!emailToUse || !emailToUse.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    playTactileClick();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/studio/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: emailToUse }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'Sign in failed. Please check credentials or register.');
        return;
      }

      playNotificationChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('Unable to connect to studio server. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // 2. Register New Operator Handlers
  // -------------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanName = regName.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    if (!cleanName) {
      setErrorMessage('Please enter your name');
      return;
    }

    playTactileClick();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/studio/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          role: regRole,
        }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        return;
      }

      playNotificationChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('Server connection failed during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    playTactileClick();
    setIsLoading(true);
    window.location.href = '/api/studio/auth/google';
  };

  // Emergency Panic Blackout Screen
  if (isBlackout) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black cursor-pointer flex items-center justify-center" 
        onClick={() => setIsBlackout(false)}
        title="Screen locked. Click anywhere to return to sign in."
      >
        <div className="text-zinc-700 text-xs font-mono tracking-wider uppercase select-none">
          HENRY IX STUDIO // LOCKED // CLICK TO RESUME
        </div>
      </div>
    );
  }

  // Render Studio Shell when authenticated
  if (isAuthenticated) {
    return <StudioShell />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090A0E] text-zinc-100 font-sans px-4 py-12 select-none">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8163F]" />
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">
            HENRY IX
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-[11px] font-mono text-zinc-400">STUDIO</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
          {authView === 'sign-in' ? 'Sign in to your workspace' : 'Create an operator account'}
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5">
          {authView === 'sign-in'
            ? 'Access your music collection, gigs, and streaming hub'
            : 'Set up credentials to access Henry IX Studio tools'}
        </p>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-[400px] bg-[#121318] border border-zinc-800/90 rounded-xl p-6 sm:p-7 shadow-2xl">
        
        {/* View Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#0B0C0F] border border-zinc-800/80 rounded-lg mb-6 text-xs">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setAuthView('sign-in');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
              authView === 'sign-in'
                ? 'bg-[#1C1D24] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setAuthView('register');
              setErrorMessage(null);
            }}
            className={`py-2 px-3 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${
              authView === 'register'
                ? 'bg-[#1C1D24] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UserPlus size={13} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Status & Error Feedback */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-300 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="mb-5 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={14} className="flex-shrink-0 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. SIGN IN VIEW                                                  */}
        {/* ================================================================= */}
        {authView === 'sign-in' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="operator@henryix.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#17181F] border border-zinc-800 rounded-lg text-white text-xs placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#D8163F] hover:bg-[#c21337] active:bg-[#a8102f] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            {/* Subtle Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="w-full border-t border-zinc-800/80" />
              <span className="absolute bg-[#121318] px-2.5 text-[11px] text-zinc-500 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Quick 1-Click Access for Henry IX (Owner) */}
            <button
              type="button"
              onClick={() => handleSignIn(undefined, 'henryixdj@gmail.com')}
              disabled={isLoading}
              className="w-full py-2.5 px-3 bg-[#17181F] hover:bg-[#1E1F28] border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <User size={14} className="text-zinc-400" />
                <span>Continue as Henry IX</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-800/70 border border-zinc-700/50">
                Owner
              </span>
            </button>

            {/* Google OAuth Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2 px-3 bg-[#17181F] hover:bg-[#1E1F28] border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </form>
        )}

        {/* ================================================================= */}
        {/* 2. CREATE ACCOUNT VIEW                                           */}
        {/* ================================================================= */}
        {authView === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Operator Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Henry IX"
                className="w-full px-3 py-2 bg-[#17181F] border border-zinc-800 rounded-lg text-white text-xs placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="henryixdj@gmail.com"
                className="w-full px-3 py-2 bg-[#17181F] border border-zinc-800 rounded-lg text-white text-xs placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Assigned Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#17181F] border border-zinc-800 rounded-lg text-white text-xs focus:border-zinc-500 focus:outline-none transition-colors"
              >
                <option value="owner">Owner / Resident DJ</option>
                <option value="manager">Tour & Booking Manager</option>
                <option value="media">Media & Visuals Director</option>
                <option value="viewer">Guest Sound Engineer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#D8163F] hover:bg-[#c21337] active:bg-[#a8102f] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm mt-1"
            >
              {isLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Create Account & Enter</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

      </div>

      {/* Understated Security Footer */}
      <div className="mt-8 text-center text-[11px] text-zinc-500 font-mono">
        Hold <kbd className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 rounded text-zinc-400">Esc</kbd> for 1.5s to lock console
      </div>

    </div>
  );
}
