'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  /** ISO timestamp when the window ends. All clients count down to this same instant. */
  expiresAt: string;
  /** Total window in seconds — drives the ring fill fraction. */
  total: number;
  /** Diameter in px. */
  size?: number;
}

/**
 * Circular countdown ring. Reads the absolute expiry instant and ticks locally,
 * so every device shows the same remaining time (modulo small device-clock skew)
 * without needing per-tick broadcasts. Color shifts green → amber → red as it drains.
 */
export function Countdown({ expiresAt, total, size = 120 }: CountdownProps) {
  const [remainingMs, setRemainingMs] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now()),
  );

  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    const tick = () => setRemainingMs(Math.max(0, end - Date.now()));
    tick();
    // 100ms keeps the ring smooth without being wasteful.
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [expiresAt]);

  const seconds = Math.ceil(remainingMs / 1000);
  const fraction = total > 0 ? Math.min(1, Math.max(0, remainingMs / (total * 1000))) : 0;

  // Color by remaining seconds, not fraction — predictable regardless of total.
  const color =
    seconds <= 3 ? 'var(--danger)' : seconds <= 7 ? '#f59e0b' : 'var(--accent)';

  const stroke = 8;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - fraction);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      role="timer"
      aria-label={`${seconds} detik tersisa`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
        />
      </svg>
      <span
        className="absolute font-display font-black tabular-nums"
        style={{ fontSize: size * 0.34, color }}
      >
        {seconds}
      </span>
    </div>
  );
}
