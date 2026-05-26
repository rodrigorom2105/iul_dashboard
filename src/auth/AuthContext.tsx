import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthState } from '../types';
import { getStoredAuth, setStoredAuth, clearStoredAuth } from '../utils/auth';
import { apiFetch, ApiError } from '../api/client';

interface LoginResponse {
  token: string;
  user: { id: number; username: string };
  expiresAt: string;
}

interface RefreshResponse {
  token: string;
  expiresAt: string;
}

interface AuthContextValue {
  auth: AuthState | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredAuth();
    setAuth(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const refresh = useCallback(async () => {
    try {
      const res = await apiFetch<RefreshResponse>('/dashboard/refresh', { method: 'POST' });
      const current = getStoredAuth();
      if (!current) return;
      const updated: AuthState = { ...current, token: res.token, expiresAt: res.expiresAt };
      setStoredAuth(updated);
      setAuth(updated);
    } catch {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const stored = getStoredAuth();
    if (!stored) {
      setLoading(false);
      return;
    }

    const expiresAt = new Date(stored.expiresAt).getTime();
    const now = Date.now();

    if (expiresAt <= now) {
      clearStoredAuth();
      setLoading(false);
      return;
    }

    setAuth(stored);
    setLoading(false);

    const thirtyMin = 30 * 60 * 1000;
    if (expiresAt - now < thirtyMin) {
      void refresh();
    }
  }, [refresh]);

  useEffect(() => {
    const handleExpired = () => {
      navigate('/login?reason=expired', { replace: true });
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [navigate]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await apiFetch<LoginResponse>('/dashboard/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    const newAuth: AuthState = { token: res.token, user: res.user, expiresAt: res.expiresAt };
    setStoredAuth(newAuth);
    setAuth(newAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiError };
