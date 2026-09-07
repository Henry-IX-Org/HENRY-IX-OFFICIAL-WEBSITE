'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import StudioShell from '@/components/studio/StudioShell';
import { useStudioStore } from '@/store/studioStore';
import { 
  ShieldCheck, 
  Fingerprint, 
  Mail, 
  ArrowRight, 
  RefreshCw, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  Lock,
  Sparkles,
  Zap,
  Key,
  ChevronRight
} from 'lucide-react';
import { playTactileClick, playNotificationChime } from '@/lib/studioAudioFeedback';
import type { StudioUserProfile } from '@/lib/studioAuth';

type AuthMode = 'pin' | 'email' | 'register';
type EmailStep = 'input' | 'otp';

export default function StudioPage() {
  const { currentUser, setCurrentUser, fetchCurrentSession } = useStudioStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('pin');
  const [emailStep, setEmailStep] = useState<EmailStep>('input');

  // Master Tour PIN State
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Registration State
  const [regName, setRegName] = useState('Henry IX');
  const [regEmail, setRegEmail] = useState('henryixdj@gmail.com');
  const [regRole, setRegRole] = useState<'owner' | 'manager' | 'media' | 'viewer'>('owner');

  // Email Sign-In State
  const [email, setEmail] = useState('henryixdj@gmail.com');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [codePreview, setCodePreview] = useState<string | null>(null);

  // Common UI State
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  // 1. Master Tour PIN Handlers (180800)
  // -------------------------------------------------------------------
  const handlePinSubmit = async (pinValue?: string) => {
    const codeToVerify = pinValue || pinDigits.join('');
    if (codeToVerify.length !== 6) {
      setErrorMessage('ENTER 6-DIGIT MASTER TOUR PIN');
      return;
    }

    playTactileClick();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/studio/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: codeToVerify }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'INCORRECT MASTER PIN');
        setPinDigits(['', '', '', '', '', '']);
        pinInputRefs.current[0]?.focus();
        return;
      }

      playNotificationChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('AUTHENTICATION FAILED. PLEASE RETRY.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantOwnerBypass = () => {
    handlePinSubmit('180800');
  };

  const handlePinChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const nextDigits = [...pinDigits];
    nextDigits[index] = char;
    setPinDigits(nextDigits);
    playTactileClick();

    if (char && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }

    const fullCode = nextDigits.join('');
    if (fullCode.length === 6 && !nextDigits.includes('')) {
      handlePinSubmit(fullCode);
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handleNumpadClick = (num: string) => {
    playTactileClick();
    const firstEmptyIndex = pinDigits.findIndex((d) => d === '');
    if (firstEmptyIndex !== -1) {
      const nextDigits = [...pinDigits];
      nextDigits[firstEmptyIndex] = num;
      setPinDigits(nextDigits);

      if (firstEmptyIndex < 5) {
        pinInputRefs.current[firstEmptyIndex + 1]?.focus();
      }

      const fullCode = nextDigits.join('');
      if (fullCode.length === 6 && !nextDigits.includes('')) {
        handlePinSubmit(fullCode);
      }
    }
  };

  const handleClearPin = () => {
    playTactileClick();
    setPinDigits(['', '', '', '', '', '']);
    setErrorMessage(null);
    pinInputRefs.current[0]?.focus();
  };

  // -------------------------------------------------------------------
  // 2. Operator Registration Handlers
  // -------------------------------------------------------------------
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regEmail.includes('@')) {
      setErrorMessage('VALID EMAIL ADDRESS REQUIRED');
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
          name: regName,
          email: regEmail,
          role: regRole,
        }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'REGISTRATION FAILED');
        return;
      }

      playNotificationChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('SERVER ERROR DURING REGISTRATION');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------------
  // 3. Email Code Handlers
  // -------------------------------------------------------------------
  const handleSendEmailCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('ENTER A VALID EMAIL ADDRESS');
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
        body: JSON.stringify({ action: 'send', email }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'FAILED TO SEND VERIFICATION CODE');
        return;
      }

      setStatusMessage(`6-DIGIT CODE SENT TO ${email.toUpperCase()}`);
      if (data.codePreview) {
        setCodePreview(data.codePreview);
      }
      setEmailStep('otp');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);
    } catch {
      setErrorMessage('FAILED TO DISPATCH VERIFICATION CODE');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailCode = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || otpCode.join('');
    if (finalCode.length !== 6) {
      setErrorMessage('ENTER 6-DIGIT CODE');
      return;
    }

    playTactileClick();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/studio/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code: finalCode }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'INVALID VERIFICATION CODE');
        setOtpCode(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        return;
      }

      playNotificationChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('VERIFICATION FAILED');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFillCode = () => {
    if (codePreview && codePreview.length === 6) {
      const digits = codePreview.split('');
      setOtpCode(digits);
      handleVerifyEmailCode(codePreview);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const nextCode = [...otpCode];
    nextCode[index] = char;
    setOtpCode(nextCode);
    playTactileClick();

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (nextCode.join('').length === 6 && !nextCode.includes('')) {
      handleVerifyEmailCode(nextCode.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Emergency Panic Blackout Screen
  if (isBlackout) {
    return (
      <div 
        className="fixed inset-0 z-[9999] bg-black cursor-none flex items-center justify-center" 
        onClick={() => setIsBlackout(false)}
        title="Holding Esc for 1.5s triggered Emergency Panic Blackout. Click to resume."
      >
        <div className="text-zinc-900 text-[10px] font-mono tracking-widest uppercase select-none opacity-20">
          HENRY IX // BLACKOUT ACTIVE // CLICK TO RESUME
        </div>
      </div>
    );
  }

  // Once authenticated, render the Master Studio Shell
  if (isAuthenticated) {
    return <StudioShell />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0c0d10] text-zinc-100 font-sans relative overflow-hidden select-none px-4 py-8">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#E53558]/12 via-[#3b82f6]/6 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-md p-7 sm:p-8 border border-white/[0.08] bg-[#14151a]/95 backdrop-blur-2xl rounded-2xl shadow-2xl">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#E53558] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">
              HENRY IX // BACKSTAGE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-sans">Studio Workspace</h1>
          <p className="text-xs text-zinc-400 mt-1">Authenticate or register operator credentials to enter</p>
        </div>

        {/* Status & Error Feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-xs text-center flex items-center justify-center gap-2 animate-in fade-in duration-150">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="mb-4 p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs text-center flex items-center justify-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* 3-Way Mode Switcher Tabs */}
        <div className="flex p-1 bg-[#0c0d10] border border-white/[0.06] rounded-xl mb-6 gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setAuthMode('pin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'pin'
                ? 'bg-[#242630] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <KeyRound size={13} className={authMode === 'pin' ? 'text-[#E53558]' : ''} />
            <span>Tour PIN</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setAuthMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'register'
                ? 'bg-[#242630] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <UserPlus size={13} className={authMode === 'register' ? 'text-emerald-400' : ''} />
            <span>Register</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTactileClick();
              setAuthMode('email');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMode === 'email'
                ? 'bg-[#242630] text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <Mail size={13} className={authMode === 'email' ? 'text-blue-400' : ''} />
            <span>Email</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: MASTER TOUR PIN (180800)                                          */}
        {/* ========================================================================= */}
        {authMode === 'pin' && (
          <div className="space-y-5">
            {/* 1-Click Master Owner Instant Access Bypass Button */}
            <button
              type="button"
              onClick={handleInstantOwnerBypass}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#E53558] to-[#b91c3d] hover:from-[#f43f5e] hover:to-[#E53558] text-white rounded-xl font-medium text-xs shadow-lg shadow-[#E53558]/20 transition-all flex items-center justify-between group"
            >
              <span className="flex items-center gap-2">
                <Zap size={16} className="text-amber-300 group-hover:scale-110 transition-transform" />
                <span className="font-semibold tracking-wide">1-Click Owner Access (Henry IX)</span>
              </span>
              <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded border border-white/10 text-zinc-200">
                MASTER KEY
              </span>
            </button>

            <div className="w-full h-[1px] bg-white/[0.06] relative my-3">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#14151a] px-3 text-[10px] tracking-wider text-zinc-500 uppercase font-mono">
                OR ENTER MASTER PIN
              </div>
            </div>

            {/* 6-Digit PIN Display Input */}
            <div className="flex justify-center gap-2">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { pinInputRefs.current[idx] = el; }}
                  type="password"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(idx, e)}
                  className="w-11 h-12 text-center text-xl font-bold bg-zinc-950/80 border border-white/[0.08] rounded-xl text-white focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-mono"
                />
              ))}
            </div>

            {/* Tactile Hardware Numpad */}
            <div className="grid grid-cols-3 gap-2 pt-2 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleNumpadClick(num)}
                  className="h-11 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] hover:border-white/20 text-white font-mono font-semibold text-base transition-all active:scale-95 flex items-center justify-center shadow-sm"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleClearPin}
                className="h-11 rounded-xl bg-zinc-950/80 hover:bg-zinc-900 border border-white/[0.06] text-zinc-400 hover:text-zinc-200 font-mono text-xs transition-all active:scale-95 flex items-center justify-center"
              >
                CLEAR
              </button>
              <button
                type="button"
                onClick={() => handleNumpadClick('0')}
                className="h-11 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.06] hover:border-white/20 text-white font-mono font-semibold text-base transition-all active:scale-95 flex items-center justify-center shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handlePinSubmit()}
                disabled={isLoading}
                className="h-11 rounded-xl bg-[#E53558] hover:bg-[#d82a4d] text-white font-mono font-semibold text-xs transition-all active:scale-95 flex items-center justify-center shadow-sm"
              >
                {isLoading ? <RefreshCw size={14} className="animate-spin" /> : 'ENTER'}
              </button>
            </div>

            <div className="text-center pt-2 text-[11px] text-zinc-500 font-mono">
              Default Tour PIN: <span className="text-zinc-300 font-bold">180800</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: REGISTER NEW OPERATOR                                             */}
        {/* ========================================================================= */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Operator Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Henry IX"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-white/[0.08] rounded-xl text-white text-xs placeholder:text-zinc-500 focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="henryixdj@gmail.com"
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-white/[0.08] rounded-xl text-white text-xs placeholder:text-zinc-500 focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Assigned Role</label>
              <select
                value={regRole}
                onChange={(e) => setRegRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-zinc-950/80 border border-white/[0.08] rounded-xl text-white text-xs focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-mono"
              >
                <option value="owner">Owner / Resident DJ (Henry IX)</option>
                <option value="manager">Tour & Booking Manager</option>
                <option value="media">Media & Visuals Director</option>
                <option value="viewer">Guest Sound Engineer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 mt-2"
            >
              {isLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Create Operator Account & Enter</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <div className="text-center pt-2 text-[11px] text-zinc-500">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('pin')}
                className="text-[#E53558] hover:underline font-medium"
              >
                Sign in with Master PIN
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: EMAIL VERIFICATION CODE                                           */}
        {/* ========================================================================= */}
        {authMode === 'email' && (
          <div className="space-y-4">
            {emailStep === 'input' ? (
              <form onSubmit={handleSendEmailCode} className="space-y-3">
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="henryixdj@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-950/80 border border-white/[0.08] rounded-xl text-white text-xs placeholder:text-zinc-500 focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-[#E53558] hover:bg-[#d82a4d] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <>
                      <span>Send Access Code</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <div className="text-center pt-2 text-[11px] text-zinc-500">
                  Prefer instant access?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('pin')}
                    className="text-[#E53558] hover:underline font-medium"
                  >
                    Use Master PIN (180800)
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center text-xs text-zinc-400">
                  Enter the 6-digit access code sent to:
                  <div className="font-bold text-white mt-1 font-mono">{email}</div>
                </div>

                {/* Dev Code Auto-Fill Helper */}
                {codePreview && (
                  <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-center flex flex-col gap-1.5">
                    <div className="text-blue-300 font-mono text-[11px]">
                      DEV ACCESS CODE: <span className="text-white font-bold">{codePreview}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillCode}
                      className="text-[11px] text-white bg-blue-600 hover:bg-blue-500 py-1 px-2.5 rounded-lg font-medium transition-colors"
                    >
                      ⚡ 1-Click Auto-Fill & Enter
                    </button>
                  </div>
                )}

                {/* 6-Digit OTP Box Grid */}
                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-xl font-bold bg-zinc-950/80 border border-white/[0.08] rounded-xl text-white focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-mono"
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyEmailCode()}
                  disabled={isLoading || otpCode.join('').length !== 6}
                  className="w-full py-2.5 bg-[#E53558] hover:bg-[#d82a4d] text-white font-medium text-xs rounded-xl transition-all shadow-sm disabled:opacity-40"
                >
                  {isLoading ? 'Verifying Code...' : 'Verify & Enter Studio'}
                </button>

                <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => handleSendEmailCode()}
                    className="hover:text-white transition-colors"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailStep('input')}
                    className="hover:text-white transition-colors"
                  >
                    Change Email
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Emergency Blackout Notice */}
        <div className="mt-7 text-center text-[10px] text-zinc-500 tracking-wider font-mono border-t border-white/[0.04] pt-4">
          HOLD <kbd className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 rounded text-zinc-300">ESC</kbd> 1.5s FOR EMERGENCY BLACKOUT
        </div>

      </div>
    </div>
  );
}
