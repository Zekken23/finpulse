import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend 
} from 'recharts';
import { BarChart3, LineChart } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, getDayNameID } from '../../utils/formatters';

interface ChartDataPoint {
  label: string;
  income: number;
  expense: number;
}

export const WeeklyMonthlyChart: React.FC = () => {
  const { transactions } = useFinance();
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');

  // Generate data for 7 recent days
  const getDailyData = (): ChartDataPoint[] => {
    const days: { [key: string]: ChartDataPoint } = {};
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = `${getDayNameID(dateStr)} (${d.getDate()}/${d.getMonth()+1})`;
      days[dateStr] = { label, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      if (days[t.date]) {
        if (t.type === 'income') {
          days[t.date].income += t.amount;
        } else {
          days[t.date].expense += t.amount;
        }
      }
    });

    return Object.values(days);
  };

  // Generate data for 6 recent months
  const getMonthlyData = (): ChartDataPoint[] => {
    const monthsMap: { [key: string]: ChartDataPoint } = {};
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit' }).format(d);
      monthsMap[monthKey] = { label, income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
      if (monthsMap[monthKey]) {
        if (t.type === 'income') {
          monthsMap[monthKey].income += t.amount;
        } else {
          monthsMap[monthKey].expense += t.amount;
        }
      }
    });

    return Object.values(monthsMap);
  };

  const chartData = viewMode === 'daily' ? getDailyData() : getMonthlyData();

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-xl border border-white/20 shadow-neon-purple text-xs">
          <p className="font-bold text-white mb-2 pb-1 border-b border-white/10">{label}</p>
          <div className="space-y-1">
            <p className="text-emerald-400 font-semibold flex justify-between gap-4">
              <span>Pemasukan:</span>
              <span>{formatIDR(payload[0]?.value || 0)}</span>
            </p>
            <p className="text-rose-400 font-semibold flex justify-between gap-4">
              <span>Pengeluaran:</span>
              <span>{formatIDR(payload[1]?.value || 0)}</span>
            </p>
            <p className="text-purple-300 font-bold border-t border-white/10 pt-1 flex justify-between gap-4">
              <span>Selisih:</span>
              <span>{formatIDR((payload[0]?.value || 0) - (payload[1]?.value || 0))}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span>Grafik Pemasukan vs Pengeluaran</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analisis tren perbandingan uang masuk dan uang keluar secara visual.
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          {/* Daily vs Monthly */}
          <div className="flex p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'daily' ? 'bg-purple-600 text-white shadow-neon-purple' : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                viewMode === 'monthly' ? 'bg-purple-600 text-white shadow-neon-purple' : 'text-slate-400 hover:text-white'
              }`}
            >
              6 Bulan Terakhir
            </button>
          </div>

          {/* Area vs Bar */}
          <div className="flex p-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs">
            <button
              onClick={() => setChartType('area')}
              title="Grafik Gelombang Area"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'area' ? 'bg-purple-600 text-white shadow-neon-purple' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              title="Grafik Batang"
              className={`p-1.5 rounded-lg transition-all ${
                chartType === 'bar' ? 'bg-purple-600 text-white shadow-neon-purple' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs font-semibold text-slate-300">{value === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>} />
              <Area type="monotone" dataKey="income" name="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#incomeGrad)" />
              <Area type="monotone" dataKey="expense" name="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#expenseGrad)" />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs font-semibold text-slate-300">{value === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>} />
              <Bar dataKey="income" name="income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
