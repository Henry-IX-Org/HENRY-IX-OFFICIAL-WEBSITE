'use client';

import React, { useState, useEffect, useRef } from 'react';
import StudioShell from '@/components/studio/StudioShell';
import BrandLogo from '@/components/studio/BrandLogo';
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
  UserPlus,
  KeyRound,
  LogOut,
  Sparkles
} from 'lucide-react';
import { playTactileClick, playNotificationChime } from '@/lib/studioAudioFeedback';
import type { StudioRole } from '@/lib/studioPermissions';
import { ALL_STUDIO_ROLES, ROLE_METADATA } from '@/lib/studioPermissions';
import { TurnstileWidget, TurnstileWidgetHandle } from '@/components/TurnstileWidget';

type AuthView = 'sign-in' | 'register';

export default function StudioPage() {
  const { currentUser, setCurrentUser, fetchCurrentSession } = useStudioStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('sign-in');

  // Form Fields (Clean initial states without hardcoded values)
  const [signInEmail, setSignInEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<StudioRole>('manager');
  const [inviteToken, setInviteToken] = useState<string | null>(null);

  // Turnstile Bot Protection State
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBlackout, setIsBlackout] = useState(false);

  const escPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Check active session on mount & inspect query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const isLockRequested = params.get('lock') === 'true' || params.get('logout') === 'true';
      const invite = params.get('invite');
      const role = params.get('role') as StudioRole | null;

      if (isLockRequested) {
        // Explicit lock/logout requested: clear session immediately
        fetch('/api/studio/auth/session', { method: 'DELETE' }).catch(() => {});
        setCurrentUser(null);
        setIsAuthenticated(false);
        window.history.replaceState({}, '', '/studio');
      } else {
        // Load active session into store if present, but NEVER auto-advance isAuthenticated
        // to true without user action. This ensures the lock screen is always presented first.
        fetchCurrentSession().catch(() => {});
      }

      if (invite) {
        setInviteToken(invite);
        setAuthView('register');
        if (role && ALL_STUDIO_ROLES.includes(role)) {
          setRegRole(role);
          setRegName('');
          setRegEmail('');
        }
        setStatusMessage(`Team invite token detected: Role set to ${role ? ROLE_METADATA[role]?.title : 'Team Operator'}`);
      }
    }
  }, [fetchCurrentSession, setCurrentUser]);

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

    if (!turnstileToken) {
      setErrorMessage('Please complete the security verification challenge to proceed.');
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
        body: JSON.stringify({ action: 'login', email: emailToUse, turnstileToken }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'Sign in failed. Please check credentials or register.');
        turnstileRef.current?.reset();
        setTurnstileToken('');
        return;
      }

      playNotificationChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('Unable to connect to studio server. Please retry.');
      turnstileRef.current?.reset();
      setTurnstileToken('');
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

    if (!turnstileToken) {
      setErrorMessage('Please complete the security verification challenge to proceed.');
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
          inviteToken: inviteToken || undefined,
          turnstileToken,
        }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed. Please try again.');
        turnstileRef.current?.reset();
        setTurnstileToken('');
        return;
      }

      playNotificationChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('Server connection failed during registration.');
      turnstileRef.current?.reset();
      setTurnstileToken('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    playTactileClick();
    setIsLoading(true);
    window.location.href = '/api/studio/auth/google';
  };

  // Switch operator / Sign out
  const handleSignOutActiveUser = async () => {
    playTactileClick();
    setIsLoading(true);
    try {
      await fetch('/api/studio/auth/session', { method: 'DELETE' });
    } catch {}
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
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
    return <StudioShell onLock={() => setIsAuthenticated(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#090A0E] text-zinc-100 font-sans px-4 py-12 select-none">
      
      {/* Official IX Monogram Brand Logo */}
      <BrandLogo size={56} showText={false} className="mb-4" />

      {/* Brand Header */}
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-2 mb-2.5 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8163F]" />
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase font-semibold">
            HENRY IX
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-[11px] font-mono text-zinc-400">STUDIO</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">
          {currentUser 
            ? 'Operator Session Active' 
            : authView === 'sign-in' 
              ? 'Sign in to your workspace' 
              : 'Create an operator account'}
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          {currentUser
            ? `Signed in as ${currentUser.name}. Click Enter to access your decks and tools.`
            : authView === 'sign-in'
              ? 'Access your audio collections, gig logistics, and streaming desk'
              : 'Set up credentials to access Henry IX Studio tools under your role'}
        </p>
      </div>

      {/* Main Card Container */}
      <div className="w-full max-w-[420px] bg-[#121318] border border-zinc-800/90 rounded-xl p-6 sm:p-7 shadow-2xl">
        
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

        {/* ------------------------------------------------------------- */}
        {/* STATE A: ACTIVE OPERATOR SESSION DETECTED                      */}
        {/* ------------------------------------------------------------- */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#17181F] border border-zinc-800/90 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Operator</span>
                </div>
                <span className="text-[10px] font-mono text-[#D8163F] font-bold px-2 py-0.5 rounded bg-zinc-800/90 border border-zinc-700/60">
                  {ROLE_METADATA[currentUser.role]?.badge || currentUser.role.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-mono text-sm font-semibold">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-zinc-400 truncate font-mono">
                    {currentUser.emails?.[0]?.email || currentUser.google?.email || 'Active Operator'}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-2 font-mono">
                {ROLE_METADATA[currentUser.role]?.description}
              </div>
            </div>

            {/* Enter Studio Workspace Button */}
            <button
              type="button"
              onClick={() => {
                playTactileClick();
                setIsAuthenticated(true);
              }}
              className="w-full py-2.5 px-4 bg-[#D8163F] hover:bg-[#c21337] active:bg-[#a8102f] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Enter Studio Workspace</span>
              <ArrowRight size={14} />
            </button>

            {/* Subtle Divider */}
            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-zinc-800/80" />
              <span className="absolute bg-[#121318] px-2.5 text-[11px] text-zinc-500 uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Switch Operator or Register Different Account */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSignOutActiveUser}
                disabled={isLoading}
                className="py-2 px-3 bg-[#17181F] hover:bg-[#1E1F28] border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} className="text-zinc-400" />
                <span>Switch Operator</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleSignOutActiveUser();
                  setAuthView('register');
                }}
                disabled={isLoading}
                className="py-2 px-3 bg-[#17181F] hover:bg-[#1E1F28] border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <UserPlus size={13} className="text-zinc-400" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* STATE B: NO ACTIVE SESSION (SIGN IN OR REGISTER FORM)         */
          /* ------------------------------------------------------------- */
          <>
            {/* View Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#0B0C0F] border border-zinc-800/80 rounded-lg mb-6 text-xs">
              <button
                type="button"
                onClick={() => {
                  playTactileClick();
                  setAuthView('sign-in');
                  setErrorMessage(null);
                  setTurnstileToken('');
                  turnstileRef.current?.reset();
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
                  setTurnstileToken('');
                  turnstileRef.current?.reset();
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

            {/* 1. SIGN IN VIEW */}
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

                <TurnstileWidget
                  ref={turnstileRef}
                  action="studio_auth"
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken('')}
                  onExpire={() => setTurnstileToken('')}
                  className="my-2"
                />

                <button
                  type="submit"
                  disabled={isLoading || !turnstileToken}
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

            {/* 2. CREATE ACCOUNT VIEW */}
            {authView === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Operator Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
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
                    placeholder="marcus@corsicastudios.com"
                    className="w-full px-3 py-2 bg-[#17181F] border border-zinc-800 rounded-lg text-white text-xs placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                    <span>Assigned Role</span>
                    {inviteToken && (
                      <span className="text-[10px] font-mono text-[#D8163F] uppercase tracking-wider flex items-center gap-1">
                        <KeyRound size={11} />
                        <span>Locked by Invite</span>
                      </span>
                    )}
                  </label>
                  <select
                    value={regRole}
                    disabled={Boolean(inviteToken)}
                    onChange={(e) => setRegRole(e.target.value as StudioRole)}
                    className="w-full px-3 py-2 bg-[#17181F] border border-zinc-800 rounded-lg text-white text-xs focus:border-zinc-500 focus:outline-none transition-colors disabled:opacity-60"
                  >
                    {ALL_STUDIO_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_METADATA[r].title} [{ROLE_METADATA[r].badge}]
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-zinc-500 font-mono leading-relaxed mt-1">
                    {ROLE_METADATA[regRole]?.description}
                  </p>
                </div>

                <TurnstileWidget
                  ref={turnstileRef}
                  action="studio_auth"
                  onVerify={(token) => setTurnstileToken(token)}
                  onError={() => setTurnstileToken('')}
                  onExpire={() => setTurnstileToken('')}
                  className="my-2"
                />

                <button
                  type="submit"
                  disabled={isLoading || !turnstileToken}
                  className="w-full py-2.5 px-4 bg-[#D8163F] hover:bg-[#c21337] active:bg-[#a8102f] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm mt-2"
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
          </>
        )}

      </div>

      {/* Understated Security Footer */}
      <div className="mt-8 text-center text-[11px] text-zinc-500 font-mono">
        Hold <kbd className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 rounded text-zinc-400">Esc</kbd> for 1.5s to lock console
      </div>

    </div>
  );
}
