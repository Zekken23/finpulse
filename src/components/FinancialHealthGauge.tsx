import React from 'react';
import { ShieldCheck, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const FinancialHealthGauge: React.FC = () => {
  const { stats } = useFinance();

  const getStatusBadge = () => {
    switch (stats.healthStatus) {
      case 'Excelent':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: 'Sangat Sehat'
        };
      case 'Healthy':
        return {
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />,
          label: 'Sehat & Stabil'
        };
      case 'Caution':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: 'Perlu Perhatian'
        };
      case 'Warning':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
          label: 'Waspada Keuangan'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="glass-panel rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Health Meter Score */}
        <div className="flex items-center gap-5 w-full md:w-auto">
          {/* Radial progress circle */}
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${stats.healthScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-white font-space">
                {stats.healthScore}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">
                / 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                Financial Health Index
              </span>
              <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
                {badge.icon}
                <span>{badge.label}</span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">
              Indikator Kesehatan Finansial Anda
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Dihitung berdasarkan rasio tabungan, alokasi cashflow, dan rata-rata pengeluaran harian.
            </p>
          </div>
        </div>

        {/* Right: AI Smart Financial Recommendation Box */}
        <div className="w-full md:w-auto flex-1 max-w-xl bg-purple-950/20 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-300 flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>Smart Financial Insight</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              "{stats.healthRecommendation}"
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
