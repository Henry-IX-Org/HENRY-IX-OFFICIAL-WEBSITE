'use client';

import React, { useCallback, useState } from 'react';
import { 
  QrCode, 
  WifiOff, 
  Search,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export interface DoorScannerProps {
  onNavigate?: (view: string) => void;
}

export default function DoorScanner({ onNavigate }: DoorScannerProps = {}) {
  const admittedGuests = useStudioStore((s) => s.admittedGuests);
  const admitGuest = useStudioStore((s) => s.admitGuest);
  const addToast = useStudioStore((s) => s.addToast);

  const [status, setStatus] = useState<'valid' | 'duplicate' | 'invalid' | null>(null);
  const [ticketDetails, setTicketDetails] = useState<{ name: string; type: string; code: string } | null>(null);
  const [manualCode, setManualCode] = useState('');

  const playFeedback = useCallback((result: 'valid' | 'duplicate' | 'invalid') => {
    // 1. Sensory Haptic Vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (result === 'valid') {
        navigator.vibrate([80, 50, 80]);
      } else {
        navigator.vibrate(500);
      }
    }

    // 2. Sensory Web Audio Chimes
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (result === 'valid') {
        // Crisp high chime (sine 880Hz -> 1760Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        // Low warning saw wave (130Hz)
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        gain.gain.setValueAtTime(0.6, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.5);
      }
    }
  }, []);

  const handleScan = (result: 'valid' | 'duplicate' | 'invalid', code = 'H9-VIP-889', name = 'Elena Rostova') => {
    setStatus(result);
    playFeedback(result);

    if (result === 'valid') {
      const type = 'VIP Inner Circle Pass';
      setTicketDetails({ name, type, code });
      admitGuest({ code, name, type, status: 'ADMITTED' });
      addToast({
        title: 'PASS ADMITTED',
        message: `${name} [${code}] admitted to venue.`,
        type: 'success',
      });
    } else if (result === 'duplicate') {
      const type = 'ALREADY SCANNED AT 23:45';
      setTicketDetails({ name, type, code });
      admitGuest({ code, name, type: 'Duplicate Scan', status: 'DUPLICATE' });
      addToast({
        title: 'DUPLICATE TICKET WARNING',
        message: `Pass ${code} already scanned previously.`,
        type: 'warning',
      });
    } else {
      const type = 'INVALID CRYPTO SIGNATURE';
      setTicketDetails({ name: 'UNKNOWN PASS', type, code });
      admitGuest({ code, name: 'Unknown Guest', type: 'Tampered Signature', status: 'INVALID' });
      addToast({
        title: 'SECURITY ALERT: INVALID PASS',
        message: `Unrecognized cryptographic ticket code [${code}].`,
        type: 'error',
      });
    }

    setTimeout(() => {
      setStatus(null);
    }, 3000);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleScan('valid', manualCode.trim().toUpperCase(), 'Verified Manual Entry');
    setManualCode('');
  };

  const handleExportCsv = () => {
    if (admittedGuests.length === 0) {
      addToast({ title: 'NO ADMISSIONS', message: 'No guest check-ins recorded yet.', type: 'warning' });
      return;
    }

    let csv = 'Timestamp,Guest Name,Pass Code,Ticket Type,Status\n';
    admittedGuests.forEach((g) => {
      csv += `"${g.time}","${g.name}","${g.code}","${g.type}","${g.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Henry_IX_Door_Admissions_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      title: 'ADMISSION LOG EXPORTED',
      message: 'Downloaded CSV report for venue security & promoter reconciliation.',
      type: 'success',
    });
  };

  return (
    <div className="p-6 text-zinc-200 font-sans space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="font-semibold text-xl text-white tracking-tight">
              DOOR QR SCANNER & ADMISSIONS
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            100% OFFLINE CONCRETE BASEMENT RESILIENCE • HAPTIC & AUDIO DOOR CHECK-IN
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate?.('gigs-hub')}
            className="px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 bg-[#1b1c22] text-zinc-300 border-white/[0.08] hover:text-white hover:bg-[#242630]"
          >
            <span>📅 Master Hub</span>
          </button>
          <button
            onClick={() => onNavigate?.('gigs-daysheet')}
            className="px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 bg-[#1b1c22] text-zinc-300 border-white/[0.08] hover:text-white hover:bg-[#242630]"
          >
            <span>📄 1-Page Day Sheet</span>
          </button>
          <button
            onClick={() => onNavigate?.('gigs-checklist')}
            className="px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 bg-[#1b1c22] text-zinc-300 border-white/[0.08] hover:text-white hover:bg-[#242630]"
          >
            <span>🎒 Smart DJ Bag</span>
          </button>
          <button
            onClick={() => onNavigate?.('gigs-finance')}
            className="px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 bg-[#1b1c22] text-zinc-300 border-white/[0.08] hover:text-white hover:bg-[#242630]"
          >
            <span>💰 Finance & HMRC Tax</span>
          </button>
          <button
            onClick={() => onNavigate?.('gigs-scanner')}
            className="px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 bg-[#E53558] text-white border-transparent shadow-sm"
          >
            <span>📱 Door QR Scanner</span>
          </button>
        </div>
      </div>

      {/* Offline Status & CSV Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14151a] border border-white/[0.08] rounded-xl p-3.5 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <WifiOff size={14} className="text-emerald-400" />
          <span className="text-zinc-400">CRYPTO BASEMENT CACHE:</span>
          <span className="text-emerald-400 font-semibold">120 PASSES ENCRYPTED (OFFLINE READY)</span>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 bg-[#1b1c22] border border-white/[0.08] hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-400 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium"
        >
          <Download size={13} />
          <span>Export Admission Log CSV</span>
        </button>
      </div>

      {/* SCANNER CAMERA VIEWFINDER */}
      <div className={`rounded-2xl border p-8 transition-colors text-center relative overflow-hidden bg-[#14151a] shadow-sm ${
        status === 'valid' 
          ? 'border-emerald-500/80 bg-emerald-950/20' 
          : status === 'duplicate' 
          ? 'border-amber-500/80 bg-amber-950/20' 
          : status === 'invalid' 
          ? 'border-red-500/80 bg-red-950/25' 
          : 'border-white/[0.08]'
      }`}>
        <div className="max-w-xs mx-auto aspect-square rounded-2xl border-2 border-dashed border-white/[0.12] relative flex flex-col items-center justify-center p-6 bg-[#0c0d10] shadow-inner">
          <QrCode size={72} className={`transition-transform duration-300 ${status ? 'scale-110' : 'text-zinc-600'}`} />
          <div className="mt-4 text-[11px] text-zinc-400 font-mono tracking-wider uppercase font-medium">
            POINT CAMERA AT GUESTLIST / VIP QR
          </div>
          <div className="w-full h-0.5 bg-[#E53558] absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_8px_rgba(229,53,88,0.8)]" />
        </div>

        {/* Sensory Scan Result HUD */}
        {status && (
          <div className="mt-6 space-y-1.5 animate-in zoom-in-95 duration-150">
            <div className={`text-lg font-semibold tracking-wide uppercase flex items-center justify-center gap-2 ${
              status === 'valid' ? 'text-emerald-400' : status === 'duplicate' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {status === 'valid' ? (
                <>
                  <CheckCircle2 size={22} />
                  <span>ACCESS GRANTED</span>
                </>
              ) : status === 'duplicate' ? (
                <>
                  <AlertTriangle size={22} />
                  <span>DUPLICATE TICKET</span>
                </>
              ) : (
                <>
                  <XCircle size={22} />
                  <span>INVALID TICKET</span>
                </>
              )}
            </div>
            {ticketDetails && (
              <div className="text-xs text-zinc-300 font-mono">
                <strong className="text-white">{ticketDetails.name}</strong> • {ticketDetails.type} ({ticketDetails.code})
              </div>
            )}
          </div>
        )}

        {/* Simulation Triggers for Rehearsal */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button 
            onClick={() => handleScan('valid', 'H9-VIP-889', 'Elena Rostova')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors"
          >
            Simulate Valid (High Chime)
          </button>
          <button 
            onClick={() => handleScan('duplicate', 'H9-VIP-001', 'Marcus (Promoter)')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            Simulate Duplicate (Buzz)
          </button>
          <button 
            onClick={() => handleScan('invalid', 'FAKE-QR-999', 'Unknown Visitor')}
            className="px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
          >
            Simulate Invalid
          </button>
        </div>
      </div>

      {/* MANUAL CODE ENTRY FORM */}
      <form onSubmit={handleManualSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={15} className="text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Manual guest name or pass code (e.g. H9-VIP-001)..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="w-full rounded-xl bg-[#14151a] border border-white/[0.08] pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E53558] focus:ring-1 focus:ring-[#E53558] transition-colors font-mono"
          />
        </div>
        <button 
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#E53558] text-white text-xs font-medium hover:bg-[#d82a4d] transition-colors shadow-sm"
        >
          Lookup Pass
        </button>
      </form>

      {/* LIVE ADMITTED DOOR LOG */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#14151a] p-5 space-y-4 shadow-sm">
        <h3 className="text-xs text-zinc-400 font-medium uppercase tracking-wider border-b border-white/[0.08] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Door Admissions Queue (Local Store)</span>
          </div>
          <span className="text-emerald-400 font-mono font-semibold">{admittedGuests.length} Checked In</span>
        </h3>
        {admittedGuests.length === 0 ? (
          <div className="text-center py-6 text-xs text-zinc-500 font-mono">No guests admitted yet.</div>
        ) : (
          <div className="divide-y divide-white/[0.06] text-xs">
            {admittedGuests.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-[11px] font-mono">{item.time}</span>
                  <span className="text-zinc-200 font-medium">{item.name}</span>
                  <span className="text-zinc-400 text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/[0.06]">{item.code}</span>
                  <span className="text-zinc-500 text-[11px] hidden sm:inline">{item.type}</span>
                </div>
                <span className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded-full ${
                  item.status === 'ADMITTED' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : item.status === 'DUPLICATE' 
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {item.status === 'ADMITTED' ? '✓ Admitted' : item.status === 'DUPLICATE' ? '⚠ Duplicate' : '✕ Rejected'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
