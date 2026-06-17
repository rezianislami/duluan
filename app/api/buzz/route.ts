import { buzz, getSnapshot, getPlayerByToken } from '@/lib/game';
import { broadcast } from '@/lib/sse';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const p = await getPlayerByToken(token);
  if (!p) return Response.json({ error: 'invalid_token' }, { status: 401 });

  const accepted = await buzz(p.id);
  if (accepted) await broadcast(await getSnapshot());

  return Response.json({ accepted });
}
