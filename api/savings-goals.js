// Vercel Serverless Function for Savings Goals using Vercel Blob
import { getDatabase, saveDatabase } from './blobDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.query.userId || (req.body && req.body.userId);
  const isDeposit = req.url.includes('deposit');

  try {
    const dbData = await getDatabase();
    dbData.goals = dbData.goals || [];
    dbData.transactions = dbData.transactions || [];

    // 1. GET SAVINGS GOALS FOR USER
    if (req.method === 'GET') {
      if (!userId) {
        return res.json([]);
      }
      const userGoals = dbData.goals.filter(g => g.userId === userId);
      return res.json(userGoals);
    }

    // 2. DEPOSIT DANA TO GOAL
    if (req.method === 'POST' && isDeposit) {
      const { userId: reqUserId, goalId, amount, notes } = req.body || {};
      const activeUser = reqUserId || userId;

      if (!activeUser || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid deposit payload' });
      }

      const targetGoalId = goalId || req.query.id;
      const goalIndex = dbData.goals.findIndex(g => g.id === targetGoalId && g.userId === activeUser);
      if (goalIndex < 0) {
        return res.status(404).json({ error: 'Savings goal not found' });
      }

      const goal = dbData.goals[goalIndex];
      const newAmount = (goal.currentAmount || 0) + amount;
      const isCompleted = newAmount >= goal.targetAmount;

      dbData.goals[goalIndex].currentAmount = newAmount;
      dbData.goals[goalIndex].isCompleted = isCompleted;

      // Create deposit transaction record
      const depositTx = {
        id: `tx-${Date.now()}`,
        userId: activeUser,
        title: `Setor Tabungan: ${goal.title}`,
        amount,
        type: 'expense',
        category: 'Lainnya',
        date: new Date().toISOString().split('T')[0],
        notes: notes || `Setoran untuk target ${goal.title}`,
        linkedSavingsGoalId: goal.id
      };

      dbData.transactions.unshift(depositTx);
      await saveDatabase(dbData);

      return res.json({
        message: 'Deposit successful',
        goalId: goal.id,
        currentAmount: newAmount,
        isCompleted
      });
    }

    // 3. CREATE SAVINGS GOAL
    if (req.method === 'POST') {
      const { userId: reqUserId, title, targetAmount, targetDate, iconName, colorTheme, notes } = req.body || {};
      const activeUser = reqUserId || userId;

      if (!activeUser || !title || !targetAmount || !targetDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newGoal = {
        id: `goal-${Date.now()}`,
        userId: activeUser,
        title,
        targetAmount: Number(targetAmount),
        currentAmount: 0,
        targetDate,
        iconName: iconName || 'PiggyBank',
        colorTheme: colorTheme || 'purple',
        notes: notes || null,
        isCompleted: false
      };

      dbData.goals.push(newGoal);
      await saveDatabase(dbData);

      return res.status(201).json(newGoal);
    }

    // 4. DELETE SAVINGS GOAL
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body.id;
      if (!id || !userId) {
        return res.status(400).json({ error: 'Goal ID and User ID required' });
      }

      dbData.goals = dbData.goals.filter(g => g.id !== id);
      await saveDatabase(dbData);

      return res.json({ message: 'Savings goal deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

