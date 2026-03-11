'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error ?? 'Login failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '12px 20px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 20 }}>⬡</span>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 13, fontWeight: 500, letterSpacing: '0.05em', color: 'var(--accent)' }}>CONTRACT TRACKER</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>Sign in to your account</h1>
          <p style={{ color: 'var(--text2)', fontSize: 13 }}>AI-powered IT services contract intelligence</p>
        </div>

        {/* Form */}
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: 28,
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="admin or analyst"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, color: 'var(--text)', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px',
                  background: 'var(--surface2)', border: '1px solid var(--border2)',
                  borderRadius: 8, color: 'var(--text)', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--border2)'}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16, padding: '10px 14px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, color: '#fca5a5', fontSize: 13,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', borderRadius: 8, border: 'none',
                background: loading ? 'var(--border2)' : 'var(--accent)',
                color: '#fff', fontWeight: 600, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text3)' }}>
            <p style={{ marginBottom: 4 }}>Demo credentials:</p>
            <p><code style={{ color: 'var(--text2)' }}>admin / admin123</code> — full access</p>
            <p><code style={{ color: 'var(--text2)' }}>analyst / analyst123</code> — read-only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
