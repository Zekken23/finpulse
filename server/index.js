import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7860; // Default Hugging Face Spaces port is 7860

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDB();

// --- TRANSACTIONS API ---

app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC, createdAt DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { title, amount, type, category, date, notes, linkedSavingsGoalId } = req.body;
  if (!title || !amount || !type || !category || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = `tx-${Date.now()}`;
  const sql = `
    INSERT INTO transactions (id, title, amount, type, category, date, notes, linkedSavingsGoalId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [id, title, amount, type, category, date, notes || null, linkedSavingsGoalId || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id,
      title,
      amount,
      type,
      category,
      date,
      notes,
      linkedSavingsGoalId
    });
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Transaction deleted successfully', id });
  });
});

// --- SAVINGS GOALS API ---

app.get('/api/savings-goals', (req, res) => {
  db.all('SELECT * FROM savings_goals ORDER BY createdAt ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const formatted = rows.map(r => ({
      ...r,
      isCompleted: Boolean(r.isCompleted)
    }));
    res.json(formatted);
  });
});

app.post('/api/savings-goals', (req, res) => {
  const { title, targetAmount, targetDate, iconName, colorTheme, notes } = req.body;
  if (!title || !targetAmount || !targetDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = `goal-${Date.now()}`;
  const sql = `
    INSERT INTO savings_goals (id, title, targetAmount, currentAmount, targetDate, iconName, colorTheme, notes, isCompleted)
    VALUES (?, ?, ?, 0, ?, ?, ?, ?, 0)
  `;

  db.run(sql, [id, title, targetAmount, targetDate, iconName || 'PiggyBank', colorTheme || 'purple', notes || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id,
      title,
      targetAmount,
      currentAmount: 0,
      targetDate,
      iconName: iconName || 'PiggyBank',
      colorTheme: colorTheme || 'purple',
      notes,
      isCompleted: false
    });
  });
});

app.post('/api/savings-goals/:id/deposit', (req, res) => {
  const { id } = req.params;
  const { amount, notes } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid deposit amount' });
  }

  db.get('SELECT * FROM savings_goals WHERE id = ?', [id], (err, goal) => {
    if (err || !goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    const newAmount = goal.currentAmount + amount;
    const isCompleted = newAmount >= goal.targetAmount ? 1 : 0;

    db.run('UPDATE savings_goals SET currentAmount = ?, isCompleted = ? WHERE id = ?', [newAmount, isCompleted, id], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }

      const txId = `tx-${Date.now()}`;
      const txSql = `
        INSERT INTO transactions (id, title, amount, type, category, date, notes, linkedSavingsGoalId)
        VALUES (?, ?, ?, 'expense', 'Lainnya', ?, ?, ?)
      `;
      const dateStr = new Date().toISOString().split('T')[0];
      const txTitle = `Setor Tabungan: ${goal.title}`;
      const txNotes = notes || `Setoran untuk target ${goal.title}`;

      db.run(txSql, [txId, txTitle, amount, dateStr, txNotes, id], (txErr) => {
        if (txErr) {
          console.error('Failed to create deposit transaction record:', txErr.message);
        }
        res.json({
          message: 'Deposit successful',
          goalId: id,
          currentAmount: newAmount,
          isCompleted: Boolean(isCompleted)
        });
      });

    });
  });
});

app.delete('/api/savings-goals/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM savings_goals WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Savings goal deleted successfully', id });
  });
});

app.post('/api/reset', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM transactions');
    db.run('DELETE FROM savings_goals');
    initDB();
    res.json({ message: 'Database reset to default seed data successfully' });
  });
});

// --- SERVE FRONTEND STATIC FILES IN PRODUCTION ---
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log('Serving frontend static files from:', distPath);
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(distPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 FinPulse Server running at http://localhost:${PORT}`);
});
