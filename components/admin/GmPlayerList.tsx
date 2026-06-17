'use client';

import { useState } from 'react';
import type { Player } from '@/lib/types';
import type { GmActions } from '@/hooks/useGmGameState';
import { RankBadge } from '@/components/RankBadge';

interface GmPlayerListProps {
  players: Player[];
  currentBuzzerId: string | null;
  actions: GmActions;
}

export function GmPlayerList({ players, currentBuzzerId, actions }: GmPlayerListProps) {
  const [confirmKickId, setConfirmKickId] = useState<string | null>(null);

  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      <p className="section-label">Players ({players.length})</p>

      {sorted.length === 0 ? (
        <p className="text-center" style={{ padding: '24px 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Belum ada pemain.
        </p>
      ) : (
        <ol className="flex flex-col" style={{ gap: 8 }}>
          {sorted.map((player, idx) => {
            const isBuzzer = player.id === currentBuzzerId;
            const isConfirmingKick = confirmKickId === player.id;

            return (
              <li
                key={player.id}
                className="flex items-center rounded-lg transition-colors"
                style={{
                  padding: '12px 16px',
                  gap: 12,
                  background: isBuzzer ? 'var(--accent-dim)' : 'var(--surface)',
                  border: isBuzzer
                    ? '2px solid var(--accent)'
                    : player.eliminatedThisRound
                    ? '1px dashed var(--border)'
                    : '1px solid var(--border)',
                  opacity: player.eliminatedThisRound ? 0.55 : 1,
                }}
              >
                {/* Rank */}
                <RankBadge rank={idx + 1} />

                {/* Name + badges */}
                <div className="flex-1 min-w-0 flex items-center flex-wrap" style={{ gap: 8 }}>
                  <span
                    className="font-bold truncate"
                    style={{ color: isBuzzer ? 'var(--accent)' : 'var(--text-primary)', fontSize: '0.9rem' }}
                  >
                    {player.name}
                  </span>
                  {isBuzzer && (
                    <span
                      className="font-bold uppercase tracking-wider"
                      style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.6rem', background: 'var(--accent)', color: '#000' }}
                    >
                      DULUAN
                    </span>
                  )}
                  {player.eliminatedThisRound && !isBuzzer && (
                    <span
                      className="font-medium uppercase tracking-wide"
                      style={{ padding: '2px 8px', borderRadius: 4, fontSize: '0.6rem', background: 'var(--elevated)', color: 'var(--text-muted)' }}
                    >
                      salah
                    </span>
                  )}
                </div>

                {/* Score adjust */}
                <div className="flex items-center shrink-0" style={{ gap: 4 }}>
                  <button
                    onClick={() => actions.adjustScore(player.id, -1)}
                    aria-label={`Kurangi skor ${player.name}`}
                    className="btn btn-ghost btn-icon-sm"
                  >
                    −
                  </button>
                  <span
                    className="font-display font-black tabular-nums text-center"
                    style={{ width: 32, fontSize: '1.1rem', color: 'var(--text-primary)' }}
                  >
                    {player.score}
                  </span>
                  <button
                    onClick={() => actions.adjustScore(player.id, 1)}
                    aria-label={`Tambah skor ${player.name}`}
                    className="btn btn-ghost btn-icon-sm"
                  >
                    +
                  </button>
                </div>

                {/* Kick */}
                <div className="shrink-0">
                  {isConfirmingKick ? (
                    <div className="flex items-center" style={{ gap: 4 }}>
                      <button
                        onClick={() => { actions.kickPlayer(player.id); setConfirmKickId(null); }}
                        className="btn btn-danger btn-sm"
                      >
                        Ya
                      </button>
                      <button
                        onClick={() => setConfirmKickId(null)}
                        className="btn btn-ghost btn-sm"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmKickId(player.id)}
                      aria-label={`Kick ${player.name}`}
                      title="Remove player"
                      className="btn btn-icon-sm"
                      style={{
                        background: 'var(--elevated)',
                        color: 'var(--danger)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 3px 0 rgba(0,0,0,0.3)',
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
