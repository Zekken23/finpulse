// Vercel Serverless Function for resetting user data using Vercel Blob
import { getDatabase, saveDatabase } from './blobDb.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.body || {};
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  try {
    const dbData = await getDatabase();
    if (dbData.transactions) {
      dbData.transactions = dbData.transactions.filter(t => t.userId !== userId);
    }
    if (dbData.goals) {
      dbData.goals = dbData.goals.filter(g => g.userId !== userId);
    }
    await saveDatabase(dbData);

    return res.json({ message: 'User data cleared successfully', userId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

