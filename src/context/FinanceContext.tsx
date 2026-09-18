import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, SavingsGoal, TimeFilterOption, FinancialStats } from '../types/finance';
import { calculateFinancialStats, triggerConfetti } from '../utils/formatters';
import { useAuth } from './AuthContext';

const API_BASE_URL = '/api';

interface FinanceContextType {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  timeFilter: TimeFilterOption;
  searchQuery: string;
  selectedCategory: string;
  stats: FinancialStats;
  isBackendConnected: boolean;
  setTimeFilter: (filter: TimeFilterOption) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount' | 'isCompleted'>) => void;
  depositToSavingsGoal: (goalId: string, amount: number, notes?: string) => void;
  deleteSavingsGoal: (goalId: string) => void;
  resetToDefaultData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('this_month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Keys for user specific LocalStorage
  const txKey = user ? `finpulse_tx_${user.id}` : 'finpulse_tx_guest';
  const goalsKey = user ? `finpulse_goals_${user.id}` : 'finpulse_goals_guest';

  // Load user data on change of active user
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setSavingsGoals([]);
      return;
    }

    const fetchUserData = async () => {
      // 1. Try Backend API first if user exists
      try {
        const [txRes, goalsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/transactions?userId=${user.id}`),
          fetch(`${API_BASE_URL}/savings-goals?userId=${user.id}`)
        ]);

        if (txRes.ok && goalsRes.ok) {
          const txData = await txRes.json();
          const goalsData = await goalsRes.json();
          setTransactions(txData);
          setSavingsGoals(goalsData);
          setIsBackendConnected(true);
          return;
        }
      } catch (error) {
        setIsBackendConnected(false);
      }

      // 2. Fallback to LocalStorage for this specific userId
      const savedTx = localStorage.getItem(txKey);
      const savedGoals = localStorage.getItem(goalsKey);

      setTransactions(savedTx ? JSON.parse(savedTx) : []);
      setSavingsGoals(savedGoals ? JSON.parse(savedGoals) : []);
    };

    fetchUserData();
  }, [user, txKey, goalsKey]);

  // Sync to LocalStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(txKey, JSON.stringify(transactions));
    }
  }, [transactions, user, txKey]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(goalsKey, JSON.stringify(savingsGoals));
    }
  }, [savingsGoals, user, goalsKey]);

  // Derived Financial Stats
  const stats = calculateFinancialStats(transactions, savingsGoals, timeFilter);

  // Transaction Handlers
  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const tempId = `tx-${Date.now()}`;
    const newTx: Transaction = {
      ...txData,
      id: tempId,
      userId: user.id
    };

    // Optimistic UI update
    setTransactions(prev => [newTx, ...prev]);

    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...txData, userId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(prev => prev.map(t => t.id === tempId ? data : t));
      }
    } catch (e) {
      console.error('Failed to sync transaction to backend DB:', e);
    }
  };

  const updateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));

    try {
      await fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete transaction from backend DB:', e);
    }
  };

  // Savings Goal Handlers
  const addSavingsGoal = async (goalData: Omit<SavingsGoal, 'id' | 'currentAmount' | 'isCompleted'>) => {
    if (!user) return;

    const tempId = `goal-${Date.now()}`;
    const newGoal: SavingsGoal = {
      ...goalData,
      id: tempId,
      userId: user.id,
      currentAmount: 0,
      isCompleted: false
    };

    setSavingsGoals(prev => [...prev, newGoal]);

    try {
      const res = await fetch(`${API_BASE_URL}/savings-goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goalData, userId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setSavingsGoals(prev => prev.map(g => g.id === tempId ? data : g));
      }
    } catch (e) {
      console.error('Failed to sync savings goal to backend DB:', e);
    }
  };

  const depositToSavingsGoal = async (goalId: string, amount: number, notes?: string) => {
    if (amount <= 0 || !user) return;

    let targetAchieved = false;

    setSavingsGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const newAmount = g.currentAmount + amount;
        const completed = newAmount >= g.targetAmount;
        if (completed && !g.isCompleted) {
          targetAchieved = true;
        }
        return {
          ...g,
          currentAmount: newAmount,
          isCompleted: completed
        };
      }
      return g;
    }));

    // Record an expense transaction
    const goalObj = savingsGoals.find(g => g.id === goalId);
    const goalTitle = goalObj ? goalObj.title : 'Target Tabungan';

    const depositTx: Transaction = {
      id: `tx-${Date.now()}`,
      userId: user.id,
      title: `Setor Tabungan: ${goalTitle}`,
      amount: amount,
      type: 'expense',
      category: 'Lainnya',
      date: new Date().toISOString().split('T')[0],
      notes: notes || `Setoran untuk target ${goalTitle}`,
      linkedSavingsGoalId: goalId
    };

    setTransactions(prev => [depositTx, ...prev]);
    triggerConfetti();

    if (targetAchieved) {
      setTimeout(() => {
        triggerConfetti();
      }, 500);
    }

    try {
      await fetch(`${API_BASE_URL}/savings-goals/${goalId}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, notes, userId: user.id })
      });
    } catch (e) {
      console.error('Failed to sync deposit to backend DB:', e);
    }
  };

  const deleteSavingsGoal = async (goalId: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== goalId));

    try {
      await fetch(`${API_BASE_URL}/savings-goals/${goalId}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete goal from backend DB:', e);
    }
  };

  const resetToDefaultData = async () => {
    if (!user) return;
    setTransactions([]);
    setSavingsGoals([]);
    localStorage.removeItem(txKey);
    localStorage.removeItem(goalsKey);
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      savingsGoals,
      timeFilter,
      searchQuery,
      selectedCategory,
      stats,
      isBackendConnected,
      setTimeFilter,
      setSearchQuery,
      setSelectedCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addSavingsGoal,
      depositToSavingsGoal,
      deleteSavingsGoal,
      resetToDefaultData
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
