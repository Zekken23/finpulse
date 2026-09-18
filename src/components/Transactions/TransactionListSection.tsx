import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Calendar,
  PlusCircle
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { formatIDR, formatDateID, filterTransactionsByPeriod } from '../../utils/formatters';

interface TransactionListSectionProps {
  onOpenAddModal: () => void;
}

export const TransactionListSection: React.FC<TransactionListSectionProps> = ({ onOpenAddModal }) => {
  const { 
    transactions, 
    deleteTransaction, 
    timeFilter, 
    searchQuery, 
    setSearchQuery 
  } = useFinance();

  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filter transactions by Period, Type, Category & Search query
  const periodFiltered = filterTransactionsByPeriod(transactions, timeFilter);

  const finalFiltered = periodFiltered.filter(t => {
    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    
    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCategory = t.category.toLowerCase().includes(q);
      const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false;
      return matchTitle || matchCategory || matchNotes;
    }

    return true;
  });

  // Export transactions to CSV file
  const handleExportCSV = () => {
    if (finalFiltered.length === 0) return;

    const headers = ['ID', 'Tanggal', 'Jenis', 'Kategori', 'Judul Transaksi', 'Nominal (IDR)', 'Catatan'];
    const rows = finalFiltered.map(t => [
      t.id,
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      `"${t.category}"`,
      `"${t.title}"`,
      t.amount,
      `"${t.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinPulse_Laporan_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus catatan "${title}"?`)) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 mb-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-purple-400" />
            <h2 className="text-xl font-black text-white tracking-tight font-space">
              Catatan Transaksi <span className="text-gradient-purple">Harian & Periodik</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Riwayat lengkap pengeluaran dan pemasukan uang Anda.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            title="Download laporan CSV"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all"
          >
            <Download className="w-4 h-4 text-purple-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-neon-purple active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5">
        {/* Search Bar */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, toko, atau catatan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs text-white"
          />
        </div>

        {/* Type filter */}
        <div className="sm:col-span-3">
          <select
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
          >
            <option value="all" className="bg-slate-900">Semua Jenis Transaksi</option>
            <option value="expense" className="bg-slate-900">Hanya Pengeluaran (-)</option>
            <option value="income" className="bg-slate-900">Hanya Pemasukan (+)</option>
          </select>
        </div>

        {/* Category filter */}
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white"
          >
            <option value="all" className="bg-slate-900">Semua Kategori</option>
            <option value="Makanan & Minuman" className="bg-slate-900">Makanan & Minuman</option>
            <option value="Transportasi" className="bg-slate-900">Transportasi</option>
            <option value="Belanja" className="bg-slate-900">Belanja</option>
            <option value="Tagihan & Utilitas" className="bg-slate-900">Tagihan & Utilitas</option>
            <option value="Hiburan & Hobi" className="bg-slate-900">Hiburan & Hobi</option>
            <option value="Gaji Utama" className="bg-slate-900">Gaji Utama</option>
            <option value="Freelance" className="bg-slate-900">Freelance</option>
            <option value="Investasi" className="bg-slate-900">Investasi</option>
            <option value="Lainnya" className="bg-slate-900">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      {finalFiltered.length === 0 ? (
        <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
          <Receipt className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-400">Tidak ada transaksi ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">Coba ubah kata kunci pencarian atau filter rentang waktu Anda.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {finalFiltered.map((tx) => {
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="glass-panel-interactive rounded-xl p-3.5 flex items-center justify-between gap-4 border border-white/5 hover:border-white/20 transition-all group"
              >
                {/* Left side: Icon + Title & Category */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold border ${
                      isIncome
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpRight className="w-5 h-5" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {tx.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 flex-shrink-0">
                        {tx.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> {formatDateID(tx.date)}
                      </span>
                      {tx.notes && (
                        <span className="truncate max-w-[200px] text-slate-400 italic">
                          • "{tx.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount & Delete Button */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-extrabold font-space ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatIDR(tx.amount)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(tx.id, tx.title)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
