import { getStoredAuth, clearStoredAuth } from '../utils/auth';

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = getStoredAuth();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (auth?.token) {
    headers['Authorization'] = `Bearer ${auth.token}`;
  }

  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...init,
    headers,
  });

  if (res.status === 401) {
    clearStoredAuth();
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new ApiError(401, null);
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}
