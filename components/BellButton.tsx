'use client';

import { useRef, useState, useCallback } from 'react';
import type { BellState } from '@/lib/types';
import { BellIcon, LockIcon, CheckIcon } from './BellIcon';

interface BellButtonProps {
  state: BellState;
  onBuzz: () => Promise<void>;
}

/* Shadow depth larger than .btn (4px) to stay proportional to the button's size */
const SHADOW_DEPTH = 8;

const STATE_STYLES: Record<BellState, {
  bg: string;
  iconColor: string;
  shadow: string;
  shadowPress: string;
  animClass?: string;
}> = {
  disarmed: {
    bg: 'var(--elevated)',
    iconColor: 'var(--text-muted)',
    shadow: `0 ${SHADOW_DEPTH}px 0 #d4d4d4`,
    shadowPress: '0 1px 0 #d4d4d4',
  },
  armed: {
    bg: 'var(--accent)',
    iconColor: '#fff',
    shadow: `0 ${SHADOW_DEPTH}px 0 var(--accent-dark)`,
    shadowPress: '0 1px 0 var(--accent-dark)',
    animClass: 'animate-bell-ring',   /* ring plays on buzz; pulse removed — solid shadow is static */
  },
  winner: {
    bg: 'var(--accent)',
    iconColor: '#fff',
    /* solid press-shadow + green outer glow — same base as armed */
    shadow: `0 ${SHADOW_DEPTH}px 0 var(--accent-dark), 0 0 48px rgba(88,204,2,0.55), 0 0 100px rgba(88,204,2,0.25)`,
    shadowPress: '0 1px 0 var(--accent-dark)',
    animClass: 'animate-winner-burst',
  },
  'locked-other': {
    bg: 'var(--locked)',
    iconColor: 'var(--text-muted)',
    shadow: `0 ${SHADOW_DEPTH}px 0 #d4d4d4`,
    shadowPress: '0 1px 0 #d4d4d4',
  },
  eliminated: {
    bg: 'var(--locked)',
    iconColor: 'var(--text-muted)',
    shadow: `0 ${SHADOW_DEPTH}px 0 #d4d4d4`,
    shadowPress: '0 1px 0 #d4d4d4',
  },
};

export function BellButton({ state, onBuzz }: BellButtonProps) {
  const [pressing, setPressing] = useState(false);
  const [ringing, setRinging] = useState(false);
  const buzzingRef = useRef(false);

  const handleBuzz = useCallback(async () => {
    if (state !== 'armed' || buzzingRef.current) return;
    buzzingRef.current = true;
    setPressing(true);
    setRinging(true);

    try {
      await onBuzz();
    } finally {
      buzzingRef.current = false;
      setPressing(false);
      setTimeout(() => setRinging(false), 600);
    }
  }, [state, onBuzz]);

  const styles = STATE_STYLES[state];
  const isInteractive = state === 'armed';

  /* Only play ring anim when actually ringing — not as an idle animation */
  const animClass = ringing ? 'animate-bell-ring' : (state === 'winner' ? 'animate-winner-burst' : '');

  /* Press: translateY + shadow collapse (matches .btn-success behavior) */
  const transform = pressing && !ringing ? `translateY(${SHADOW_DEPTH - 1}px)` : undefined;
  const boxShadow = pressing ? styles.shadowPress : styles.shadow;

  return (
    <button
      type="button"
      onClick={handleBuzz}
      disabled={!isInteractive}
      aria-label={
        state === 'armed' ? 'Pencet bell!' : state === 'winner' ? 'Kamu duluan!' : 'Bell tidak aktif'
      }
      className={`no-tap-highlight flex items-center justify-center ${animClass}`}
      style={{
        width: 'clamp(220px, 60vw, 296px)',
        height: 'clamp(220px, 60vw, 296px)',
        borderRadius: 9999,
        background: styles.bg,
        border: 'none',
        boxShadow,
        cursor: isInteractive ? 'pointer' : 'default',
        transform,
        transition: 'transform 0.08s ease, box-shadow 0.08s ease, background-color 0.3s ease',
        flexShrink: 0,
      }}
    >
      {state === 'winner' && (
        <CheckIcon width="40%" height="40%" style={{ color: styles.iconColor }} />
      )}
      {(state === 'locked-other' || state === 'eliminated') && (
        <LockIcon width="36%" height="36%" style={{ color: styles.iconColor }} />
      )}
      {(state === 'disarmed' || state === 'armed') && (
        <BellIcon width="48%" height="48%" style={{ color: styles.iconColor }} />
      )}
    </button>
  );
}
