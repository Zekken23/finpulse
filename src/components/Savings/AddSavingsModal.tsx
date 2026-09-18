import React, { useState } from 'react';
import { X, Target, Laptop, ShieldCheck, Palmtree, Car, Home, Smartphone, PiggyBank, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { formatNumberWithDots, parseDotsToNumber } from '../../utils/formatters';
import type { SavingsGoal } from '../../types/finance';

interface AddSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSavingsModal: React.FC<AddSavingsModalProps> = ({ isOpen, onClose }) => {
  const { addSavingsGoal } = useFinance();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [formattedTargetAmount, setFormattedTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [iconName, setIconName] = useState('PiggyBank');
  const [colorTheme, setColorTheme] = useState<SavingsGoal['colorTheme']>('purple');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleTargetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormattedTargetAmount(formatNumberWithDots(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numTarget = parseDotsToNumber(formattedTargetAmount);

    if (!title.trim()) {
      showToast('❌ Mohon isi nama target tabungan terlebih dahulu.', 'error');
      return;
    }

    if (!numTarget || numTarget <= 0) {
      showToast('❌ Target nominal harus lebih besar dari Rp 0.', 'error');
      return;
    }

    if (!targetDate) {
      showToast('❌ Mohon pilih tenggat waktu pencapaian target.', 'error');
      return;
    }

    try {
      addSavingsGoal({
        title: title.trim(),
        targetAmount: numTarget,
        targetDate,
        iconName,
        colorTheme,
        notes: notes.trim() || undefined
      });

      showToast(`🎯 Target tabungan "${title}" berhasil dibuat!`, 'success');

      // Reset & Close
      setTitle('');
      setFormattedTargetAmount('');
      setTargetDate('');
      setIconName('PiggyBank');
      setColorTheme('purple');
      setNotes('');
      onClose();
    } catch (err) {
      showToast('❌ Gagal membuat target tabungan. Coba lagi.', 'error');
    }
  };

  const iconsList = [
    { name: 'PiggyBank', icon: <PiggyBank className="w-4 h-4" /> },
    { name: 'Laptop', icon: <Laptop className="w-4 h-4" /> },
    { name: 'ShieldCheck', icon: <ShieldCheck className="w-4 h-4" /> },
    { name: 'Palmtree', icon: <Palmtree className="w-4 h-4" /> },
    { name: 'Car', icon: <Car className="w-4 h-4" /> },
    { name: 'Home', icon: <Home className="w-4 h-4" /> },
    { name: 'Smartphone', icon: <Smartphone className="w-4 h-4" /> },
  ];

  const themeList: { key: SavingsGoal['colorTheme']; name: string; bg: string }[] = [
    { key: 'purple', name: 'Ungu Neon', bg: 'bg-purple-500' },
    { key: 'cyan', name: 'Cyan Neon', bg: 'bg-cyan-500' },
    { key: 'emerald', name: 'Emerald', bg: 'bg-emerald-500' },
    { key: 'amber', name: 'Amber', bg: 'bg-amber-500' },
    { key: 'rose', name: 'Rose', bg: 'bg-rose-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in sm:items-center items-end">
      <div className="glass-panel w-full max-w-lg rounded-3xl sm:rounded-2xl border border-purple-500/30 p-6 relative shadow-neon-purple max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Buat Target Tabungan Baru</h3>
              <p className="text-xs text-slate-400">Tentukan tujuan uang simpanan dan target pencapaian Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nama Target Simpanan *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Beli Laptop Baru / Dana Darurat"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Nominal (IDR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  value={formattedTargetAmount}
                  onChange={handleTargetAmountChange}
                  placeholder="10.000.000"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm text-white font-bold tracking-wide"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Format titik ribuan otomatis saat diketik.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tenggat Waktu (Target Date) *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Pilih Ikon Target:
            </label>
            <div className="flex flex-wrap gap-2">
              {iconsList.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIconName(item.name)}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs ${
                    iconName === item.name
                      ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-neon-purple'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Theme Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tema Warna Glowing:
            </label>
            <div className="flex flex-wrap gap-2">
              {themeList.map((theme) => (
                <button
                  key={theme.key}
                  type="button"
                  onClick={() => setColorTheme(theme.key)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                    colorTheme === theme.key
                      ? 'border-white text-white bg-white/10'
                      : 'border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${theme.bg}`} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan / Motivasi (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tabungan khusus tiap minggu"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-neon-purple active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Target Tabungan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
