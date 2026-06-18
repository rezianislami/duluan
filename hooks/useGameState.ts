'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase-client';
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
  answerTimeLimit: 15,
  buzzerExpiresAt: null,
};

export function useGameState(session: SessionData | null): UseGameStateResult {
  const [gameState, setGameState] = useState<GameState>(DEFAULT_GAME_STATE);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current state immediately on mount
    fetch('/api/game-state')
      .then((r) => r.json())
      .then(({ gameState: gs, players: ps }: { gameState: GameState; players: Player[] }) => {
        setGameState(gs);
        setPlayers(ps);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    // Subscribe to Supabase Realtime broadcast — server pushes full snapshot on every mutation.
    // getSupabase() called inside useEffect so createClient() never runs during SSR prerender.
    const sb = getSupabase();
    const channel = sb
      .channel('game-state')
      .on('broadcast', { event: 'update' }, ({ payload }) => {
        const { gameState: gs, players: ps } = payload as { gameState: GameState; players: Player[] };
        setGameState(gs);
        setPlayers(ps);
        setIsLoading(false);
      })
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
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
