'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const GM_EMAIL = 'gm@duluan.app';

export function PasscodeForm() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();

    if (!trimmed) {
      setError('Isi kode akses dulu.');
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setLoading(true);

    const { error: authError } = await authClient.signIn.email({
      email: GM_EMAIL,
      password: trimmed,
    });

    if (authError) {
      setError('Kode salah. Coba lagi.');
      setLoading(false);
      inputRef.current?.select();
      return;
    }

    router.replace('/admin/panel');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col" style={{ gap: 16 }} noValidate>
      <div className="flex flex-col" style={{ gap: 8 }}>
        <label htmlFor="gm-passcode" className="section-label">
          Kode akses
        </label>
        <input
          ref={inputRef}
          id="gm-passcode"
          type="password"
          value={code}
          onChange={(e) => { setCode(e.target.value); if (error) setError(null); }}
          placeholder="••••••••"
          autoComplete="current-password"
          autoFocus
          className="w-full rounded-lg outline-none transition-all"
          style={{
            padding: '16px 20px',
            fontSize: '1.25rem',
            fontWeight: 600,
            letterSpacing: '0.25em',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: error ? '2px solid var(--danger)' : '2px solid var(--border)',
            caretColor: 'var(--accent)',
          }}
          onFocus={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)'; }}
          onBlur={(e) => { e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)'; }}
        />
        {error && (
          <p className="font-semibold animate-fade-up" style={{ fontSize: '0.875rem', color: 'var(--danger)' }} role="alert">
            {error}
          </p>
        )}
        {process.env.NODE_ENV !== 'production' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Dev: kode = <code>duluan</code> (seed dulu: <code>npm run db:seed</code>)
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-accent btn-xl btn-full"
      >
        {loading ? 'Memeriksa…' : 'MASUK'}
      </button>
    </form>
  );
}
