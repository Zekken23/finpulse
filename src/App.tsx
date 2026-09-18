import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import { ToastProvider } from './context/ToastContext';
import { Header } from './components/Header';
import { OverviewCards } from './components/OverviewCards';
import { FinancialHealthGauge } from './components/FinancialHealthGauge';
import { WeeklyMonthlyChart } from './components/Charts/WeeklyMonthlyChart';
import { CategoryBreakdownChart } from './components/Charts/CategoryBreakdownChart';
import { SavingsGoalSection } from './components/Savings/SavingsGoalSection';
import { TransactionListSection } from './components/Transactions/TransactionListSection';
import { TransactionModal } from './components/Transactions/TransactionModal';
import { AddSavingsModal } from './components/Savings/AddSavingsModal';
import { DepositModal } from './components/Savings/DepositModal';
import { AuthModal } from './components/Auth/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import type { SavingsGoal } from './types/finance';
import { Wallet } from 'lucide-react';

const MainContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddSavingsModalOpen, setIsAddSavingsModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);

  return (
    <div className="min-h-screen flex flex-col justify-between pb-20 sm:pb-0">
      {!isAuthenticated && <AuthModal />}

      <div>
        {/* Navigation Header */}
        <Header
          onOpenAddModal={() => setIsAddTxModalOpen(true)}
          onOpenSavingsModal={() => setIsAddSavingsModalOpen(true)}
        />

        {/* Main Dashboard Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          
          {/* Top Stat Cards */}
          <div id="dashboard-overview">
            <OverviewCards />
          </div>

          {/* Financial Health Meter & AI Recommendation */}
          <FinancialHealthGauge />

          {/* Savings Goals / Target Tabungan Section */}
          <SavingsGoalSection
            onOpenAddSavingsModal={() => setIsAddSavingsModalOpen(true)}
            onOpenDepositModal={(goal) => setSelectedGoalForDeposit(goal)}
          />

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <WeeklyMonthlyChart />
            </div>
            <div className="lg:col-span-5">
              <CategoryBreakdownChart />
            </div>
          </div>

          {/* Daily & Periodical Transactions Table */}
          <div id="transaction-history">
            <TransactionListSection
              onOpenAddModal={() => setIsAddTxModalOpen(true)}
            />
          </div>

        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenAddTx={() => setIsAddTxModalOpen(true)}
        onOpenAddSavings={() => setIsAddSavingsModalOpen(true)}
      />

      {/* Modals */}
      <TransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
      />

      <AddSavingsModal
        isOpen={isAddSavingsModalOpen}
        onClose={() => setIsAddSavingsModalOpen(false)}
      />

      <DepositModal
        goal={selectedGoalForDeposit}
        onClose={() => setSelectedGoalForDeposit(null)}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 glass-panel text-center text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">FinPulse</span>
            <span>— Pengatur Keuangan & Target Tabungan Interaktif</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-semibold flex items-center gap-1 text-[11px]">
              ✨ This apps made by yusron
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FinanceProvider>
          <MainContent />
        </FinanceProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
