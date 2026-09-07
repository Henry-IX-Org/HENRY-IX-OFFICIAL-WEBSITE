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
  FileSpreadsheet
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
    <div className="p-6 bg-black text-white font-mono space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h2 className="font-avathe text-2xl text-white tracking-widest uppercase">
              MODULE 04 // GIGS &amp; TOUR LOGISTICS
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">100% OFFLINE CONCRETE BASEMENT RESILIENCE • HAPTIC &amp; AUDIO DOOR CHECK-IN</p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate ? onNavigate('gigs-hub') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>📅 Master Hub</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('gigs-daysheet') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>📄 1-Page Day Sheet</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('gigs-checklist') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>🎒 Smart DJ Bag</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('gigs-finance') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-zinc-950 text-zinc-400 border-zinc-900 hover:text-white"
          >
            <span>💰 Finance &amp; HMRC Tax</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('gigs-scanner') : null}
            className="px-3 py-1.5 rounded-sm border font-bold transition-all flex items-center gap-1.5 bg-[#D8163F] text-white border-[#D8163F] shadow-[0_0_10px_rgba(216,22,63,0.4)]"
          >
            <span>📱 Door QR Scanner</span>
          </button>
        </div>
      </div>

      {/* Offline Status & CSV Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950 border border-zinc-900 p-3 text-xs">
        <div className="flex items-center gap-2">
          <WifiOff size={13} className="text-emerald-400" />
          <span className="text-zinc-400">CRYPTO BASEMENT CACHE:</span>
          <span className="text-emerald-400 font-bold">120 PASSES ENCRYPTED (OFFLINE READY)</span>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-zinc-300 hover:text-emerald-400 text-xs flex items-center gap-1.5 transition-colors font-bold"
        >
          <Download size={12} />
          <span>Export Admission Log CSV</span>
        </button>
      </div>

      {/* SCANNER CAMERA VIEWFINDER (SKEUOMORPHIC) */}
      <div className={`border-2 p-8 transition-colors text-center relative overflow-hidden bg-zinc-950 ${
        status === 'valid' 
          ? 'border-emerald-500 bg-emerald-950/20' 
          : status === 'duplicate' 
          ? 'border-yellow-500 bg-yellow-950/20' 
          : status === 'invalid' 
          ? 'border-red-600 bg-red-950/30' 
          : 'border-zinc-800'
      }`}>
        <div className="absolute inset-0 bayer-dither opacity-10 pointer-events-none" />

        <div className="max-w-xs mx-auto aspect-square border-2 border-dashed border-zinc-700 relative flex flex-col items-center justify-center p-6 bg-black">
          <QrCode size={64} className={`transition-transform duration-300 ${status ? 'scale-110' : 'text-zinc-700'}`} />
          <div className="mt-4 text-[10px] text-zinc-500 tracking-widest uppercase">
            POINT CAMERA AT GUESTLIST / VIP QR
          </div>
          <div className="w-full h-0.5 bg-[#D8163F] absolute top-1/2 -translate-y-1/2 animate-pulse" />
        </div>

        {/* Sensory Scan Result HUD */}
        {status && (
          <div className="mt-6 space-y-1 animate-in zoom-in-95 duration-150">
            <div className={`text-xl font-bold tracking-widest uppercase flex items-center justify-center gap-2 ${
              status === 'valid' ? 'text-emerald-400' : status === 'duplicate' ? 'text-yellow-400' : 'text-red-500'
            }`}>
              {status === 'valid' ? (
                <>
                  <CheckCircle2 size={20} />
                  <span>ACCESS GRANTED</span>
                </>
              ) : status === 'duplicate' ? (
                <>
                  <AlertTriangle size={20} />
                  <span>DUPLICATE TICKET</span>
                </>
              ) : (
                <>
                  <XCircle size={20} />
                  <span>INVALID TICKET</span>
                </>
              )}
            </div>
            {ticketDetails && (
              <div className="text-xs text-zinc-300">
                <strong>{ticketDetails.name}</strong> • {ticketDetails.type} ({ticketDetails.code})
              </div>
            )}
          </div>
        )}

        {/* Simulation Triggers for Rehearsal */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <button 
            onClick={() => handleScan('valid', 'H9-VIP-889', 'Elena Rostova')}
            className="px-3 py-1.5 bg-emerald-950 border border-emerald-600 text-emerald-400 text-xs font-bold hover:bg-emerald-600 hover:text-black transition-colors"
          >
            SIMULATE VALID (HIGH CHIME)
          </button>
          <button 
            onClick={() => handleScan('duplicate', 'H9-VIP-001', 'Marcus (Promoter)')}
            className="px-3 py-1.5 bg-yellow-950 border border-yellow-600 text-yellow-400 text-xs font-bold hover:bg-yellow-600 hover:text-black transition-colors"
          >
            SIMULATE DUPLICATE (BUZZ)
          </button>
          <button 
            onClick={() => handleScan('invalid', 'FAKE-QR-999', 'Unknown Visitor')}
            className="px-3 py-1.5 bg-red-950 border border-red-600 text-red-400 text-xs font-bold hover:bg-red-600 hover:text-white transition-colors"
          >
            SIMULATE INVALID
          </button>
        </div>
      </div>

      {/* MANUAL CODE ENTRY FORM */}
      <form onSubmit={handleManualSearch} className="flex gap-2">
        <div className="flex-1 relative">
          <Search size={14} className="text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Manual Guest Name or Pass Code (e.g. H9-VIP-001)..."
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#D8163F]"
          />
        </div>
        <button 
          type="submit"
          className="px-4 py-2 bg-[#D8163F] text-white text-xs font-bold hover:bg-red-600 transition-colors"
        >
          LOOKUP PASS
        </button>
      </form>

      {/* LIVE ADMITTED DOOR LOG */}
      <div className="border border-zinc-900 bg-zinc-950 p-4 space-y-3">
        <h3 className="text-xs text-zinc-500 uppercase tracking-widest border-b border-zinc-900 pb-2 flex items-center justify-between">
          <span>DOOR ADMISSIONS QUEUE (LOCAL STORE)</span>
          <span className="text-emerald-400 font-bold">{admittedGuests.length} CHECKED IN</span>
        </h3>
        {admittedGuests.length === 0 ? (
          <div className="text-center py-4 text-xs text-zinc-600">No guests admitted yet.</div>
        ) : (
          <div className="divide-y divide-zinc-900 text-xs">
            {admittedGuests.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 text-[11px] font-mono">{item.time}</span>
                  <span className="text-white font-bold">{item.name}</span>
                  <span className="text-zinc-500 text-[10px] font-mono">{item.code}</span>
                  <span className="text-zinc-600 text-[10px] hidden sm:inline">{item.type}</span>
                </div>
                <span className={`text-[11px] font-bold ${
                  item.status === 'ADMITTED' 
                    ? 'text-emerald-400' 
                    : item.status === 'DUPLICATE' 
                    ? 'text-yellow-400' 
                    : 'text-red-400'
                }`}>
                  {item.status === 'ADMITTED' ? '✓ ADMITTED' : item.status === 'DUPLICATE' ? '⚠️ DUPLICATE' : '✕ REJECTED'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
