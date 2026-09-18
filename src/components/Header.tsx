import React, { useState } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  Calendar, 
  RotateCcw,
  LogOut,
  Settings,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import type { TimeFilterOption } from '../types/finance';

interface HeaderProps {
  onOpenAddModal: () => void;
  onOpenSavingsModal: () => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal, onOpenProfileModal }) => {
  const { timeFilter, setTimeFilter, resetToDefaultData } = useFinance();
  const { user, logout } = useAuth();

  const [isMobileMinimized, setIsMobileMinimized] = useState<boolean>(false);

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh data transaksi Anda?')) {
      resetToDefaultData();
    }
  };

  const periodButtons: { key: TimeFilterOption; label: string }[] = [
    { key: 'today', label: 'Hari Ini' },
    { key: 'this_week', label: 'Minggu Ini' },
    { key: 'this_month', label: 'Bulan Ini' },
    { key: 'all', label: 'Semua' },
  ];

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 glass-panel bg-[#090d16]/90 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          
          {/* Top Row: Brand Logo & Mobile Minimize Arrow */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center space-x-3">
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-[1px] shadow-neon-purple flex-shrink-0">
                <div className="w-full h-full bg-[#0b0f19] rounded-[11px] flex items-center justify-center">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white font-space">
                    Fin<span className="text-gradient-purple">Pulse</span>
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Interactive
                  </span>
                </div>
                {!isMobileMinimized && (
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3 text-cyan-400" /> {currentDateStr}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Minimize / Expand Arrow Button */}
            <button
              onClick={() => setIsMobileMinimized(!isMobileMinimized)}
              className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all text-xs font-semibold cursor-pointer active:scale-95"
              title={isMobileMinimized ? "Tampilkan Navbar Menu" : "Minimize Navbar Menu"}
            >
              <span className="text-[10px] text-slate-400">{isMobileMinimized ? "Menu" : "Minimize"}</span>
              {isMobileMinimized ? (
                <ChevronDown className="w-4 h-4 text-purple-400 animate-bounce" />
              ) : (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>

          {/* Collapsible Content Section on Mobile (Always Visible on Desktop md:) */}
          <div className={`${isMobileMinimized ? 'hidden md:flex' : 'flex'} flex-col md:flex-row md:items-center justify-between md:justify-end gap-3.5 w-full md:w-auto transition-all duration-300`}>
            
            {/* Time Filter Pills */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10 glass-panel justify-between sm:justify-start">
              {periodButtons.map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => setTimeFilter(btn.key)}
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 text-center ${
                    timeFilter === btn.key
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Actions & Profile (Right side) */}
            <div className="flex items-center gap-2.5 justify-between md:justify-end">
              
              {/* Primary Action Button */}
              <button
                onClick={onOpenAddModal}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-neon-purple transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-purple-300" />
                <span>+ Catat Transaksi</span>
              </button>

              {/* Reset Data Button */}
              <button
                onClick={handleReset}
                title="Kosongkan Data Transaksi"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* User Profile Badge */}
              {user && (
                <div className="flex items-center gap-1.5 pl-2 sm:pl-3 border-l border-white/10">
                  <button
                    onClick={onOpenProfileModal}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-all text-left group"
                    title="Kelola Akun & Pengaturan Profil"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xs font-black shadow-neon-purple border-2 border-[#090d16] group-hover:scale-105 transition-transform">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#090d16] rounded-full" />
                    </div>

                    <div className="hidden sm:block text-left">
                      <div className="text-xs font-bold text-white leading-tight truncate max-w-[110px] group-hover:text-purple-300 transition-colors flex items-center gap-1">
                        <span>{user.name}</span>
                        <Settings className="w-3 h-3 text-slate-400 opacity-60 group-hover:opacity-100" />
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                        {user.email}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={logout}
                    title="Keluar dari akun (Logout)"
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
