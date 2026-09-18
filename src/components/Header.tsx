import React from 'react';
import { 
  Wallet, 
  PlusCircle, 
  Calendar, 
  RotateCcw,
  Target,
  LogOut
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import type { TimeFilterOption } from '../types/finance';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenSavingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onOpenSavingsModal }) => {
  const { timeFilter, setTimeFilter, resetToDefaultData } = useFinance();
  const { user, logout } = useAuth();

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh data transaksi Anda?')) {
      resetToDefaultData();
    }
  };

  const periodButtons: { key: TimeFilterOption; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'this_week', label: 'Minggu Ini' },
    { key: 'this_month', label: 'Bulan Ini' },
    { key: 'all', label: 'Semua Data' },
  ];

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 glass-panel bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-neon-purple">
              <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
                <Wallet className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-space">
                  Fin<span className="text-gradient-purple">Pulse</span>
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-cyan-400" /> {currentDateStr}
              </p>
            </div>
          </div>

          {/* Time Filter Pills & User Profile Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* User Profile Badge & Logout */}
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-white text-xs font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white line-clamp-1">{user.name}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</div>
                </div>
                <button
                  onClick={logout}
                  title="Keluar dari akun (Logout)"
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Period selector */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 glass-panel">
              {periodButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setTimeFilter(btn.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                    timeFilter === btn.key
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSavingsModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all duration-200 hover:shadow-neon-cyan active:scale-95"
              >
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Target Baru</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-neon-purple transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Catat Transaksi</span>
              </button>

              <button
                onClick={handleReset}
                title="Kosongkan Data Transaksi"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
