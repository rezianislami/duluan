const MEDAL = [
  { color: '#f59e0b' }, // gold
  { color: '#a8a8a8' }, // silver
  { color: '#cd7c2a' }, // bronze
];

interface TrophyProps {
  color: string;
  rank: number;
}

/* Cup body: x=5–15, y=1–9 rectangular + arc bottom. Text center = (10, 5). */
function TrophySvg({ color, rank }: TrophyProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={color}
      width="36"
      height="36"
      role="img"
      aria-label={`Rank ${rank}`}
    >
      {/* Left handle */}
      <path d="M5 3H3A2 2 0 003 7H5V3z" />
      {/* Right handle */}
      <path d="M15 3h2A2 2 0 0117 7H15V3z" />
      {/* Cup body */}
      <path d="M5 1h10v8a5 5 0 01-10 0V1z" />
      {/* Stem */}
      <rect x="9" y="14" width="2" height="3" rx="0.5" />
      {/* Base */}
      <rect x="5" y="17" width="10" height="2" rx="1" />
      {/* Rank number — centered in the cup bowl */}
      <text
        x="10"
        y="5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#fff"
        fontSize="6"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        aria-hidden="true"
      >
        {rank}
      </text>
    </svg>
  );
}

interface RankBadgeProps {
  rank: number;
}

export function RankBadge({ rank }: RankBadgeProps) {
  if (rank > 3) {
    return (
      <span
        style={{
          width: 36,
          flexShrink: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
        }}
      >
        {rank}
      </span>
    );
  }

  const { color } = MEDAL[rank - 1];

  return (
    <div style={{ flexShrink: 0, lineHeight: 0 }}>
      <TrophySvg color={color} rank={rank} />
    </div>
  );
}
