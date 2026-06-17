import type { Player, GameStatus } from '@/lib/types';
import { RankBadge } from '@/components/RankBadge';

interface LeaderboardProps {
  players: Player[];
  myPlayerId?: string | null;
  gameStatus?: GameStatus;
}

export function Leaderboard({ players, myPlayerId, gameStatus }: LeaderboardProps) {
  const sorted = [...players].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  const topScore = sorted[0]?.score ?? 0;
  // All players sharing the highest score are "winners" when game is ended
  const isWinnerHighlight = (player: Player) =>
    gameStatus === 'ended' && topScore > 0 && player.score === topScore;

  if (sorted.length === 0) {
    return (
      <p className="text-center py-8" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Belum ada pemain.
      </p>
    );
  }

  return (
    <div className="w-full">
      <p className="section-label" style={{ marginBottom: 16 }}>
        Leaderboard
      </p>
      <ol className="flex flex-col gap-2">
        {sorted.map((player, idx) => {
          const isMe = player.id === myPlayerId;
          const isWinner = isWinnerHighlight(player);

          const bg = isWinner
            ? 'rgba(245,158,11,0.12)'
            : isMe
            ? 'var(--accent-dim)'
            : 'var(--surface)';

          const border = isWinner
            ? '2px solid #f59e0b'
            : isMe
            ? '2px solid var(--accent)'
            : '1px solid var(--border)';

          const nameColor = isWinner
            ? '#92400e'
            : isMe
            ? 'var(--accent)'
            : 'var(--text-primary)';

          const scoreColor = isWinner ? '#92400e' : isMe ? 'var(--accent)' : 'var(--text-primary)';

          return (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-lg transition-colors"
              style={{
                padding: '12px 16px',
                background: bg,
                border,
                opacity: player.eliminatedThisRound ? 0.5 : 1,
              }}
            >
              {/* Rank */}
              <RankBadge rank={idx + 1} />

              {/* Name */}
              <span
                className="flex-1 font-bold truncate"
                style={{ color: nameColor, fontSize: '0.95rem' }}
              >
                {player.name}
                {isMe && (
                  <span
                    className="ml-2 text-xs font-normal"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    (kamu)
                  </span>
                )}
              </span>

              {/* Score */}
              <span
                className="font-display font-black tabular-nums shrink-0"
                style={{ fontSize: '1.25rem', color: scoreColor }}
              >
                {player.score}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
