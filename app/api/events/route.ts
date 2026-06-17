import { sseClients } from '@/lib/sse';
import { getSnapshot } from '@/lib/game';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  let ctrl: ReadableStreamDefaultController<string>;

  const stream = new ReadableStream<string>({
    async start(c) {
      ctrl = c;
      sseClients.add(ctrl);

      // Send current state immediately so client doesn't wait for next mutation
      const snapshot = await getSnapshot();
      ctrl.enqueue(`data: ${JSON.stringify(snapshot)}\n\n`);
    },
    cancel() {
      sseClients.delete(ctrl);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  });
}
