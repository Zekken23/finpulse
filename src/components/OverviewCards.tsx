import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { formatIDR } from '../utils/formatters';

export const OverviewCards: React.FC = () => {
  const { stats, timeFilter } = useFinance();

  const getPeriodLabel = () => {
    switch (timeFilter) {
      case 'today': return 'Hari Ini';
      case 'this_week': return 'Minggu Ini';
      case 'this_month': return 'Bulan Ini';
      case 'all': return 'Keseluruhan';
    }
  };

  const periodLabel = getPeriodLabel();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Total Saldo Bersih */}
      <div className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Saldo Bersih
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-space">
          {formatIDR(stats.totalBalance)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
          <span>Rasio Tabungan:</span>
          <span className="font-bold text-purple-300 flex items-center gap-1">
            <Percent className="w-3 h-3 text-purple-400" /> {stats.savingsRate}%
          </span>
        </div>
      </div>

      {/* Pemasukan Periode Ini */}
      <div className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pemasukan ({periodLabel})
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-space">
          {formatIDR(stats.periodIncome)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
          <span>Arus Masuk:</span>
          <span className="font-semibold text-emerald-300 flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Positif
          </span>
        </div>
      </div>

      {/* Pengeluaran Periode Ini */}
      <div className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Pengeluaran ({periodLabel})
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 tracking-tight font-space">
          {formatIDR(stats.periodExpense)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
          <span>Rata-Rata / Hari:</span>
          <span className="font-semibold text-rose-300 flex items-center gap-0.5">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" /> {formatIDR(stats.dailyAverageExpense)}
          </span>
        </div>
      </div>

      {/* Total Uang Tersimpan di Target */}
      <div className="glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Target Simpanan
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 tracking-tight font-space">
          {formatIDR(stats.periodSavingsDeposit)}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/5 pt-3">
          <span>Sisa Arus Kas:</span>
          <span className={`font-semibold ${stats.netCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatIDR(stats.netCashflow)}
          </span>
        </div>
      </div>

    </div>
  );
};
