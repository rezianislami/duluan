'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveSession } from '@/lib/session';

export function JoinForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Isi nama dulu.');
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'name_taken') {
          setError('Nama sudah dipakai. Pilih nama lain.');
        } else if (data.error === 'invalid_name') {
          setError('Nama tidak valid.');
        } else {
          setError('Gagal gabung. Coba lagi.');
        }
        setLoading(false);
        return;
      }

      saveSession({ playerId: data.playerId, playerName: data.playerName, sessionToken: data.sessionToken });
      router.push('/game');
    } catch {
      setError('Gagal gabung. Coba lagi.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="player-name"
          className="section-label"
        >
          Nama kamu
        </label>
        <input
          ref={inputRef}
          id="player-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Ketik namamu…"
          maxLength={15}
          autoComplete="off"
          autoFocus
          className="w-full rounded-lg outline-none transition-all"
          style={{
            padding: '16px 20px',
            fontSize: '1.125rem',
            fontWeight: 600,
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            border: error ? '2px solid var(--danger)' : '2px solid var(--border)',
            caretColor: 'var(--accent)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--accent)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border)';
          }}
        />
        {error && (
          <p
            className="text-sm font-semibold animate-fade-up"
            style={{ color: 'var(--danger)' }}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn btn-accent btn-xl btn-full"
      >
        {loading ? 'Gabung…' : 'GABUNG'}
      </button>
    </form>
  );
}
