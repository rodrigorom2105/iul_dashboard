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
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div style={{ width: '100%', maxWidth: 360 }} className="fade-in">
        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent), var(--info))',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 15,
              color: '#0a0c10',
              boxShadow: '0 0 0 1px var(--border-strong), inset 0 1px 0 rgba(255,255,255,0.15)',
              margin: '0 auto 14px',
            }}
          >
            IU
          </div>
          <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text)', lineHeight: 1.2 }}>
            IUL Dashboard
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Panel administrativo
          </div>
        </div>

        {reason === 'expired' && (
          <div
            style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 8,
              background: 'var(--warn-soft)',
              border: '1px solid rgba(251,191,36,0.25)',
              color: 'var(--warn)',
              fontSize: 12,
            }}
          >
            Tu sesión expiró. Inicia sesión de nuevo.
          </div>
        )}

        <div
          style={{
            background: 'var(--bg-elev)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '24px 24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="username"
              style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label
              htmlFor="password"
              style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                color: 'var(--text)',
                fontSize: 13,
                outline: 'none',
                fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: 'var(--neg)', margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            onClick={(e) => { void handleSubmit(e); }}
            style={{
              marginTop: 4,
              padding: '9px 0',
              background: 'var(--accent)',
              color: '#0a0c10',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'inherit',
              transition: 'opacity 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.currentTarget as HTMLElement).style.background = 'var(--accent-strong)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--accent)';
            }}
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
