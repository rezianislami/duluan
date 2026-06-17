'use client';

import type { GameState, Player } from '@/lib/types';
import type { GmActions } from '@/hooks/useGmGameState';

interface BellControlProps {
  gameState: GameState;
  players: Player[];
  actions: GmActions;
}

export function BellControl({ gameState, players, actions }: BellControlProps) {
  const { armed, currentBuzzerId, currentBuzzerName, pointsPerCorrect } = gameState;
  const hasBuzzer = !!currentBuzzerId;
  const eligibleCount = players.filter((p) => !p.eliminatedThisRound).length;

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <p className="section-label">Kontrol Bell</p>

      {/* Buzzer result */}
      {hasBuzzer && (
        <div
          key={currentBuzzerId}
          className="rounded-lg animate-fade-up"
          style={{
            padding: '16px 20px',
            background: 'var(--accent-dim)',
            border: '2px solid var(--accent)',
            gap: 4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <p
            className="font-bold tracking-widest uppercase"
            style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.15em' }}
          >
            Duluan!
          </p>
          <p
            className="font-display font-black"
            style={{ fontSize: '1.75rem', color: 'var(--accent)', letterSpacing: '-0.01em' }}
          >
            {currentBuzzerName}
          </p>
        </div>
      )}

      {/* Armed indicator (no buzzer yet) */}
      {armed && !hasBuzzer && (
        <div
          className="rounded-lg flex items-center"
          style={{
            padding: '12px 16px',
            gap: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            className="rounded-full shrink-0 animate-dot-pulse"
            style={{ width: 10, height: 10, background: 'var(--success)', boxShadow: '0 0 8px var(--success)', flexShrink: 0 }}
          />
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
            Bell terbuka — menunggu {eligibleCount} pemain…
          </span>
        </div>
      )}

      {/* Judging buttons */}
      {hasBuzzer && (
        <div className="grid grid-cols-2" style={{ gap: 12 }}>
          <button onClick={actions.judgeCorrect} className="btn btn-success btn-lg btn-full">
            ✓ BENAR
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 400, opacity: 0.85, marginTop: 4, textTransform: 'none', letterSpacing: 0 }}>
              +{pointsPerCorrect} poin
            </span>
          </button>
          <button onClick={actions.judgeWrong} className="btn btn-danger btn-lg btn-full">
            ✗ SALAH
            <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 400, opacity: 0.85, marginTop: 4, textTransform: 'none', letterSpacing: 0 }}>
              Bell buka lagi
            </span>
          </button>
        </div>
      )}

      {/* Arm / disarm */}
      {!hasBuzzer && (
        <button
          onClick={armed ? actions.disarmBell : actions.armBell}
          className={`btn btn-full ${armed ? 'btn-danger' : 'btn-success'}`}
          style={{ padding: '20px 24px', fontSize: '1.125rem' }}
        >
          {armed ? '🔒 TUTUP BELL' : '🔓 BUKA BELL'}
        </button>
      )}

      {/* Skip round */}
      <button onClick={actions.skipRound} className="btn btn-ghost btn-md btn-full">
        ↩ Lewati / Ronde Baru
      </button>

    </div>
  );
}
