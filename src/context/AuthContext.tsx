import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import { 
  cloudFetchUsers, 
  cloudSaveUser, 
  cloudUpdateUser, 
  type StoredUserRecord 
} from '../services/cloudSync';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (newName: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USERS_KEY = 'finpulse_registered_users_v1';
const LOCAL_SESSION_KEY = 'finpulse_active_user_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(LOCAL_SESSION_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved auth session:', e);
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  }, [user]);

  // Helper to get users from LocalStorage
  const getStoredUsers = (): StoredUserRecord[] => {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUsersToStore = (users: StoredUserRecord[]) => {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  };

  // Login handler (Checks LocalStorage + Cloud Store for HP to Laptop cross-device access)
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    const { email, password } = credentials;

    // 1. Check local storage users first
    let users = getStoredUsers();
    let foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // 2. If not found locally, fetch from Cloud Store (Cross-Device Account Discovery)
    if (!foundUser) {
      try {
        const cloudUsers = await cloudFetchUsers();
        if (cloudUsers && cloudUsers.length > 0) {
          // Merge cloud users into local store
          saveUsersToStore(cloudUsers);
          users = cloudUsers;
          foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        }
      } catch (e) {
        console.warn('Could not fetch cloud users during login:', e);
      }
    }

    if (!foundUser) {
      return { success: false, error: 'Email belum terdaftar. Silakan registrasi terlebih dahulu.' };
    }

    if (foundUser.passwordHash !== password) {
      return { success: false, error: 'Password yang Anda masukkan salah.' };
    }

    const sessionUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      createdAt: foundUser.createdAt
    };

    setUser(sessionUser);
    return { success: true };
  };

  // Register handler (Saves to LocalStorage AND Cloud Store for cross-device sync)
  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    const { name, email, password } = credentials;

    if (!name || !email || !password) {
      return { success: false, error: 'Semua kolom wajib diisi.' };
    }

    // Check both local and cloud users
    let users = getStoredUsers();
    try {
      const cloudUsers = await cloudFetchUsers();
      if (cloudUsers && cloudUsers.length > 0) {
        users = cloudUsers;
      }
    } catch (e) {
      // Fallback
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email sudah terdaftar. Silakan login.' };
    }

    const newUserRecord: StoredUserRecord = {
      id: `user-${Date.now()}`,
      name,
      email,
      passwordHash: password,
      createdAt: new Date().toISOString()
    };

    // Save locally
    const localUsers = getStoredUsers();
    localUsers.push(newUserRecord);
    saveUsersToStore(localUsers);

    // Sync to Cloud Store asynchronously
    cloudSaveUser(newUserRecord);

    const sessionUser: User = {
      id: newUserRecord.id,
      name: newUserRecord.name,
      email: newUserRecord.email,
      createdAt: newUserRecord.createdAt
    };

    setUser(sessionUser);
    return { success: true };
  };

  // Update Name Profile Handler
  const updateProfile = async (newName: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Anda belum login.' };
    if (!newName.trim()) return { success: false, error: 'Nama pengguna tidak boleh kosong.' };

    const updatedUser: User = { ...user, name: newName.trim() };
    setUser(updatedUser);

    const users = getStoredUsers();
    const foundIndex = users.findIndex(u => u.id === user.id);
    if (foundIndex >= 0) {
      users[foundIndex].name = newName.trim();
      saveUsersToStore(users);
      cloudUpdateUser(users[foundIndex]);
    }

    return { success: true };
  };

  // Change Password Handler
  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Anda belum login.' };
    if (!oldPassword || !newPassword) return { success: false, error: 'Semua kolom password wajib diisi.' };
    if (newPassword.length < 4) return { success: false, error: 'Password baru minimal 4 karakter.' };

    const users = getStoredUsers();
    const currentUserRecord = users.find(u => u.id === user.id);

    if (currentUserRecord && currentUserRecord.passwordHash !== oldPassword) {
      return { success: false, error: 'Kata sandi saat ini (old password) tidak sesuai.' };
    }

    if (currentUserRecord) {
      currentUserRecord.passwordHash = newPassword;
      saveUsersToStore(users);
      cloudUpdateUser(currentUserRecord);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      updateProfile,
      changePassword,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
