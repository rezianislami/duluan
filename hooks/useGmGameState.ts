'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase } from '@/lib/supabase-client';
import type { GameState, Player } from '@/lib/types';

const DEFAULT_GAME_STATE: GameState = {
  status: 'lobby',
  armed: false,
  currentBuzzerId: null,
  currentBuzzerName: null,
  pointsPerCorrect: 1,
  answerTimeLimit: 15,
  buzzerExpiresAt: null,
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
  /** Sets the answer countdown duration (10/15/20/30 seconds). */
  setAnswerTimeLimit: (seconds: number) => Promise<void>;
  /** Auto-resolves an expired answer window as wrong. Fired by the GM countdown. */
  timeoutBuzzer: (buzzerId: string) => Promise<void>;
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

  const setAnswerTimeLimit = useCallback(async (seconds: number) => {
    await gmFetch('/api/answer-time-limit', { seconds });
  }, []);

  const timeoutBuzzer = useCallback(async (buzzerId: string) => {
    await gmFetch('/api/timeout', { buzzerId });
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
      setAnswerTimeLimit,
      timeoutBuzzer,
      factoryReset,
    },
  };
}
