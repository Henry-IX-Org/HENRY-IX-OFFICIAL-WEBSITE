'use client';

import React, { useState } from 'react';
import { DollarSign, Download, Trash2 } from 'lucide-react';
import { useStudioStore } from '@/store/studioStore';

export default function FinanceTab() {
  const gigs = useStudioStore((s) => s.gigs);
  const activeGigId = useStudioStore((s) => s.activeGigId);
  const downloadInvoice = useStudioStore((s) => s.downloadInvoice);
  const taxRate = useStudioStore((s) => s.settings.taxReserve);
  const addToast = useStudioStore((s) => s.addToast);

  const [customTaxRate, setCustomTaxRate] = useState(taxRate || 20);
  const [loggedExpenses, setLoggedExpenses] = useState<Array<{ id: string; desc: string; amount: number; category: 'Travel' | 'Digging' | 'Gear' | 'Production' }>>([
    { id: 'exp-1', desc: 'TfL Night Tube Return + Zone 1-2', amount: 9.80, category: 'Travel' },
    { id: 'exp-2', desc: 'Bandcamp Wav Downloads (3 Track Dubs)', amount: 14.50, category: 'Digging' },
    { id: 'exp-3', desc: '1/4" Gold Jack Replacement Adapter', amount: 6.99, category: 'Gear' },
  ]);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'Travel' | 'Digging' | 'Gear' | 'Production'>('Travel');
  const [expenseDesc, setExpenseDesc] = useState('');

  const activeGig = gigs.find((g) => g.id === activeGigId) || gigs[0];

  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(expenseAmount);
    if (isNaN(val) || val <= 0 || !expenseDesc.trim()) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      desc: expenseDesc.trim(),
      amount: val,
      category: expenseCategory,
    };
    setLoggedExpenses((prev) => [newExp, ...prev]);
    setExpenseAmount('');
    setExpenseDesc('');
    addToast({
      title: 'EXPENSE LOGGED',
      message: `Logged £${val.toFixed(2)} to HMRC deductions ledger.`,
      type: 'success',
    });
  };

  if (!activeGig || gigs.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] text-center space-y-3 font-sans text-xs">
        <div className="text-zinc-400 font-semibold uppercase tracking-wider font-mono text-[11px]">
          No Gigs for Financial Breakdown
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          No active bookings found in Notion. Once a gig is logged, the HMRC DJ Invoice calculator will automatically calculate gross fees, deposit status, and {customTaxRate}% tax reserve.
        </p>
      </div>
    );
  }

  const grossFee = activeGig.fee;
  const taxDeduction = (grossFee * (customTaxRate / 100)).toFixed(2);
  const netRemittance = (grossFee * (1 - customTaxRate / 100)).toFixed(2);
  const totalLoggedExpenses = loggedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netAfterExpenses = (parseFloat(netRemittance) - totalLoggedExpenses).toFixed(2);

  return (
    <div className="space-y-4 text-xs font-sans">
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-400" />
            <h4 className="text-zinc-400 uppercase tracking-wider text-[11px] font-mono">
              HMRC DJ Invoice Calculator
            </h4>
          </div>
          <span className="text-emerald-400 font-mono text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {activeGig.venue.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 font-mono text-[11px]">
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">Gross Fee</div>
            <div className="text-zinc-100 font-bold text-sm mt-0.5">£{grossFee.toFixed(2)}</div>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">Deposit Status</div>
            <div className={`font-bold text-sm mt-0.5 ${activeGig.depositPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
              {activeGig.depositPaid ? 'PAID' : 'DUE ARRIVAL'}
            </div>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">{customTaxRate}% Tax Reserve</div>
            <div className="text-amber-400 font-bold text-sm mt-0.5">£{taxDeduction}</div>
          </div>
          <div className="p-2.5 bg-black/40 border border-white/[0.06] rounded-lg">
            <div className="text-zinc-500 text-[9px] uppercase">Net Remittance</div>
            <div className="text-emerald-400 font-bold text-sm mt-0.5">£{netRemittance}</div>
          </div>
        </div>

        {/* Tax Reserve Slider */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
          <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
            <span>HMRC TAX RESERVE:</span>
            <span className="text-zinc-200 font-bold">{customTaxRate}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={40}
            value={customTaxRate}
            onChange={(e) => setCustomTaxRate(parseInt(e.target.value))}
            className="w-full accent-[#E53558]"
          />
        </div>

        <button
          onClick={() => downloadInvoice(activeGig.id)}
          className="w-full py-2.5 rounded-xl bg-[#E53558] text-white font-semibold text-xs uppercase hover:bg-[#c92646] transition-colors flex items-center justify-center gap-1.5"
        >
          <Download size={13} />
          <span>Generate & Download Invoice (.txt)</span>
        </button>
      </div>

      {/* Quick Expense Logger */}
      <form onSubmit={handleLogExpense} className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-2.5">
        <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium block">
          Log Tour Expense to HMRC Ledger:
        </span>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            value={expenseAmount}
            onChange={(e) => setExpenseAmount(e.target.value)}
            placeholder="£ Amount"
            className="w-28 bg-[#14151a] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#E53558]/50"
          />
          <select
            value={expenseCategory}
            onChange={(e) => setExpenseCategory(e.target.value as any)}
            className="flex-1 bg-[#14151a] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-200 focus:outline-none focus:border-[#E53558]/50"
          >
            <option value="Travel">Travel / TfL</option>
            <option value="Digging">Digging / Music</option>
            <option value="Gear">Hardware / Audio</option>
            <option value="Production">Production</option>
          </select>
        </div>
        <input
          type="text"
          value={expenseDesc}
          onChange={(e) => setExpenseDesc(e.target.value)}
          placeholder="Expense description..."
          className="w-full bg-[#14151a] border border-white/[0.08] rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-[#E53558]/50"
        />
        <button
          type="submit"
          className="w-full py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/20 text-zinc-200 hover:text-white text-xs font-semibold transition-colors"
        >
          + Log Expense to Ledger
        </button>
      </form>

      {/* Logged Expenses Ledger */}
      <div className="p-4 rounded-xl border border-white/[0.08] bg-[#1b1c22] space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 uppercase font-mono font-medium">
            HMRC Deductions ({loggedExpenses.length}):
          </span>
          <span className="text-amber-400 font-mono text-[10px] font-bold">
            TOTAL £{totalLoggedExpenses.toFixed(2)}
          </span>
        </div>

        <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
          {loggedExpenses.length === 0 ? (
            <div className="text-zinc-600 text-[10px] italic py-2 text-center font-mono">No expenses logged yet.</div>
          ) : (
            loggedExpenses.map((exp) => (
              <div key={exp.id} className="p-2.5 rounded-lg bg-black/40 border border-white/[0.04] flex items-center justify-between text-[11px]">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase rounded font-mono ${
                      exp.category === 'Travel' ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40' :
                      exp.category === 'Digging' ? 'bg-purple-950/60 text-purple-400 border border-purple-800/40' :
                      exp.category === 'Gear' ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40' :
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {exp.category}
                    </span>
                    <span className="font-mono text-amber-300 font-bold">£{exp.amount.toFixed(2)}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px] truncate mt-0.5">{exp.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setLoggedExpenses((prev) => prev.filter((e) => e.id !== exp.id));
                    addToast({ title: 'EXPENSE REMOVED', message: `Removed £${exp.amount.toFixed(2)} from ledger.`, type: 'info' });
                  }}
                  className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                  title="Delete expense"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-500">NET AFTER EXPENSES:</span>
          <span className="text-emerald-400 font-bold">£{netAfterExpenses}</span>
        </div>
      </div>
    </div>
  );
}
