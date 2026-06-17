import { auth } from '@/lib/auth';
import { setPointsPerCorrect, getSnapshot } from '@/lib/game';
import { broadcast } from '@/lib/sse';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const pts = body?.points;
  if (typeof pts !== 'number' || pts < 1) {
    return Response.json({ error: 'invalid_params' }, { status: 400 });
  }

  await setPointsPerCorrect(pts);
  broadcast(await getSnapshot());
  return Response.json({ ok: true });
}
