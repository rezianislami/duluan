/**
 * Server-only game state queries and mutations.
 * Pure DB operations — no SSE broadcast here (done at the route layer).
 */
import { db } from './db';
import { gameSession, player } from './schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import type { GameState, Player } from './types';

export type GameSnapshot = { gameState: GameState; players: Player[] };

// ── Session management ────────────────────────────────────────────────────────

/** Get the one global game session, creating it if it doesn't exist. */
export async function getOrCreateSession() {
  const existing = await db.query.gameSession.findFirst({
    orderBy: [desc(gameSession.createdAt)],
  });
  if (existing) return existing;
  const [created] = await db.insert(gameSession).values({}).returning();
  return created;
}

/** Full state snapshot for SSE broadcast and initial GET. */
export async function getSnapshot(): Promise<GameSnapshot> {
  const gs = await getOrCreateSession();

  const allPlayers = await db.query.player.findMany({
    where: eq(player.gameSessionId, gs.id),
    orderBy: [desc(player.score)],
  });

  const buzzer = gs.currentBuzzerId
    ? allPlayers.find((p) => p.id === gs.currentBuzzerId)
    : undefined;

  return {
    gameState: {
      status: gs.status,
      armed: gs.armed,
      currentBuzzerId: gs.currentBuzzerId ?? null,
      currentBuzzerName: buzzer?.name ?? null,
      pointsPerCorrect: gs.pointsPerCorrect,
    },
    players: allPlayers.map((p) => ({
      id: p.id,
      name: p.name,
      score: p.score,
      eliminatedThisRound: p.eliminatedThisRound,
    })),
  };
}

// ── Player actions ────────────────────────────────────────────────────────────

export type JoinResult =
  | { ok: true; playerId: string; playerName: string; sessionToken: string }
  | { ok: false; error: 'name_taken' };

export async function joinGame(name: string): Promise<JoinResult> {
  const gs = await getOrCreateSession();
  const token = randomUUID();
  try {
    const [p] = await db
      .insert(player)
      .values({ gameSessionId: gs.id, name, token })
      .returning();
    return { ok: true, playerId: p.id, playerName: p.name, sessionToken: token };
  } catch (err: unknown) {
    // Postgres unique violation = code 23505
    if ((err as { code?: string }).code === '23505') {
      return { ok: false, error: 'name_taken' };
    }
    throw err;
  }
}

/** Attempt to register a buzz. Returns false if not accepted (not armed, already buzzed, eliminated). */
export async function buzz(playerId: string): Promise<boolean> {
  const gs = await getOrCreateSession();
  if (!gs.armed) return false;

  const p = await db.query.player.findFirst({ where: eq(player.id, playerId) });
  if (!p || p.eliminatedThisRound) return false;

  // Conditional update — only succeeds if still armed and no buzzer set (race-safe)
  const result = await db
    .update(gameSession)
    .set({ currentBuzzerId: playerId, armed: false, updatedAt: new Date() })
    .where(
      and(
        eq(gameSession.id, gs.id),
        eq(gameSession.armed, true),
        isNull(gameSession.currentBuzzerId),
      ),
    )
    .returning();

  return result.length > 0;
}

// ── GM actions ────────────────────────────────────────────────────────────────

export async function arm() {
  const gs = await getOrCreateSession();
  if (gs.status === 'ended') return; // ended game cannot be rearmed
  await db
    .update(gameSession)
    .set({
      armed: true,
      currentBuzzerId: null,
      // First arm transitions lobby → active
      status: gs.status === 'lobby' ? 'active' : gs.status,
      updatedAt: new Date(),
    })
    .where(eq(gameSession.id, gs.id));
}

export async function disarm() {
  const gs = await getOrCreateSession();
  await db
    .update(gameSession)
    .set({ armed: false, currentBuzzerId: null, updatedAt: new Date() })
    .where(eq(gameSession.id, gs.id));
}

export async function judgeCorrect() {
  const gs = await getOrCreateSession();
  if (!gs.currentBuzzerId) return;

  await db
    .update(player)
    .set({ score: sql`${player.score} + ${gs.pointsPerCorrect}` })
    .where(eq(player.id, gs.currentBuzzerId));

  // Clear all eliminated flags for next round
  await db
    .update(player)
    .set({ eliminatedThisRound: false })
    .where(eq(player.gameSessionId, gs.id));

  await db
    .update(gameSession)
    .set({ armed: false, currentBuzzerId: null, updatedAt: new Date() })
    .where(eq(gameSession.id, gs.id));
}

export async function judgeWrong() {
  const gs = await getOrCreateSession();
  if (!gs.currentBuzzerId) return;

  // Eliminate this player for the round, reopen bell
  await db
    .update(player)
    .set({ eliminatedThisRound: true })
    .where(eq(player.id, gs.currentBuzzerId));

  await db
    .update(gameSession)
    .set({ armed: true, currentBuzzerId: null, updatedAt: new Date() })
    .where(eq(gameSession.id, gs.id));
}

export async function skipRound() {
  const gs = await getOrCreateSession();
  await db
    .update(gameSession)
    .set({ armed: false, currentBuzzerId: null, updatedAt: new Date() })
    .where(eq(gameSession.id, gs.id));
  await db
    .update(player)
    .set({ eliminatedThisRound: false })
    .where(eq(player.gameSessionId, gs.id));
}

export async function adjustScore(playerId: string, delta: number) {
  await db
    .update(player)
    .set({ score: sql`GREATEST(0, ${player.score} + ${delta})` })
    .where(eq(player.id, playerId));
}

export async function kickPlayer(playerId: string) {
  const gs = await getOrCreateSession();

  // If the kicked player was the active buzzer, clear round state
  if (gs.currentBuzzerId === playerId) {
    await db
      .update(gameSession)
      .set({ armed: false, currentBuzzerId: null, updatedAt: new Date() })
      .where(eq(gameSession.id, gs.id));
  }

  await db.delete(player).where(eq(player.id, playerId));
}

export async function endGame() {
  const gs = await getOrCreateSession();
  await db
    .update(gameSession)
    .set({ status: 'ended', armed: false, currentBuzzerId: null, updatedAt: new Date() })
    .where(eq(gameSession.id, gs.id));
}

export async function resetGame() {
  const gs = await getOrCreateSession();
  await db
    .update(player)
    .set({ score: 0, eliminatedThisRound: false })
    .where(eq(player.gameSessionId, gs.id));
  await db
    .update(gameSession)
    .set({ status: 'lobby', armed: false, currentBuzzerId: null, updatedAt: new Date() })
    .where(eq(gameSession.id, gs.id));
}

export async function setPointsPerCorrect(pts: number) {
  const gs = await getOrCreateSession();
  await db
    .update(gameSession)
    .set({ pointsPerCorrect: pts, updatedAt: new Date() })
    .where(eq(gameSession.id, gs.id));
}

/** Validate a player token, returns the player row or null. */
export async function getPlayerByToken(token: string) {
  return db.query.player.findFirst({ where: eq(player.token, token) });
}

/**
 * Factory reset — deletes ALL game sessions (cascade-wipes all players).
 * Clears every row in game_session and player tables; no orphaned data remains.
 * Next getOrCreateSession() call creates a fresh empty session.
 * All player localStorage tokens become invalid immediately.
 */
export async function factoryReset() {
  await db.delete(gameSession); // CASCADE: deletes all players across all sessions
}
