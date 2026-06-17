'use client';

import { useEffect, useState } from 'react';

const COLORS = ['#58cc02', '#ffc700', '#1cb0f6', '#ff4b4b', '#ce82ff', '#ff9600', '#ffffff'];

interface Piece {
  id: number;
  x: number;
  color: string;
  width: number;
  height: number;
  duration: number;
  delay: number;
  rotStart: number;
  rotEnd: number;
  drift: number;
  radius: string;
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: 6 + Math.random() * 8,
    height: 4 + Math.random() * 6,
    duration: 2.5 + Math.random() * 2.5,
    delay: Math.random() * 1.5,
    rotStart: Math.random() * 360,
    rotEnd: 360 + Math.random() * 720,
    drift: (Math.random() - 0.5) * 180,
    radius: Math.random() > 0.4 ? '50%' : '2px',
  }));
}

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (active) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      setPieces(makePieces(90));
    } else {
      setPieces([]);
    }
  }, [active]);

  if (!pieces.length) return null;

  /*
   * Per-piece @keyframes with hardcoded values — avoids the browser bug where
   * var() inside @keyframes transform isn't resolved per-element during interpolation.
   */
  const keyframes = pieces
    .map(
      p => `
        @keyframes fall-${p.id} {
          from {
            transform: translateY(-40px) translateX(0px) rotate(${p.rotStart}deg);
            opacity: 1;
          }
          80% { opacity: 1; }
          to {
            transform: translateY(110vh) translateX(${p.drift}px) rotate(${p.rotEnd}deg);
            opacity: 0;
          }
        }
      `
    )
    .join('');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <style>{keyframes}</style>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.x}%`,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.radius,
            animation: `fall-${p.id} ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
