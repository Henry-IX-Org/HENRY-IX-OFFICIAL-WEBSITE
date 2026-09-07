'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import StudioShell from '@/components/studio/StudioShell';
import { useStudioStore } from '@/store/studioStore';
import { ShieldCheck, Fingerprint, Mail, ArrowRight, RefreshCw, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import type { StudioUserProfile } from '@/lib/studioAuth';

type AuthStep = 'initial' | 'email-code' | 'totp-2fa';

export default function StudioPage() {
  const { currentUser, setCurrentUser, fetchCurrentSession } = useStudioStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('initial');
  
  // Inputs & State
  const [email, setEmail] = useState('henryixdj@gmail.com');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [totpCode, setTotpCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [codePreview, setCodePreview] = useState<string | null>(null);
  const [isBlackout, setIsBlackout] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const escPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Audio Context for tactile clicks & confirmation chimes
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
    try {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtxRef.current.currentTime + 0.04);

      gainNode.gain.setValueAtTime(0.5, audioCtxRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.04);

      osc.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);

      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.04);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  const playSuccessChime = useCallback(() => {
    if (!audioCtxRef.current) return;
    try {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C chord
      notes.forEach((freq, idx) => {
        const osc = audioCtxRef.current!.createOscillator();
        const gain = audioCtxRef.current!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtxRef.current!.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.3, audioCtxRef.current!.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current!.currentTime + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(audioCtxRef.current!.destination);
        osc.start(audioCtxRef.current!.currentTime + idx * 0.06);
        osc.stop(audioCtxRef.current!.currentTime + idx * 0.06 + 0.35);
      });
    } catch {}
  }, []);

  // Check existing active session on mount & URL parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlError = searchParams.get('error');
      if (urlError) {
        setErrorMessage(decodeURIComponent(urlError));
      }
      const stepParam = searchParams.get('step');
      const userIdParam = searchParams.get('userId');
      if (stepParam === 'totp-2fa' && userIdParam) {
        setPendingUserId(userIdParam);
        setAuthStep('totp-2fa');
      }
    }

    fetchCurrentSession().then((user) => {
      if (user) {
        setIsAuthenticated(true);
      }
    });
  }, [fetchCurrentSession]);

  // 1.5s Emergency Panic Blackout (Esc) Listener
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

  // -------------------------------------------------------------
  // 1. Email Verification Code Sign-In Flow
  // -------------------------------------------------------------
  const handleSendEmailCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('PLEASE ENTER A VALID EMAIL ADDRESS');
      return;
    }

    playTactileClick(900);
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
      setAuthStep('email-code');
      // Focus first OTP box
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch {
      setErrorMessage('CONNECTION ERROR. CHECK NETWORK.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    playTactileClick(1000);
    const digit = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = digit;
    setOtpCode(newOtp);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when 6 digits are entered
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleVerifyEmailCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!paste) return;
    const newOtp = paste.split('').concat(Array(6 - paste.length).fill(''));
    setOtpCode(newOtp);
    if (paste.length === 6) {
      handleVerifyEmailCode(paste);
    } else {
      otpInputRefs.current[Math.min(paste.length, 5)]?.focus();
    }
  };

  const handleVerifyEmailCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode.join('');
    if (code.length !== 6) {
      setErrorMessage('PLEASE ENTER ALL 6 DIGITS');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/studio/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email, code }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'INVALID VERIFICATION CODE');
        setOtpCode(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        return;
      }

      // Check if 2FA is required for this user
      if (data.requires2fa) {
        setPendingUserId(data.userId);
        setAuthStep('totp-2fa');
        setStatusMessage(data.message);
        return;
      }

      // Successful login
      playSuccessChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('VERIFICATION FAILED. RETRY.');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. WebAuthn Biometric Passkey Sign-In Flow
  // -------------------------------------------------------------
  const handlePasskeySignIn = async () => {
    playTactileClick(1100);
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('PROMPTING BIOMETRIC PASSKEY...');

    try {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        setErrorMessage('WEBAUTHN NOT SUPPORTED ON THIS BROWSER');
        return;
      }

      // 1. Fetch challenge from server
      const challengeRes = await fetch('/api/studio/auth/passkey');
      const challengeData = (await challengeRes.json()) as any;

      if (!challengeRes.ok || !challengeData.challenge) {
        setErrorMessage('FAILED TO INITIALIZE BIOMETRIC CHALLENGE');
        return;
      }

      // Convert challenge base64url to Uint8Array
      const challengeBuffer = Uint8Array.from(
        atob(challengeData.challenge.replace(/-/g, '+').replace(/_/g, '/')), 
        c => c.charCodeAt(0)
      );

      // 2. Trigger browser WebAuthn - strictly handle dismissals/cancellations
      let credential: any;
      try {
        credential = await navigator.credentials.get({
          publicKey: {
            challenge: challengeBuffer,
            timeout: 60000,
            userVerification: 'preferred',
            rpId: window.location.hostname === 'localhost' ? 'localhost' : undefined,
          },
        });
      } catch (webauthnErr: any) {
        console.warn('WebAuthn prompt error or cancelled:', webauthnErr);
        setErrorMessage('BIOMETRIC AUTHENTICATION CANCELLED OR NOT DETECTED');
        return;
      }

      if (!credential?.id) {
        setErrorMessage('NO BIOMETRIC CREDENTIAL RETURNED');
        return;
      }

      // 3. Verify genuine passkey on server
      const verifyRes = await fetch('/api/studio/auth/passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', credential: { id: credential.id } }),
      });
      const data = (await verifyRes.json()) as any;

      if (!verifyRes.ok) {
        setErrorMessage(data.error || 'PASSKEY NOT RECOGNIZED. SIGN IN WITH EMAIL TO ENROLL.');
        return;
      }

      if (data.requires2fa) {
        setPendingUserId(data.userId);
        setAuthStep('totp-2fa');
        setStatusMessage(data.message);
        return;
      }

      playSuccessChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'BIOMETRIC PASSKEY REJECTED');
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 3. Federated OAuth (Google & Apple)
  // -------------------------------------------------------------
  const handleFederatedSignIn = async (provider: 'google' | 'apple') => {
    playTactileClick(950);
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(`INITIALIZING ${provider.toUpperCase()} AUTHENTICATION...`);

    if (provider === 'google') {
      window.location.href = '/api/studio/auth/google';
      return;
    }

    // Apple Music / Apple ID is on standby
    setErrorMessage('APPLE SIGN-IN IS ON STANDBY (REQUIRES £79/YR APPLE DEVELOPER MEMBERSHIP). PLEASE SIGN IN WITH GOOGLE OR EMAIL.');
    setIsLoading(false);
  };

  // -------------------------------------------------------------
  // 4. TOTP 2FA Verification Flow
  // -------------------------------------------------------------
  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!totpCode || totpCode.trim().length !== 6) {
      setErrorMessage('ENTER 6-DIGIT AUTHENTICATOR CODE');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/studio/auth/totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-login',
          userId: pendingUserId,
          code: totpCode.trim(),
        }),
      });
      const data = (await res.json()) as any;

      if (!res.ok) {
        setErrorMessage(data.error || 'INVALID AUTHENTICATOR CODE');
        return;
      }

      playSuccessChime();
      setCurrentUser(data.user);
      setIsAuthenticated(true);
    } catch {
      setErrorMessage('2FA VERIFICATION FAILED');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen flex items-center justify-center bg-[#0c0d10] text-zinc-100 font-sans relative overflow-hidden select-none px-4">
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#E53558]/10 via-[#3b82f6]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Sign-In Card (Notion & Antigravity Design) */}
      <div className="relative z-10 w-full max-w-md p-8 border border-white/[0.08] bg-[#14151a]/95 backdrop-blur-2xl rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#E53558] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase font-mono">HENRY IX // BACKSTAGE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Studio Workspace</h1>
          <p className="text-xs text-zinc-400 mt-1">Authenticate to access mission control & broadcast consoles</p>
        </div>

        {/* Status / Alert Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-500/30 rounded-lg text-red-400 text-xs text-center flex items-center justify-center gap-2">
            <AlertCircle size={14} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 text-xs text-center flex items-center justify-center gap-2">
            <CheckCircle2 size={14} className="text-[#10b981] flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {codePreview && (
          <div className="mb-4 p-3 bg-blue-950/30 border border-blue-500/30 rounded-lg text-blue-300 text-xs text-center font-mono">
            DEV ACCESS CODE: <span className="text-white font-bold ml-1">{codePreview}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 1: INITIAL SIGN-IN CHOICES                           */}
        {/* ========================================================= */}
        {authStep === 'initial' && (
          <div className="space-y-4">
            {/* Primary Biometric Passkey Button */}
            <button
              type="button"
              onClick={handlePasskeySignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 rounded-lg border border-white/[0.08] hover:border-white/20 transition-all flex items-center justify-between text-xs font-medium shadow-sm group"
            >
              <span className="flex items-center gap-2.5">
                <Fingerprint size={16} className="text-[#E53558] group-hover:scale-110 transition-transform" />
                <span>Sign in with Passkey</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">TOUCH / FACE ID</span>
            </button>

            {/* Divider */}
            <div className="w-full h-[1px] bg-white/[0.06] relative my-2">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#14151a] px-3 text-[10px] tracking-wider text-zinc-500 uppercase font-mono">
                OR EMAIL ACCESS CODE
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleSendEmailCode} className="space-y-3">
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@henryix.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-950/80 border border-white/[0.08] rounded-lg text-white text-xs placeholder:text-zinc-500 focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#E53558] hover:bg-[#f43f5e] text-white text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#E53558]/25"
              >
                {isLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Federated OAuth Buttons (Google & Apple) */}
            <div className="w-full h-[1px] bg-white/[0.06] relative my-2">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#14151a] px-3 text-[10px] tracking-wider text-zinc-500 uppercase font-mono">
                CONNECTED IDENTITIES
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleFederatedSignIn('google')}
                disabled={isLoading}
                className="py-2.5 px-3 bg-zinc-950/80 hover:bg-zinc-800/80 border border-white/[0.08] hover:border-white/20 text-zinc-200 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-medium"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleFederatedSignIn('apple')}
                disabled={isLoading}
                className="py-2.5 px-3 bg-zinc-950/80 hover:bg-zinc-800/80 border border-white/[0.08] hover:border-white/20 text-zinc-200 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-medium"
              >
                <span> Apple ID</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: 6-DIGIT EMAIL VERIFICATION CODE ENTRY             */}
        {/* ========================================================= */}
        {authStep === 'email-code' && (
          <div className="space-y-5">
            <div className="text-center text-xs text-zinc-400">
              Enter the 6-digit access code sent to:
              <div className="font-bold text-white mt-1 font-mono">{email}</div>
            </div>

            {/* 6-Digit OTP Box Grid */}
            <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpInputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 text-center text-xl font-bold bg-zinc-950/80 border border-white/[0.08] rounded-lg text-white focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none transition-all font-mono"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleVerifyEmailCode()}
              disabled={isLoading || otpCode.join('').length !== 6}
              className="w-full py-2.5 bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs rounded-lg transition-all shadow-sm shadow-[#E53558]/25 disabled:opacity-40"
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
                onClick={() => {
                  setAuthStep('initial');
                  setOtpCode(['', '', '', '', '', '']);
                  setErrorMessage(null);
                }}
                className="hover:text-white transition-colors"
              >
                Use Different Email
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 3: TOTP AUTHENTICATOR APP (2FA)                      */}
        {/* ========================================================= */}
        {authStep === 'totp-2fa' && (
          <form onSubmit={handleVerifyTotp} className="space-y-4">
            <div className="text-center text-xs text-zinc-400">
              <KeyRound size={24} className="mx-auto mb-2 text-[#E53558]" />
              <div className="font-semibold text-white">Two-Factor Authentication</div>
              <div className="text-[11px] text-zinc-500 mt-1">
                Enter the 6-digit code from Google Authenticator or 1Password
              </div>
            </div>

            <input
              type="text"
              maxLength={6}
              required
              autoFocus
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="000000"
              className="w-full py-3 bg-zinc-950/80 border border-white/[0.08] rounded-lg text-white text-2xl font-mono text-center tracking-[0.5em] focus:border-[#E53558] focus:ring-2 focus:ring-[#E53558]/20 focus:outline-none"
            />

            <button
              type="submit"
              disabled={isLoading || totpCode.length !== 6}
              className="w-full py-2.5 bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs rounded-lg transition-all shadow-sm shadow-[#E53558]/25 disabled:opacity-40"
            >
              {isLoading ? 'Verifying 2FA...' : 'Confirm Authenticator Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setAuthStep('initial')}
                className="text-[10px] text-zinc-500 hover:text-white transition-colors"
              >
                Back to Sign In Options
              </button>
            </div>
          </form>
        )}

        {/* Emergency Blackout Notice */}
        <div className="mt-8 text-center text-[10px] text-zinc-500 tracking-wider font-mono">
          HOLD <kbd className="px-1.5 py-0.5 border border-zinc-800 bg-zinc-900 rounded text-zinc-300">ESC</kbd> 1.5s FOR EMERGENCY BLACKOUT
        </div>

      </div>
    </div>
  );
}
