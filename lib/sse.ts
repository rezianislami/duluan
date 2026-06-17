/**
 * In-memory SSE broadcast store.
 * Works for single-process (dev + single-instance prod).
 * Swap to Redis pub/sub for multi-instance deployments.
 */

type Controller = ReadableStreamDefaultController<string>;

export const sseClients = new Set<Controller>();

export function broadcast(payload: object) {
  const data = `data: ${JSON.stringify(payload)}\n\n`;
  for (const ctrl of sseClients) {
    try {
      ctrl.enqueue(data);
    } catch {
      // Client disconnected — clean up
      sseClients.delete(ctrl);
    }
  }
}
