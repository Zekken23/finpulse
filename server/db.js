import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'finpulse.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite Database at:', dbPath);
  }
});

// Helper to calculate recent dates
const today = new Date();
const formatDate = (offsetDays) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

// Initialize Database Schema
export const initDB = () => {
  db.serialize(() => {
    // Table Transactions
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        linkedSavingsGoalId TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Savings Goals
    db.run(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        targetAmount REAL NOT NULL,
        currentAmount REAL NOT NULL,
        targetDate TEXT NOT NULL,
        iconName TEXT NOT NULL,
        colorTheme TEXT NOT NULL,
        notes TEXT,
        isCompleted INTEGER DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check & Seed Initial Transactions
    db.get('SELECT COUNT(*) as count FROM transactions', [], (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding initial transactions into SQLite database...');
        const initialTx = [
          // User specific today transactions
          ['tx-user-01', 'Makan Siang', 27000, 'expense', 'Makanan & Minuman', formatDate(0), 'Pengeluaran makan siang hari ini', null],
          ['tx-user-02', 'Makan Malam', 15000, 'expense', 'Makanan & Minuman', formatDate(0), 'Pengeluaran makan malam hari ini', null],
          ['tx-user-03', 'Setor Utang Rokok Teman', 27000, 'income', 'Hasil Usaha', formatDate(0), 'Pemasukan dari setor utang rokok teman', null],
          ['tx-user-04', 'Pelunasan Utang Kemarin', 20000, 'income', 'Hasil Usaha', formatDate(0), 'Pemasukan pelunasan utang kemarin sudah lunas', null],
          
          // Additional historical sample transactions
          ['tx-03', 'Project Freelance Web UI', 2500000, 'income', 'Freelance', formatDate(1), 'DP 50% Project Redesign Landing Page', null],
          ['tx-04', 'Belanja Bulanan Supermarket', 320000, 'expense', 'Belanja', formatDate(2), 'Kebutuhan dapur & mandi', null],
          ['tx-05', 'Kopi & Snack Kerja', 28000, 'expense', 'Makanan & Minuman', formatDate(2), 'Espresso + Croissant', null],
          ['tx-06', 'Ojek Online Ke Kampus/Kantor', 22000, 'expense', 'Transportasi', formatDate(3), 'Diskon vocher Gojek', null],
          ['tx-07', 'Langganan Internet & WiFi', 275000, 'expense', 'Tagihan & Utilitas', formatDate(4), 'Tagihan IndiHome 30Mbps', null],
          ['tx-08', 'Nonton Bioskop Weekend', 85000, 'expense', 'Hiburan & Hobi', formatDate(5), 'Tiket XXI + Popcorn', null],
          ['tx-09', 'Gaji Utama Bulanan', 6500000, 'income', 'Gaji Utama', formatDate(12), 'Transfer Gaji Bulan Ini', null]
        ];

        const stmt = db.prepare(`
          INSERT INTO transactions (id, title, amount, type, category, date, notes, linkedSavingsGoalId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        initialTx.forEach(tx => stmt.run(tx));
        stmt.finalize();
      }
    });

    // Check & Seed Initial Savings Goals
    db.get('SELECT COUNT(*) as count FROM savings_goals', [], (err, row) => {
      if (!err && row.count === 0) {
        console.log('Seeding initial savings goals into SQLite database...');
        const initialGoals = [
          ['goal-1', 'Beli Laptop Gaming / Workstation', 18000000, 12500000, '2026-12-31', 'Laptop', 'purple', 'Alokasi khusus dari tiap dapat fee project freelance', 0],
          ['goal-2', 'Dana Darurat 6 Bulan', 15000000, 9800000, '2027-06-30', 'ShieldCheck', 'cyan', 'Simpanan amandemen kondisi tak terduga', 0],
          ['goal-3', 'Liburan Akhir Tahun ke Bali', 5000000, 3750000, '2026-11-20', 'Palmtree', 'emerald', 'Tiket pesawat & penginapan villa', 0]
        ];

        const stmt = db.prepare(`
          INSERT INTO savings_goals (id, title, targetAmount, currentAmount, targetDate, iconName, colorTheme, notes, isCompleted)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        initialGoals.forEach(g => stmt.run(g));
        stmt.finalize();
      }
    });

  });
};

export default db;
