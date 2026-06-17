import { joinGame, getSnapshot } from '@/lib/game';
import { broadcast } from '@/lib/sse';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';

  if (!name || name.length > 15) {
    return Response.json({ error: 'invalid_name' }, { status: 400 });
  }

  const result = await joinGame(name);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 409 });
  }

  broadcast(await getSnapshot());
  return Response.json({
    playerId: result.playerId,
    playerName: result.playerName,
    sessionToken: result.sessionToken,
  });
}
