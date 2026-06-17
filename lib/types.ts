export type GameStatus = 'lobby' | 'active' | 'ended';

/** From the player's perspective what state the bell is in */
export type BellState =
  | 'disarmed'           // GM hasn't opened it yet
  | 'armed'              // PENCET! — race is on
  | 'winner'             // I buzzed first — waiting for GM judgment
  | 'locked-other'       // Someone else buzzed first
  | 'eliminated';        // I was judged wrong this round, waiting for next round

export interface Player {
  id: string;
  name: string;
  score: number;
  eliminatedThisRound: boolean;
}

export interface GameState {
  status: GameStatus;
  armed: boolean;
  currentBuzzerId: string | null;
  currentBuzzerName: string | null;
  pointsPerCorrect: number;
}

/** Stored in localStorage to identify this device */
export interface SessionData {
  playerId: string;
  playerName: string;
  sessionToken: string;
}
