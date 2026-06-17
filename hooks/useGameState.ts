'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameState, Player, BellState, SessionData } from '@/lib/types';

interface UseGameStateResult {
  gameState: GameState;
  players: Player[];
  myPlayer: Player | null;
  bellState: BellState;
  isLoading: boolean;
}

const DEFAULT_GAME_STATE: GameState = {
  status: 'lobby',
  armed: false,
  currentBuzzerId: null,
  currentBuzzerName: null,
  pointsPerCorrect: 1,
};

export function useGameState(session: SessionData | null): UseGameStateResult {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const es = new EventSource('/api/events');

    es.onmessage = (e) => {
      const { gameState: gs, players: ps } = JSON.parse(e.data) as {
        gameState: GameState;
        players: Player[];
      };
      setGameState(gs);
      setPlayers(ps);
      setIsLoading(false);
    };

    es.onerror = () => {
      // EventSource auto-reconnects — just clear loading on first error
      setIsLoading(false);
    };

    return () => es.close();
  }, []);

  const myPlayer = session
    ? players.find((p) => p.id === session.playerId) ?? null
    : null;

  const deriveBellState = useCallback((): BellState => {
    if (gameState.status !== 'active') return 'disarmed';
    if (!gameState.armed && !gameState.currentBuzzerId) return 'disarmed';

    if (gameState.currentBuzzerId) {
      if (gameState.currentBuzzerId === session?.playerId) return 'winner';
      return 'locked-other';
    }

    if (myPlayer?.eliminatedThisRound) return 'eliminated';
    return 'armed';
  }, [gameState, session, myPlayer]);

  return {
    gameState,
    players,
    myPlayer,
    bellState: deriveBellState(),
    isLoading,
  };
}
