import React from 'react';
import { Home, PlusCircle, Target, Receipt } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenAddTx: () => void;
  onOpenAddSavings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenAddTx,
  onOpenAddSavings
}) => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around shadow-2xl">
      {/* Overview button */}
      <button
        onClick={() => scrollToSection('dashboard-overview')}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-purple-400 active:scale-95 transition-all py-1 px-3"
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Beranda</span>
      </button>

      {/* Add Transaction Main Floating Action */}
      <button
        onClick={onOpenAddTx}
        className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple -mt-5 border-2 border-[#090d16] active:scale-90 transition-all cursor-pointer"
      >
        <PlusCircle className="w-6 h-6" />
      </button>

      {/* Target Tabungan button */}
      <button
        onClick={onOpenAddSavings}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-cyan-400 active:scale-95 transition-all py-1 px-3"
      >
        <Target className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Target</span>
      </button>

      {/* Riwayat Transaksi button */}
      <button
        onClick={() => scrollToSection('transaction-history')}
        className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 active:scale-95 transition-all py-1 px-3"
      >
        <Receipt className="w-5 h-5" />
        <span className="text-[10px] font-semibold">Riwayat</span>
      </button>
    </div>
  );
};
