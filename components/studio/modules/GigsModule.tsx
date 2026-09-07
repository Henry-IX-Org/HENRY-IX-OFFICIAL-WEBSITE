'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
  Calendar,
  FileText,
  CheckSquare,
  DollarSign,
  Smartphone,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';
import GigsHubView from './gigs/GigsHubView';
import DaySheetView from './gigs/DaySheetView';
import ChecklistView from './gigs/ChecklistView';
import FinanceLedgerView from './gigs/FinanceLedgerView';
import DoorScannerView from './gigs/DoorScannerView';

export interface GigsModuleProps {
  activeView?: string;
  onNavigate?: (view: string) => void;
}

export default function GigsModule({
  activeView = 'gigs-hub',
  onNavigate,
}: GigsModuleProps) {
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const setActiveGigId = useStudioStore((s) => s.setActiveGigId);
  const fetchRealGigs = useStudioStore((s) => s.fetchRealGigs);
  const isLoadingGigs = useStudioStore((s) => s.isLoadingGigs);
  const bagItems = useStudioStore((s) => s.bagItems);

  const [isAddingGig, setIsAddingGig] = useState(false);

  useEffect(() => {
    fetchRealGigs();
  }, [fetchRealGigs]);

  const selectedGig = gigs.find((g) => g.id === activeGigId) || gigs[0] || null;
  const uncheckedCount = bagItems.filter((i) => !i.checked).length;

  const currentMode = useMemo(() => {
    switch (activeView) {
      case 'gigs-daysheet':
        return 'daysheet';
      case 'gigs-checklist':
        return 'bag-checklist';
      case 'gigs-finance':
        return 'finance';
      case 'gigs-scanner':
        return 'scanner';
      case 'gigs-hub':
      default:
        return 'hub';
    }
  }, [activeView]);

  return (
    <div className="p-6 bg-transparent text-zinc-100 font-sans space-y-6 select-none">
      {/* Header & Sub-View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <h2 className="font-semibold text-2xl text-white tracking-tight flex items-center gap-2">
              <span>Gigs & Tour Logistics</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 font-normal font-mono border border-white/10">
                04
              </span>
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            London TfL routing • 1-page day sheets • Smart DJ bag • HMRC tax & invoicing
          </p>
        </div>

        {/* Sub-navigation Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1 bg-[#14151a] border border-white/[0.08] p-1 rounded-xl text-xs">
          <button
            onClick={() => (onNavigate ? onNavigate('gigs-hub') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'hub'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Calendar size={13} className={currentMode === 'hub' ? 'text-emerald-400' : ''} />
            <span>Master Hub</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('gigs-daysheet') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'daysheet'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <FileText size={13} className={currentMode === 'daysheet' ? 'text-[#3b82f6]' : ''} />
            <span>1-Page Day Sheet</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('gigs-checklist') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'bag-checklist'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <CheckSquare size={13} className={currentMode === 'bag-checklist' ? 'text-amber-400' : ''} />
            <span>Smart DJ Bag ({uncheckedCount})</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('gigs-finance') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'finance'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <DollarSign size={13} className={currentMode === 'finance' ? 'text-emerald-400' : ''} />
            <span>Finance & HMRC</span>
          </button>

          <button
            onClick={() => (onNavigate ? onNavigate('gigs-scanner') : null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              currentMode === 'scanner'
                ? 'bg-white/[0.1] text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Smartphone size={13} className={currentMode === 'scanner' ? 'text-[#8b5cf6]' : ''} />
            <span>Door QR Scanner</span>
          </button>

          <button
            onClick={() => fetchRealGigs()}
            disabled={isLoadingGigs}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Refresh from Notion"
          >
            <RefreshCw size={13} className={isLoadingGigs ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Call-Time Alert Banner */}
      {selectedGig && uncheckedCount > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-300 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
            <span>
              <strong>Logistics Warning:</strong> {selectedGig.venue} call-time approaching. {uncheckedCount} items
              remaining in Smart DJ Bag!
            </span>
          </div>
          <button
            onClick={() => (onNavigate ? onNavigate('gigs-checklist') : null)}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-medium text-xs hover:bg-amber-300 transition-colors shadow-sm"
          >
            Review Smart Bag
          </button>
        </div>
      )}

      {/* Dynamic Sub-View Dispatch */}
      {currentMode === 'hub' && (
        <GigsHubView
          gigs={gigs}
          selectedGig={selectedGig}
          activeGigId={activeGigId}
          setActiveGigId={setActiveGigId}
          isLoadingGigs={isLoadingGigs}
          fetchRealGigs={fetchRealGigs}
          isAddingGig={isAddingGig}
          setIsAddingGig={setIsAddingGig}
          onNavigate={onNavigate}
        />
      )}
      {currentMode === 'daysheet' && <DaySheetView selectedGig={selectedGig} onNavigate={onNavigate} />}
      {currentMode === 'bag-checklist' && <ChecklistView />}
      {currentMode === 'finance' && <FinanceLedgerView gigs={gigs} selectedGig={selectedGig} onNavigate={onNavigate} />}
      {currentMode === 'scanner' && <DoorScannerView onNavigate={onNavigate} />}
    </div>
  );
}
