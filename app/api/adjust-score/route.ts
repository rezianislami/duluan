import { auth } from '@/lib/auth';
import { adjustScore, getSnapshot } from '@/lib/game';
import { broadcast } from '@/lib/sse';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { playerId, delta } = body ?? {};
  if (typeof playerId !== 'string' || typeof delta !== 'number') {
    return Response.json({ error: 'invalid_params' }, { status: 400 });
  }

  await adjustScore(playerId, delta);
  await broadcast(await getSnapshot());
  return Response.json({ ok: true });
}
