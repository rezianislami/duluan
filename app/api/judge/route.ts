import { auth } from '@/lib/auth';
import { judgeCorrect, judgeWrong, getSnapshot } from '@/lib/game';
import { broadcast } from '@/lib/sse';

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const verdict = body?.verdict;
  if (verdict !== 'correct' && verdict !== 'wrong') {
    return Response.json({ error: 'invalid_verdict' }, { status: 400 });
  }

  if (verdict === 'correct') {
    await judgeCorrect();
  } else {
    await judgeWrong();
  }

  await broadcast(await getSnapshot());
  return Response.json({ ok: true });
}
