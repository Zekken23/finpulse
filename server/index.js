import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db, { initDB } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 7860;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDB();

// --- AUTH API ---

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const id = `user-${Date.now()}`;
  const sql = `INSERT INTO users (id, name, email, passwordHash) VALUES (?, ?, ?, ?)`;

  db.run(sql, [id, name, email.toLowerCase(), password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' });
      }
      return res.status(500).json({ error: err.message });
    }

    const user = { id, name, email, createdAt: new Date().toISOString() };
    res.status(201).json({ message: 'User registered successfully', user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const sql = `SELECT * FROM users WHERE email = ?`;
  db.get(sql, [email.toLowerCase()], (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: 'Email belum terdaftar.' });
    }

    if (user.passwordHash !== password) {
      return res.status(400).json({ error: 'Password yang Anda masukkan salah.' });
    }

    const sessionUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
    res.json({ message: 'Login successful', user: sessionUser });
  });
});

app.put('/api/auth/profile', (req, res) => {
  const { userId, name } = req.body;
  if (!userId || !name) {
    return res.status(400).json({ error: 'User ID and name required' });
  }

  db.run('UPDATE users SET name = ? WHERE id = ?', [name, userId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Profile updated successfully', name });
  });
});

app.put('/api/auth/change-password', (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Missing required password fields' });
  }

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.passwordHash !== oldPassword) {
      return res.status(400).json({ error: 'Kata sandi saat ini salah.' });
    }

    db.run('UPDATE users SET passwordHash = ? WHERE id = ?', [newPassword, userId], function(updateErr) {
      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

// --- TRANSACTIONS API (USER SCOPED) ---

app.get('/api/transactions', (req, res) => {
  const { userId } = req.query;
  let sql = 'SELECT * FROM transactions';
  const params = [];

  if (userId) {
    sql += ' WHERE userId = ?';
    params.push(userId);
  }

  sql += ' ORDER BY date DESC, createdAt DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { userId, title, amount, type, category, date, notes, linkedSavingsGoalId } = req.body;
  if (!userId || !title || !amount || !type || !category || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = `tx-${Date.now()}`;
  const sql = `
    INSERT INTO transactions (id, userId, title, amount, type, category, date, notes, linkedSavingsGoalId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [id, userId, title, amount, type, category, date, notes || null, linkedSavingsGoalId || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id,
      userId,
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

// --- SAVINGS GOALS API (USER SCOPED) ---

app.get('/api/savings-goals', (req, res) => {
  const { userId } = req.query;
  let sql = 'SELECT * FROM savings_goals';
  const params = [];

  if (userId) {
    sql += ' WHERE userId = ?';
    params.push(userId);
  }

  sql += ' ORDER BY createdAt ASC';

  db.all(sql, params, (err, rows) => {
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
  const { userId, title, targetAmount, targetDate, iconName, colorTheme, notes } = req.body;
  if (!userId || !title || !targetAmount || !targetDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const id = `goal-${Date.now()}`;
  const sql = `
    INSERT INTO savings_goals (id, userId, title, targetAmount, currentAmount, targetDate, iconName, colorTheme, notes, isCompleted)
    VALUES (?, ?, ?, ?, 0, ?, ?, ?, ?, 0)
  `;

  db.run(sql, [id, userId, title, targetAmount, targetDate, iconName || 'PiggyBank', colorTheme || 'purple', notes || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id,
      userId,
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
  const { userId, amount, notes } = req.body;
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
        INSERT INTO transactions (id, userId, title, amount, type, category, date, notes, linkedSavingsGoalId)
        VALUES (?, ?, ?, ?, 'expense', 'Lainnya', ?, ?, ?)
      `;
      const dateStr = new Date().toISOString().split('T')[0];
      const txTitle = `Setor Tabungan: ${goal.title}`;
      const txNotes = notes || `Setoran untuk target ${goal.title}`;

      db.run(txSql, [txId, userId || goal.userId, txTitle, amount, dateStr, txNotes, id], (txErr) => {
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
  const { userId } = req.body;
  if (userId) {
    db.run('DELETE FROM transactions WHERE userId = ?', [userId]);
    db.run('DELETE FROM savings_goals WHERE userId = ?', [userId]);
  }
  res.json({ message: 'User data cleared successfully' });
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
