// Shared Vercel Blob Storage Helper for FinPulse Database
import { put, list } from '@vercel/blob';

const DB_FILENAME = 'finpulse_database.json';

const DEFAULT_DB = {
  users: [],
  transactions: [],
  savingsGoals: []
};

// Global in-memory fallback for development or before Blob token is bound
if (!global._finpulseMemoryDb) {
  global._finpulseMemoryDb = { ...DEFAULT_DB };
}

export async function getDatabase() {
  try {
    // 1. Try reading from Vercel Blob Store
    const { blobs } = await list({ prefix: DB_FILENAME });
    if (blobs && blobs.length > 0) {
      // Add cache buster to prevent stale GET responses
      const res = await fetch(`${blobs[0].url}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        return {
          users: data.users || [],
          transactions: data.transactions || [],
          savingsGoals: data.savingsGoals || []
        };
      }
    }
  } catch (e) {
    console.warn('Vercel Blob read fallback to memory:', e.message);
  }

  // 2. In-memory fallback
  return global._finpulseMemoryDb;
}

export async function saveDatabase(data) {
  // Update memory
  global._finpulseMemoryDb = data;

  try {
    // Save to Vercel Blob Storage
    await put(DB_FILENAME, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json'
    });
    return true;
  } catch (e) {
    console.warn('Vercel Blob write error (using memory):', e.message);
    return false;
  }
}
