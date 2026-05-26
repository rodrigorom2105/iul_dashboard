import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

export default function LoginPage() {
  const { login, auth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth) navigate('/clock', { replace: true });
  }, [auth, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/clock', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError('Credenciales inválidas.');
        else if (err.status === 429) setError('Demasiados intentos. Espera un minuto.');
        else setError('Error al iniciar sesión. Intenta de nuevo.');
      } else {
        setError('Error de conexión. Verifica tu red.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white">IUL Dashboard</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Panel administrativo</p>
        </div>

        {reason === 'expired' && (
          <div className="mb-4 px-4 py-3 rounded-md bg-yellow-open-bg border border-yellow-open/30 text-yellow-open text-sm">
            Tu sesión expiró. Inicia sesión de nuevo.
          </div>
        )}

        <form
          onSubmit={(e) => { void handleSubmit(e); }}
          className="bg-card border border-border rounded-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-app border border-border rounded-md px-3 py-2 text-white text-sm placeholder-[#94a3b8] focus:outline-none focus:border-blue-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-app border border-border rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-accent transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-clockout text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-accent hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-md text-sm transition-colors"
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
