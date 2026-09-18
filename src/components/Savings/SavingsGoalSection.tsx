import React from 'react';
import { 
  Target, 
  Plus, 
  PiggyBank, 
  Laptop, 
  ShieldCheck, 
  Palmtree, 
  Car, 
  Home, 
  Smartphone,
  Trash2,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import type { SavingsGoal } from '../../types/finance';
import { formatIDR, formatDateID } from '../../utils/formatters';

interface SavingsGoalSectionProps {
  onOpenAddSavingsModal: () => void;
  onOpenDepositModal: (goal: SavingsGoal) => void;
}

export const SavingsGoalSection: React.FC<SavingsGoalSectionProps> = ({
  onOpenAddSavingsModal,
  onOpenDepositModal
}) => {
  const { savingsGoals, deleteSavingsGoal } = useFinance();

  const getIcon = (name: string) => {
    switch (name) {
      case 'Laptop': return <Laptop className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      case 'Palmtree': return <Palmtree className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      case 'Home': return <Home className="w-5 h-5" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5" />;
      default: return <PiggyBank className="w-5 h-5" />;
    }
  };

  const getThemeClasses = (theme: SavingsGoal['colorTheme']) => {
    switch (theme) {
      case 'cyan':
        return {
          border: 'border-cyan-500/30 hover:border-cyan-500/60',
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          liquid: 'from-cyan-500 to-blue-600',
          button: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-neon-cyan',
          text: 'text-cyan-400'
        };
      case 'emerald':
        return {
          border: 'border-emerald-500/30 hover:border-emerald-500/60',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          liquid: 'from-emerald-500 to-teal-600',
          button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-neon-emerald',
          text: 'text-emerald-400'
        };
      case 'amber':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/60',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          liquid: 'from-amber-500 to-orange-600',
          button: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-neon-amber',
          text: 'text-amber-400'
        };
      case 'rose':
        return {
          border: 'border-rose-500/30 hover:border-rose-500/60',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          liquid: 'from-rose-500 to-pink-600',
          button: 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-neon-rose',
          text: 'text-rose-400'
        };
      case 'purple':
      default:
        return {
          border: 'border-purple-500/30 hover:border-purple-500/60',
          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          liquid: 'from-purple-600 to-indigo-600',
          button: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-neon-purple',
          text: 'text-purple-400'
        };
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Hapus target tabungan "${title}"?`)) {
      deleteSavingsGoal(id);
    }
  };

  return (
    <div className="mb-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-black text-white tracking-tight font-space">
              Target Tabungan <span className="text-gradient-purple">Simpanan Uang</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Toples tabungan digital interaktif. Setor uang dan lacak pencapaian impian keuangan Anda.
          </p>
        </div>

        <button
          onClick={onOpenAddSavingsModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 transition-all duration-200 shadow-neon-purple active:scale-95 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-purple-400" />
          <span>Buat Target Baru</span>
        </button>
      </div>

      {/* Cards Grid */}
      {savingsGoals.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center border border-dashed border-white/10">
          <PiggyBank className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Belum Ada Target Tabungan</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Mulai atur tujuan impian Anda seperti beli gadget, dana darurat, atau tiket liburan.
          </p>
          <button
            onClick={onOpenAddSavingsModal}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white shadow-neon-purple"
          >
            + Buat Target Tabungan
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savingsGoals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const theme = getThemeClasses(goal.colorTheme);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className={`glass-panel rounded-2xl p-5 relative overflow-hidden transition-all duration-300 border ${theme.border} group`}
              >
                {/* Background Water Level Liquid Fill */}
                <div
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${theme.liquid} opacity-15 transition-all duration-1000 ease-out`}
                  style={{ height: `${percentage}%` }}
                />

                {/* Top Card Controls */}
                <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${theme.badge}`}>
                      {getIcon(goal.iconName)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight line-clamp-1">
                        {goal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" /> {formatDateID(goal.targetDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(goal.id, goal.title)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Hapus Target Tabungan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Details */}
                <div className="relative z-10 space-y-3 mb-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tersimpan</span>
                      <div className={`text-xl font-extrabold ${theme.text} font-space`}>
                        {formatIDR(goal.currentAmount)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target</span>
                      <div className="text-sm font-bold text-slate-300 font-space">
                        {formatIDR(goal.targetAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Gauge */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-400 flex items-center gap-1">
                        {isCompleted ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Target Tercapai!
                          </span>
                        ) : (
                          <span>Sisa {formatIDR(remaining)}</span>
                        )}
                      </span>
                      <span className={`font-bold ${theme.text}`}>{percentage}%</span>
                    </div>

                    <div className="w-full h-3 rounded-full bg-slate-900/90 border border-white/10 p-0.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${theme.liquid} transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer Deposit Action Button */}
                <div className="relative z-10 pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                  {goal.notes && (
                    <span className="text-[11px] text-slate-400 truncate max-w-[150px]" title={goal.notes}>
                      {goal.notes}
                    </span>
                  )}
                  <button
                    onClick={() => onOpenDepositModal(goal)}
                    className={`ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${theme.button}`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Setor Tabungan</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
