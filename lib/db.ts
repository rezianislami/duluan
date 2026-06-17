import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const isSupabase = process.env.DATABASE_URL?.includes('supabase');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requires SSL — rejectUnauthorized: false because Vercel may not
  // have the intermediate CA bundle needed to verify Supabase's cert chain.
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 10_000, // fail fast instead of hanging forever
  max: 3,                          // small pool — serverless spins many instances
});

export const db = drizzle(pool, { schema });
