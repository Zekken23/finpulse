import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight,
  Percent,
  AlertTriangle
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
    <div className="space-y-4 mb-8">
      {/* Low Balance Warning Alert Banner (<25%) */}
      {stats.isLowBalanceWarning && (
        <div className="glass-panel p-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 text-rose-200 shadow-neon-rose flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center flex-shrink-0 text-rose-400">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <span>Peringatan Saldo Kritis (&lt;25%)</span>
              </div>
              <p className="text-xs text-rose-200 font-semibold mt-0.5">
                {stats.lowBalanceMessage}
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-rose-300 font-bold uppercase block">Sisa Rasio Kas</span>
            <span className="text-lg font-black text-rose-400 font-space">{stats.lowBalancePercentage}%</span>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Saldo Bersih */}
        <div className={`glass-panel-interactive rounded-2xl p-5 relative overflow-hidden group border ${
          stats.isLowBalanceWarning ? 'border-rose-500/40 bg-rose-950/20' : 'border-white/10'
        }`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Saldo Bersih
            </span>
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              stats.isLowBalanceWarning 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' 
                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
            }`}>
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
    </div>
  );
};
