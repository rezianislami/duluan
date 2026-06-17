import type { BellState } from '@/lib/types';

interface BellStatusLabelProps {
  state: BellState;
  winnerName?: string | null;
}

interface StatusConfig {
  label: string;
  sublabel?: string;
  color: string;
  size: string;
}

function getConfig(state: BellState, winnerName?: string | null): StatusConfig {
  switch (state) {
    case 'disarmed':
      return {
        label: 'TUNGGU',
        sublabel: 'GAME MASTER…',
        color: 'var(--text-muted)',
        size: 'clamp(1.75rem, 8vw, 2.25rem)',
      };
    case 'armed':
      return {
        label: 'PENCET!',
        color: 'var(--accent)',
        size: 'clamp(2.5rem, 12vw, 4rem)',
      };
    case 'winner':
      return {
        label: 'KAMU',
        sublabel: 'DULUAN!',
        color: 'var(--success)',
        size: 'clamp(2.25rem, 10vw, 3.5rem)',
      };
    case 'locked-other':
      return {
        label: 'TERKUNCI',
        sublabel: winnerName ? `${winnerName} duluan!` : 'Seseorang duluan!',
        color: 'var(--text-secondary)',
        size: 'clamp(1.5rem, 7vw, 2rem)',
      };
    case 'eliminated':
      return {
        label: 'SALAH',
        sublabel: 'Tunggu ronde baru…',
        color: 'var(--danger)',
        size: 'clamp(1.75rem, 8vw, 2.5rem)',
      };
  }
}

export function BellStatusLabel({ state, winnerName }: BellStatusLabelProps) {
  const config = getConfig(state, winnerName);

  return (
    <div
      key={state}
      className="animate-fade-up text-center leading-none"
      style={{ minHeight: '5rem' }}
    >
      <p
        className="font-display font-black tracking-widest uppercase"
        style={{ fontSize: config.size, color: config.color }}
      >
        {config.label}
      </p>
      {config.sublabel && (
        <p
          className="font-display font-bold tracking-wider uppercase mt-2"
          style={{
            fontSize: `calc(${config.size} * 0.6)`,
            color: config.color,
            opacity: 0.8,
          }}
        >
          {config.sublabel}
        </p>
      )}
    </div>
  );
}
