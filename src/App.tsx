import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
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
import type { SavingsGoal } from './types/finance';
import { Wallet } from 'lucide-react';

const MainContent: React.FC = () => {
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isAddSavingsModalOpen, setIsAddSavingsModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState<SavingsGoal | null>(null);

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {/* Navigation Header */}
        <Header
          onOpenAddModal={() => setIsAddTxModalOpen(true)}
          onOpenSavingsModal={() => setIsAddSavingsModalOpen(true)}
        />

        {/* Main Dashboard Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Top Stat Cards */}
          <OverviewCards />

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
          <TransactionListSection
            onOpenAddModal={() => setIsAddTxModalOpen(true)}
          />

        </main>
      </div>

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
          <div className="flex items-center gap-1 text-slate-500">
            <span>Didesain khusus untuk pencatatan harian, mingguan, & bulanan.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <MainContent />
    </FinanceProvider>
  );
}

export default App;
