import type { AuthState } from '../types';

const KEY = 'dashboard_jwt';

export function getStoredAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth: AuthState): void {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(KEY);
}
