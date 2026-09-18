import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Transaction, SavingsGoal, TimeFilterOption, FinancialStats } from '../types/finance';
import { calculateFinancialStats, triggerConfetti } from '../utils/formatters';
import { useAuth } from './AuthContext';
import { cloudFetchUserData, cloudSaveUserData } from '../services/cloudSync';

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
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('this_month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Keys for user specific LocalStorage
  const txKey = user ? `finpulse_tx_${user.id}` : 'finpulse_tx_guest';
  const goalsKey = user ? `finpulse_goals_${user.id}` : 'finpulse_goals_guest';

  // Load user data on change of active user (Checks Local + Cloud Sync safely)
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setSavingsGoals([]);
      setIsDataLoaded(false);
      return;
    }

    let isMounted = true;

    const fetchUserData = async () => {
      setIsDataLoaded(false);

      let loadedTx: Transaction[] = [];
      let loadedGoals: SavingsGoal[] = [];
      let backendSuccess = false;

      // 1. Try Backend API first if active
      try {
        const [txRes, goalsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/transactions?userId=${user.id}`),
          fetch(`${API_BASE_URL}/savings-goals?userId=${user.id}`)
        ]);

        if (txRes.ok && goalsRes.ok) {
          loadedTx = await txRes.json();
          loadedGoals = await goalsRes.json();
          backendSuccess = true;
        }
      } catch (error) {
        backendSuccess = false;
      }

      if (backendSuccess && isMounted) {
        setTransactions(loadedTx);
        setSavingsGoals(loadedGoals);
        setIsBackendConnected(true);
        setIsDataLoaded(true);
        return;
      }

      setIsBackendConnected(false);

      // 2. Read from LocalStorage first (instant & reliable)
      const savedTx = localStorage.getItem(txKey);
      const savedGoals = localStorage.getItem(goalsKey);

      let localTx: Transaction[] = savedTx ? JSON.parse(savedTx) : [];
      let localGoals: SavingsGoal[] = savedGoals ? JSON.parse(savedGoals) : [];

      // 3. Fallback to Cloud Sync if LocalStorage is empty
      if (localTx.length === 0 && localGoals.length === 0) {
        try {
          const cloudData = await cloudFetchUserData(user.id);
          if (cloudData) {
            localTx = cloudData.transactions || [];
            localGoals = cloudData.savingsGoals || [];
          }
        } catch (e) {
          console.warn('Cloud Data sync read warning:', e);
        }
      }

      if (isMounted) {
        setTransactions(localTx);
        setSavingsGoals(localGoals);
        localStorage.setItem(txKey, JSON.stringify(localTx));
        localStorage.setItem(goalsKey, JSON.stringify(localGoals));
        setIsDataLoaded(true);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [user?.id, txKey, goalsKey]);

  // Sync to LocalStorage & Cloud Store (ONLY AFTER initial data fetch has completed!)
  useEffect(() => {
    if (user && isDataLoaded) {
      localStorage.setItem(txKey, JSON.stringify(transactions));
      localStorage.setItem(goalsKey, JSON.stringify(savingsGoals));
      // Cross-device Cloud Sync
      cloudSaveUserData(user.id, transactions, savingsGoals);
    }
  }, [transactions, savingsGoals, user?.id, txKey, goalsKey, isDataLoaded]);

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
      // Offline / Cloud mode
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
      // Offline / Cloud mode
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
      // Offline / Cloud mode
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
      // Offline / Cloud mode
    }
  };

  const deleteSavingsGoal = async (goalId: string) => {
    setSavingsGoals(prev => prev.filter(g => g.id !== goalId));

    try {
      await fetch(`${API_BASE_URL}/savings-goals/${goalId}`, { method: 'DELETE' });
    } catch (e) {
      // Offline / Cloud mode
    }
  };

  const resetToDefaultData = async () => {
    if (!user) return;
    setTransactions([]);
    setSavingsGoals([]);
    localStorage.removeItem(txKey);
    localStorage.removeItem(goalsKey);
    cloudSaveUserData(user.id, [], []);
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
