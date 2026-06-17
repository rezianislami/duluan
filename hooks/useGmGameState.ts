'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GameState, Player } from '@/lib/types';

const DEFAULT_GAME_STATE: GameState = {
  status: 'lobby',
  armed: false,
  currentBuzzerId: null,
  currentBuzzerName: null,
  pointsPerCorrect: 1,
};

export interface GmActions {
  armBell: () => Promise<void>;
  disarmBell: () => Promise<void>;
  judgeCorrect: () => Promise<void>;
  judgeWrong: () => Promise<void>;
  skipRound: () => Promise<void>;
  adjustScore: (playerId: string, delta: number) => Promise<void>;
  kickPlayer: (playerId: string) => Promise<void>;
  /** Ends the game (status → 'ended'). Does NOT reset scores. */
  endGame: () => Promise<void>;
  /** Resets all scores to 0 and returns to lobby. */
  resetGame: () => Promise<void>;
  setPointsPerCorrect: (pts: number) => Promise<void>;
  /** Deletes all players and creates a fresh session — players must re-enter their names. */
  factoryReset: () => Promise<void>;
}

export interface UseGmGameStateResult {
  gameState: GameState;
  players: Player[];
  isLoading: boolean;
  actions: GmActions;
}

async function gmFetch(path: string, body?: object) {
  await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Session cookie is sent automatically for same-origin requests
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export function useGmGameState(): UseGmGameStateResult {
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

    es.onerror = () => setIsLoading(false);

    return () => es.close();
  }, []);

  const armBell = useCallback(async () => {
    await gmFetch('/api/arm');
  }, []);

  const disarmBell = useCallback(async () => {
    await gmFetch('/api/disarm');
  }, []);

  const judgeCorrect = useCallback(async () => {
    await gmFetch('/api/judge', { verdict: 'correct' });
  }, []);

  const judgeWrong = useCallback(async () => {
    await gmFetch('/api/judge', { verdict: 'wrong' });
  }, []);

  const skipRound = useCallback(async () => {
    await gmFetch('/api/skip');
  }, []);

  const adjustScore = useCallback(async (playerId: string, delta: number) => {
    await gmFetch('/api/adjust-score', { playerId, delta });
  }, []);

  const kickPlayer = useCallback(async (playerId: string) => {
    await gmFetch('/api/kick', { playerId });
  }, []);

  const endGame = useCallback(async () => {
    await gmFetch('/api/end-game');
  }, []);

  const resetGame = useCallback(async () => {
    await gmFetch('/api/reset');
  }, []);

  const setPointsPerCorrect = useCallback(async (pts: number) => {
    await gmFetch('/api/points-per-correct', { points: pts });
  }, []);

  const factoryReset = useCallback(async () => {
    await gmFetch('/api/factory-reset');
  }, []);

  return {
    gameState,
    players,
    isLoading,
    actions: {
      armBell,
      disarmBell,
      judgeCorrect,
      judgeWrong,
      skipRound,
      adjustScore,
      kickPlayer,
      endGame,
      resetGame,
      setPointsPerCorrect,
      factoryReset,
    },
  };
}
