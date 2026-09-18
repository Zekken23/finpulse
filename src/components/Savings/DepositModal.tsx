import React, { useState } from 'react';
import { X, PiggyBank, Sparkles } from 'lucide-react';
import type { SavingsGoal } from '../../types/finance';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR } from '../../utils/formatters';

interface DepositModalProps {
  goal: SavingsGoal | null;
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ goal, onClose }) => {
  const { depositToSavingsGoal } = useFinance();
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  if (!goal) return null;

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    depositToSavingsGoal(goal.id, numAmount, notes);
    onClose();
  };

  const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-md rounded-2xl border border-cyan-500/30 p-6 relative shadow-neon-cyan overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Setor Tabungan</h3>
              <p className="text-xs text-cyan-300 font-medium">{goal.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status */}
        <div className="bg-slate-900/80 rounded-xl p-3 mb-4 text-xs flex justify-between items-center border border-white/5">
          <div>
            <span className="text-slate-400">Tersimpan:</span>
            <span className="font-bold text-white ml-1">{formatIDR(goal.currentAmount)}</span>
          </div>
          <div>
            <span className="text-slate-400">Kurang:</span>
            <span className="font-bold text-cyan-300 ml-1">{formatIDR(remainingNeeded)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nominal Setoran (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-cyan-400">
                Rp
              </span>
              <input
                type="number"
                required
                min="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-base font-bold text-white"
              />
            </div>
          </div>

          {/* Quick Amount Pills */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Pilihan Cepat Setor:
            </span>
            <div className="flex flex-wrap gap-2">
              {[50000, 100000, 250000, 500000, 1000000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/5 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all"
                >
                  +{formatIDR(val).replace('Rp', '')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Setoran (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sisa fee freelance / hemat jajan"
              className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-neon-cyan active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Konfirmasi Setoran</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
