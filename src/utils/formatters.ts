import confetti from 'canvas-confetti';
import type { Transaction, TimeFilterOption, FinancialStats, CategorySummary, SavingsGoal } from '../types/finance';

// Format IDR Currency (e.g. 27000 -> "Rp 27.000")
export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format raw input string/number to dot-separated string (e.g. "27000" -> "27.000")
export const formatNumberWithDots = (val: string | number): string => {
  if (val === undefined || val === null || val === '') return '';
  const cleanNum = val.toString().replace(/\D/g, ''); // keep numbers only
  if (!cleanNum) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(cleanNum, 10));
};

// Parse dot-separated string back to numeric number (e.g. "27.000" -> 27000)
export const parseDotsToNumber = (val: string): number => {
  if (!val) return 0;
  const cleanNum = val.toString().replace(/\D/g, '');
  return cleanNum ? parseInt(cleanNum, 10) : 0;
};

// Format Date string to readable Indonesian date
export const formatDateID = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const getDayNameID = (dateStr: string): string => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date);
};

// Check if a date string falls within today, this week, or this month
export const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export const isSameWeek = (d1: Date, d2: Date) => {
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const endOfWeek = (date: Date) => {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const start = startOfWeek(d2);
  const end = endOfWeek(d2);
  return d1 >= start && d1 <= end;
};

export const isSameMonth = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth();
};

// Filter Transactions by Time Period Option
export const filterTransactionsByPeriod = (
  transactions: Transaction[], 
  period: TimeFilterOption
): Transaction[] => {
  const now = new Date();

  return transactions.filter(tx => {
    const txDate = new Date(tx.date);
    if (isNaN(txDate.getTime())) return true;

    switch (period) {
      case 'today':
        return isSameDay(txDate, now);
      case 'this_week':
        return isSameWeek(txDate, now);
      case 'this_month':
        return isSameMonth(txDate, now);
      case 'all':
      default:
        return true;
    }
  });
};

// Calculate Overall & Period Financial Statistics
export const calculateFinancialStats = (
  transactions: Transaction[],
  savingsGoals: SavingsGoal[],
  period: TimeFilterOption
): FinancialStats => {
  const allIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const allExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavedInGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalBalance = allIncome - allExpense;

  const periodTx = filterTransactionsByPeriod(transactions, period);
  const periodIncome = periodTx
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpense = periodTx
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = periodIncome - periodExpense;

  const savingsRate = periodIncome > 0 
    ? Math.max(0, Math.min(100, Math.round(((periodIncome - periodExpense) / periodIncome) * 100)))
    : 0;

  let daysInPeriod = 30;
  if (period === 'today') daysInPeriod = 1;
  else if (period === 'this_week') daysInPeriod = 7;
  else if (period === 'this_month') daysInPeriod = 30;
  else daysInPeriod = Math.max(1, transactions.length ? 30 : 1);

  const dailyAverageExpense = Math.round(periodExpense / daysInPeriod);

  let healthScore = 75;
  let healthStatus: FinancialStats['healthStatus'] = 'Healthy';
  let healthRecommendation = 'Keuangan Anda dalam kondisi cukup stabil.';

  if (periodIncome === 0 && periodExpense > 0) {
    healthScore = 35;
    healthStatus = 'Warning';
    healthRecommendation = 'Belum ada pemasukan yang tercatat di periode ini. Hemat pengeluaran harian Anda!';
  } else if (savingsRate >= 40) {
    healthScore = 95;
    healthStatus = 'Excelent';
    healthRecommendation = 'Luar biasa! Rasio tabungan Anda sangat tinggi (>40%). Pertahankan konsistensi ini!';
  } else if (savingsRate >= 20) {
    healthScore = 82;
    healthStatus = 'Healthy';
    healthRecommendation = 'Kondisi keuangan sehat. Tabungan di atas 20% dari pemasukan.';
  } else if (savingsRate >= 5) {
    healthScore = 60;
    healthStatus = 'Caution';
    healthRecommendation = 'Pengeluaran mendekati pemasukan. Coba kurangi pengeluaran kategori non-esensial.';
  } else {
    healthScore = 40;
    healthStatus = 'Warning';
    healthRecommendation = 'Pengeluaran melebihi / mendekati pemasukan! Segera evaluasi pengeluaran mingguan Anda.';
  }

  return {
    totalBalance,
    periodIncome,
    periodExpense,
    periodSavingsDeposit: totalSavedInGoals,
    netCashflow,
    savingsRate,
    dailyAverageExpense,
    healthScore,
    healthStatus,
    healthRecommendation
  };
};

// Calculate Category Summaries
export const calculateCategoryBreakdown = (
  transactions: Transaction[],
  type: 'expense' | 'income'
): CategorySummary[] => {
  const filtered = transactions.filter(t => t.type === type);
  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  if (totalAmount === 0) return [];

  const categoryMap: { [key: string]: { total: number; count: number } } = {};

  filtered.forEach(t => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { total: 0, count: 0 };
    }
    categoryMap[t.category].total += t.amount;
    categoryMap[t.category].count += 1;
  });

  const categoryColors: { [key: string]: string } = {
    'Makanan & Minuman': '#f43f5e',
    'Transportasi': '#06b6d4',
    'Belanja': '#8b5cf6',
    'Tagihan & Utilitas': '#f59e0b',
    'Hiburan & Hobi': '#ec4899',
    'Kesehatan': '#10b981',
    'Pendidikan': '#3b82f6',
    'Gaji Utama': '#10b981',
    'Freelance': '#8b5cf6',
    'Investasi': '#06b6d4',
    'Bonus': '#f59e0b',
    'Hasil Usaha': '#3b82f6',
    'Lainnya': '#94a3b8'
  };

  return Object.keys(categoryMap).map(cat => {
    const total = categoryMap[cat].total;
    const count = categoryMap[cat].count;
    const percentage = Math.round((total / totalAmount) * 100);
    return {
      category: cat,
      total,
      percentage,
      count,
      color: categoryColors[cat] || '#8b5cf6'
    };
  }).sort((a, b) => b.total - a.total);
};

// Fire Confetti Animation
export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    console.log('Confetti failed to trigger:', e);
  }
};
