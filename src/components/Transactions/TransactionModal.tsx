import React, { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { formatNumberWithDots, parseDotsToNumber } from '../../utils/formatters';
import type { TransactionType, ExpenseCategory, IncomeCategory } from '../../types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose }) => {
  const { addTransaction } = useFinance();
  const { showToast } = useToast();

  const [type, setType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [category, setCategory] = useState<string>('Makanan & Minuman');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const expenseCategories: ExpenseCategory[] = [
    'Makanan & Minuman',
    'Transportasi',
    'Belanja',
    'Tagihan & Utilitas',
    'Hiburan & Hobi',
    'Kesehatan',
    'Pendidikan',
    'Lainnya'
  ];

  const incomeCategories: IncomeCategory[] = [
    'Gaji Utama',
    'Freelance',
    'Investasi',
    'Bonus',
    'Hasil Usaha',
    'Lainnya'
  ];

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory('Makanan & Minuman');
    } else {
      setCategory('Gaji Utama');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    // Format input string into thousand-dot format real-time (e.g., 27000 -> 27.000)
    const formatted = formatNumberWithDots(inputVal);
    setFormattedAmount(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseDotsToNumber(formattedAmount);

    if (!title.trim()) {
      showToast('❌ Mohon isi judul transaksi terlebih dahulu.', 'error');
      return;
    }

    if (!numAmount || numAmount <= 0) {
      showToast('❌ Nominal transaksi harus lebih besar dari Rp 0.', 'error');
      return;
    }

    try {
      addTransaction({
        title: title.trim(),
        amount: numAmount,
        type,
        category: category as any,
        date,
        notes: notes.trim() || undefined
      });

      showToast(`✅ Transaksi "${title}" (${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}) berhasil disimpan!`, 'success');

      // Reset & Close
      setTitle('');
      setFormattedAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      onClose();
    } catch (err) {
      showToast('❌ Gagal menyimpan transaksi. Coba lagi.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in sm:items-center items-end">
      <div className="glass-panel w-full max-w-md rounded-3xl sm:rounded-2xl border border-purple-500/30 p-6 relative shadow-neon-purple max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Catat Transaksi Baru</h3>
              <p className="text-xs text-slate-400">Pencatatan uang masuk / pengeluaran harian</p>
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
          
          {/* Type Toggle Pills */}
          <div className="flex p-1 rounded-xl bg-slate-900 border border-white/10">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-neon-rose'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>Pengeluaran (-)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-neon-emerald'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>Pemasukan (+)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Judul / Keterangan Transaksi *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'expense' ? 'Contoh: Makan Siang / Pertalite Motor' : 'Contoh: Fee Project / Transfer Gaji'}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nominal (IDR) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  value={formattedAmount}
                  onChange={handleAmountChange}
                  placeholder="27.000"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input text-sm font-bold text-white tracking-wide"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Format titik ribuan otomatis saat diketik.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Kategori Transaksi *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white"
            >
              {type === 'expense'
                ? expenseCategories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))
                : incomeCategories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                  ))
              }
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Rincian item / struk belanja..."
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
              className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-neon-rose'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-neon-emerald'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Catatan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
