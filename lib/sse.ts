/**
 * Real-time broadcast via Supabase Realtime HTTP API.
 * Works on Vercel serverless — no persistent WebSocket connection needed server-side.
 * Clients subscribe to the 'game-state' channel; server POSTs updates via REST.
 */

const CHANNEL = 'game-state';

export async function broadcast(payload: object): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Silently skip if Supabase is not configured (e.g. running tests locally without .env)
  if (!url || !key) return;

  await fetch(`${url}/realtime/v1/api/broadcast`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      messages: [{ topic: `realtime:${CHANNEL}`, event: 'update', payload }],
    }),
  });
}
