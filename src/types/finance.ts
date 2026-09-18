export type TransactionType = 'expense' | 'income';

export type ExpenseCategory = 
  | 'Makanan & Minuman'
  | 'Transportasi'
  | 'Belanja'
  | 'Tagihan & Utilitas'
  | 'Hiburan & Hobi'
  | 'Kesehatan'
  | 'Pendidikan'
  | 'Lainnya';

export type IncomeCategory = 
  | 'Gaji Utama'
  | 'Freelance'
  | 'Investasi'
  | 'Bonus'
  | 'Hasil Usaha'
  | 'Lainnya';

export type TransactionCategory = ExpenseCategory | IncomeCategory;

export interface Transaction {
  id: string;
  userId?: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  linkedSavingsGoalId?: string;
}

export interface SavingsGoal {
  id: string;
  userId?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  iconName: string;
  colorTheme: 'purple' | 'cyan' | 'emerald' | 'amber' | 'rose';
  notes?: string;
  isCompleted?: boolean;
}

export type TimeFilterOption = 'today' | 'this_week' | 'this_month' | 'all';

export interface FinancialStats {
  totalBalance: number;
  periodIncome: number;
  periodExpense: number;
  periodSavingsDeposit: number;
  netCashflow: number;
  savingsRate: number; // percentage
  dailyAverageExpense: number;
  healthScore: number; // 0 - 100
  healthStatus: 'Excelent' | 'Healthy' | 'Caution' | 'Warning';
  healthRecommendation: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  color: string;
  count: number;
}
