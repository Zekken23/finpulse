import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { calculateCategoryBreakdown, formatIDR, filterTransactionsByPeriod } from '../../utils/formatters';

export const CategoryBreakdownChart: React.FC = () => {
  const { transactions, timeFilter } = useFinance();
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');

  const periodTx = filterTransactionsByPeriod(transactions, timeFilter);
  const categoryData = calculateCategoryBreakdown(periodTx, activeType);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-2.5 rounded-xl border border-white/20 text-xs shadow-neon-purple">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-white">{data.category}</span>
          </div>
          <p className="text-slate-300 font-semibold">{formatIDR(data.total)} ({data.percentage}%)</p>
          <p className="text-slate-400 text-[10px]">{data.count} Transaksi</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-cyan-400" />
            <span>Breakdown Kategori</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Sebaran dana berdasarkan kategori {activeType === 'expense' ? 'pengeluaran' : 'pemasukan'}.
          </p>
        </div>

        {/* Expense vs Income Toggle */}
        <div className="flex p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveType('expense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeType === 'expense'
                ? 'bg-rose-600 text-white shadow-neon-rose'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Pengeluaran</span>
          </button>
          <button
            onClick={() => setActiveType('income')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeType === 'income'
                ? 'bg-emerald-600 text-white shadow-neon-emerald'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Pemasukan</span>
          </button>
        </div>
      </div>

      {categoryData.length === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-xl">
          <PieIcon className="w-10 h-10 text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-400">Belum Ada Transaksi {activeType === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</p>
          <p className="text-xs text-slate-500 mt-1">Catat transaksi baru untuk melihat analisis grafik kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Donut Chart */}
          <div className="md:col-span-5 h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="total"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(15, 23, 42, 0.8)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner text overlay */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
              <span className="text-xs font-extrabold text-white">
                {categoryData.length} Kat.
              </span>
            </div>
          </div>

          {/* Category Progress List */}
          <div className="md:col-span-7 space-y-3 max-h-56 overflow-y-auto pr-2">
            {categoryData.map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-md" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-slate-200">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-medium">{item.percentage}%</span>
                    <span className="font-bold text-white">{formatIDR(item.total)}</span>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                      boxShadow: `0 0 10px ${item.color}80`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};
