import { auth } from '@/lib/auth';
import { factoryReset, getSnapshot } from '@/lib/game';
import { broadcast } from '@/lib/sse';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  await factoryReset();
  await broadcast(await getSnapshot());
  return Response.json({ ok: true });
}
