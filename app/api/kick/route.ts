import { auth } from '@/lib/auth';
import { kickPlayer, getSnapshot } from '@/lib/game';
import { broadcast } from '@/lib/sse';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { playerId } = body ?? {};
  if (typeof playerId !== 'string') {
    return Response.json({ error: 'invalid_params' }, { status: 400 });
  }

  await kickPlayer(playerId);
  await broadcast(await getSnapshot());
  return Response.json({ ok: true });
}
