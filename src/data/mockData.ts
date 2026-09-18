import type { Transaction, SavingsGoal } from '../types/finance';

// Helper to calculate recent dates
const today = new Date();
const formatDate = (offsetDays: number): string => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Transaksi Hari Ini Spesifik Pengguna
  {
    id: 'tx-user-01',
    title: 'Makan Siang',
    amount: 27000,
    type: 'expense',
    category: 'Makanan & Minuman',
    date: formatDate(0),
    notes: 'Pengeluaran makan siang hari ini'
  },
  {
    id: 'tx-user-02',
    title: 'Makan Malam',
    amount: 15000,
    type: 'expense',
    category: 'Makanan & Minuman',
    date: formatDate(0),
    notes: 'Pengeluaran makan malam hari ini'
  },
  {
    id: 'tx-user-03',
    title: 'Setor Utang Rokok Teman',
    amount: 27000,
    type: 'income',
    category: 'Hasil Usaha',
    date: formatDate(0),
    notes: 'Pemasukan dari setor utang rokok teman'
  },
  {
    id: 'tx-user-04',
    title: 'Pelunasan Utang Kemarin',
    amount: 20000,
    type: 'income',
    category: 'Hasil Usaha',
    date: formatDate(0),
    notes: 'Pemasukan pelunasan utang kemarin sudah lunas'
  },

  // Transaksi Historis Pendukung
  {
    id: 'tx-03',
    title: 'Project Freelance Web UI',
    amount: 2500000,
    type: 'income',
    category: 'Freelance',
    date: formatDate(1),
    notes: 'DP 50% Project Redesign Landing Page'
  },
  {
    id: 'tx-04',
    title: 'Belanja Bulanan Supermarket',
    amount: 320000,
    type: 'expense',
    category: 'Belanja',
    date: formatDate(2),
    notes: 'Kebutuhan dapur & mandi'
  },
  {
    id: 'tx-05',
    title: 'Kopi & Snack Kerja',
    amount: 28000,
    type: 'expense',
    category: 'Makanan & Minuman',
    date: formatDate(2),
    notes: 'Espresso + Croissant'
  },
  {
    id: 'tx-06',
    title: 'Ojek Online Ke Kampus/Kantor',
    amount: 22000,
    type: 'expense',
    category: 'Transportasi',
    date: formatDate(3),
    notes: 'Diskon vocher Gojek'
  },
  {
    id: 'tx-07',
    title: 'Langganan Internet & WiFi',
    amount: 275000,
    type: 'expense',
    category: 'Tagihan & Utilitas',
    date: formatDate(4),
    notes: 'Tagihan IndiHome 30Mbps'
  },
  {
    id: 'tx-08',
    title: 'Nonton Bioskop Weekend',
    amount: 85000,
    type: 'expense',
    category: 'Hiburan & Hobi',
    date: formatDate(5),
    notes: 'Tiket XXI + Popcorn'
  },
  {
    id: 'tx-09',
    title: 'Gaji Utama Bulanan',
    amount: 6500000,
    type: 'income',
    category: 'Gaji Utama',
    date: formatDate(12),
    notes: 'Transfer Gaji Bulan Ini'
  }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Beli Laptop Gaming / Workstation',
    targetAmount: 18000000,
    currentAmount: 12500000,
    targetDate: '2026-12-31',
    iconName: 'Laptop',
    colorTheme: 'purple',
    notes: 'Alokasi khusus dari tiap dapat fee project freelance'
  },
  {
    id: 'goal-2',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 15000000,
    currentAmount: 9800000,
    targetDate: '2027-06-30',
    iconName: 'ShieldCheck',
    colorTheme: 'cyan',
    notes: 'Simpanan amandemen kondisi tak terduga'
  },
  {
    id: 'goal-3',
    title: 'Liburan Akhir Tahun ke Bali',
    targetAmount: 5000000,
    currentAmount: 3750000,
    targetDate: '2026-11-20',
    iconName: 'Palmtree',
    colorTheme: 'emerald',
    notes: 'Tiket pesawat & penginapan villa'
  }
];
