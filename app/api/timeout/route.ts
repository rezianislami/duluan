import { auth } from '@/lib/auth';
import { timeoutBuzzer, getSnapshot } from '@/lib/game';
import { broadcast } from '@/lib/sse';

// Fired by the GM client when the answer countdown reaches zero. GM-authenticated
// so players can't force a timeout. timeoutBuzzer() is conditional on buzzerId, so a
// stale/duplicate call simply no-ops.
export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const buzzerId = body?.buzzerId;
  if (typeof buzzerId !== 'string') {
    return Response.json({ error: 'invalid_params' }, { status: 400 });
  }

  const resolved = await timeoutBuzzer(buzzerId);
  if (resolved) await broadcast(await getSnapshot());
  return Response.json({ ok: true, resolved });
}
