'use client';

import React from 'react';
import { Download, DollarSign } from 'lucide-react';
import { useStudioStore, StudioGig } from '@/store/studioStore';

interface FinanceLedgerViewProps {
  gigs: StudioGig[];
  selectedGig: StudioGig | null;
  onNavigate?: (view: string) => void;
}

export default function FinanceLedgerView({ gigs, selectedGig }: FinanceLedgerViewProps) {
  const downloadInvoice = useStudioStore((s) => s.downloadInvoice);
  const taxRate = useStudioStore((s) => s.settings.taxReserve);

  const totalFees = gigs.reduce((acc, g) => acc + g.fee, 0);
  const totalTaxReserve = Math.round(totalFees * (taxRate / 100));
  const depositsCollected = gigs
    .filter((g) => g.depositPaid)
    .reduce((acc, g) => acc + Math.round(g.fee / 2), 0);

  return (
    <div className="space-y-6">
      {/* Top Finance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-5 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] uppercase font-mono block">Total Confirmed Fees</span>
          <div className="text-2xl font-bold font-mono text-white">£{totalFees}</div>
          <span className="text-zinc-500 text-[11px]">Season 2026 Residency</span>
        </div>

        <div className="p-5 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] uppercase font-mono block">{taxRate}% HMRC Tax Reserve</span>
          <div className="text-2xl font-bold font-mono text-amber-400">£{totalTaxReserve}</div>
          <span className="text-emerald-400 text-[11px]">Auto-allocated to Savings</span>
        </div>

        <div className="p-5 rounded-xl bg-[#14151a] border border-white/[0.08] space-y-1.5 shadow-sm">
          <span className="text-zinc-400 text-[10px] uppercase font-mono block">Deposits Collected</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">£{depositsCollected}</div>
          <span className="text-zinc-500 text-[11px]">Bank Transfer Received</span>
        </div>
      </div>

      {/* Invoice Generator Card */}
      {selectedGig ? (
        <div className="rounded-xl border border-white/[0.08] bg-[#14151a] p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="font-semibold text-lg text-white tracking-tight">
                1-Click HMRC UK DJ Invoice Dispatcher
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pre-populated UK HMRC-compliant invoice generator for {selectedGig.venue}
              </p>
            </div>

            <button
              onClick={() => downloadInvoice(selectedGig.id)}
              className="px-4 py-2 rounded-lg bg-[#E53558] hover:bg-[#f43f5e] text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download size={13} />
              <span>Download HMRC Invoice (.txt)</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-[#0c0d10] border border-white/[0.06] text-xs font-mono space-y-2">
            <div className="text-zinc-400">
              INVOICE TO:{' '}
              <strong className="text-white font-sans">
                {selectedGig.promoter} // {selectedGig.venue}
              </strong>
            </div>
            <div className="text-zinc-400">
              PERFORMANCE FEE: <strong className="text-white">£{selectedGig.fee}.00</strong>
            </div>
            <div className="text-zinc-400">
              ADVANCE DEPOSIT:{' '}
              <strong className="text-emerald-400">
                {selectedGig.depositPaid
                  ? `-£${Math.round(selectedGig.fee / 2)}.00 (PAID)`
                  : '£0.00 (PENDING)'}
              </strong>
            </div>
            <div className="text-zinc-400">
              BALANCE DUE:{' '}
              <strong className="text-white font-bold">
                £{selectedGig.depositPaid ? Math.round(selectedGig.fee / 2) : selectedGig.fee}.00
              </strong>
            </div>
            <div className="text-zinc-500 pt-2 border-t border-white/[0.06] text-[11px]">
              UK Bank Sort Code: 04-00-04 • Account: 18080000 • Monzo Business UK • Terms: Net 14 Days
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-[#14151a] border border-white/[0.08] text-center space-y-2 shadow-sm">
          <div className="text-zinc-300 text-xs font-medium">No Confirmed Gigs for Invoicing</div>
          <p className="text-xs text-zinc-500">Add a booking above to generate automatic UK HMRC invoices.</p>
        </div>
      )}
    </div>
  );
}
