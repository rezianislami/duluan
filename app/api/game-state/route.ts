import { getSnapshot } from '@/lib/game';

export const dynamic = 'force-dynamic';

export async function GET() {
  const snapshot = await getSnapshot();
  return Response.json(snapshot);
}
