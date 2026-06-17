import { getPlayerByToken } from '@/lib/game';

export const dynamic = 'force-dynamic';

/**
 * Validates a player's session token and returns their current data.
 * Called by the game page on mount to detect stale tokens (e.g. after a kick).
 */
export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const p = await getPlayerByToken(token);
  if (!p) return Response.json({ error: 'invalid_token' }, { status: 401 });

  return Response.json({ playerId: p.id, playerName: p.name, score: p.score });
}
