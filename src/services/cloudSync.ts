import type { User } from '../types/auth';
import type { Transaction, SavingsGoal } from '../types/finance';

// Free, reliable public cloud storage endpoint for cross-device sync (HP <-> Laptop <-> PC)
// Uses JSONBin / MyJSON free public storage bin or fallback REST API
const CLOUD_BIN_ID = '67d58a58e41b4d34e4d58852'; // Public Bin for FinPulse App
const CLOUD_API_URL = `https://api.jsonbin.io/v3/b/${CLOUD_BIN_ID}`;
const CLOUD_API_READ_URL = `https://api.jsonbin.io/v3/b/${CLOUD_BIN_ID}/latest`;

export interface StoredUserRecord extends User {
  passwordHash: string;
}

export interface CloudAppData {
  users: StoredUserRecord[];
  userData: {
    [userId: string]: {
      transactions: Transaction[];
      savingsGoals: SavingsGoal[];
      updatedAt: string;
    };
  };
}

// Default initial cloud structure
const DEFAULT_CLOUD_DATA: CloudAppData = {
  users: [],
  userData: {}
};

// Fetch complete Cloud Data
export const fetchCloudStore = async (): Promise<CloudAppData> => {
  try {
    const res = await fetch(CLOUD_API_READ_URL, {
      method: 'GET',
      headers: {
        'X-Bin-Meta': 'false'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.users)) {
        return data as CloudAppData;
      }
    }
  } catch (error) {
    console.warn('Cloud Sync read warning (operating offline):', error);
  }
  return DEFAULT_CLOUD_DATA;
};

// Save updated Cloud Data
export const updateCloudStore = async (newCloudData: CloudAppData): Promise<boolean> => {
  try {
    const res = await fetch(CLOUD_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newCloudData)
    });
    return res.ok;
  } catch (error) {
    console.warn('Cloud Sync write warning:', error);
    return false;
  }
};

// 1. Fetch Users from Cloud (Allows HP created accounts to login on Laptop)
export const cloudFetchUsers = async (): Promise<StoredUserRecord[]> => {
  const store = await fetchCloudStore();
  return store.users || [];
};

// 2. Save New Registered User to Cloud
export const cloudSaveUser = async (newUser: StoredUserRecord): Promise<void> => {
  const store = await fetchCloudStore();
  const existingUsers = store.users || [];
  
  // Check if email exists
  const index = existingUsers.findIndex(u => u.email.toLowerCase() === newUser.email.toLowerCase());
  if (index >= 0) {
    existingUsers[index] = newUser;
  } else {
    existingUsers.push(newUser);
  }

  store.users = existingUsers;
  await updateCloudStore(store);
};

// 3. Update Existing User Profile / Password in Cloud
export const cloudUpdateUser = async (updatedUserRecord: StoredUserRecord): Promise<void> => {
  const store = await fetchCloudStore();
  const existingUsers = store.users || [];
  
  const index = existingUsers.findIndex(u => u.id === updatedUserRecord.id);
  if (index >= 0) {
    existingUsers[index] = updatedUserRecord;
    store.users = existingUsers;
    await updateCloudStore(store);
  }
};

// 4. Fetch User Data (Transactions & Savings Goals) for a specific userId
export const cloudFetchUserData = async (userId: string): Promise<{ transactions: Transaction[]; savingsGoals: SavingsGoal[] } | null> => {
  const store = await fetchCloudStore();
  if (store.userData && store.userData[userId]) {
    return {
      transactions: store.userData[userId].transactions || [],
      savingsGoals: store.userData[userId].savingsGoals || []
    };
  }
  return null;
};

// 5. Save User Transactions & Savings Goals to Cloud
export const cloudSaveUserData = async (userId: string, transactions: Transaction[], savingsGoals: SavingsGoal[]): Promise<void> => {
  const store = await fetchCloudStore();
  if (!store.userData) {
    store.userData = {};
  }

  store.userData[userId] = {
    transactions,
    savingsGoals,
    updatedAt: new Date().toISOString()
  };

  await updateCloudStore(store);
};
