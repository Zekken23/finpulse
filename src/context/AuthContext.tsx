import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
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

  // Local user storage helper
  const getStoredUsers = (): (User & { passwordHash: string })[] => {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveUserToStore = (newUser: User & { passwordHash: string }) => {
    const users = getStoredUsers();
    users.push(newUser);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  };

  // Login handler
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    const { email, password } = credentials;

    // First try backend API if available
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return { success: true };
      }
    } catch (e) {
      // Fallback to local storage auth
    }

    // Local authentication fallback
    const users = getStoredUsers();
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

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

  // Register handler
  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; error?: string }> => {
    const { name, email, password } = credentials;

    if (!name || !email || !password) {
      return { success: false, error: 'Semua kolom wajib diisi.' };
    }

    // Try backend API first
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return { success: true };
      }
    } catch (e) {
      // Fallback to local storage auth
    }

    // Check existing email
    const users = getStoredUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'Email sudah terdaftar. Silakan login.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString()
    };

    saveUserToStore({
      ...newUser,
      passwordHash: password
    });

    setUser(newUser);
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
