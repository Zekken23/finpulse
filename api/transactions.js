// Vercel Serverless Function for Transactions using Vercel Blob
import { getDatabase, saveDatabase } from './blobDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const userId = req.query.userId || (req.body && req.body.userId);

  try {
    const dbData = await getDatabase();
    const allTransactions = dbData.transactions || [];

    // 1. GET TRANSACTIONS FOR USER
    if (req.method === 'GET') {
      if (!userId) {
        return res.json([]);
      }
      const userTx = allTransactions.filter(t => t.userId === userId);
      return res.json(userTx);
    }

    // 2. CREATE TRANSACTION
    if (req.method === 'POST') {
      const { userId: reqUserId, title, amount, type, category, date, notes, linkedSavingsGoalId } = req.body || {};
      const activeUser = reqUserId || userId;

      if (!activeUser || !title || !amount || !type || !category || !date) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newTx = {
        id: `tx-${Date.now()}`,
        userId: activeUser,
        title,
        amount,
        type,
        category,
        date,
        notes: notes || null,
        linkedSavingsGoalId: linkedSavingsGoalId || null
      };

      allTransactions.unshift(newTx);
      dbData.transactions = allTransactions;
      await saveDatabase(dbData);

      return res.status(201).json(newTx);
    }

    // 3. DELETE TRANSACTION
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body.id;
      if (!id || !userId) {
        return res.status(400).json({ error: 'Transaction ID and User ID required' });
      }

      dbData.transactions = allTransactions.filter(t => t.id !== id);
      await saveDatabase(dbData);

      return res.json({ message: 'Transaction deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
