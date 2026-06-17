#!/bin/sh
set -e

# Wait for Postgres to accept connections before running migrations.
# Useful when starting the container outside Docker Compose (where
# depends_on: condition: service_healthy handles this automatically).
echo "[duluan] Checking database connectivity..."
n=0
until node -e "
  const { Pool } = require('pg');
  const p = new Pool({ connectionString: process.env.DATABASE_URL });
  p.query('SELECT 1').then(() => { p.end(); process.exit(0); }).catch(() => { p.end(); process.exit(1); });
" 2>/dev/null; do
  n=$((n+1))
  if [ "$n" -ge 10 ]; then
    echo "[duluan] ERROR: Cannot reach database after 30s. Check DATABASE_URL."
    exit 1
  fi
  echo "[duluan] Database not ready, retrying in 3s... ($n/10)"
  sleep 3
done

echo "[duluan] Applying DB schema..."
./node_modules/.bin/drizzle-kit push

echo "[duluan] Seeding GM account..."
# In production, env vars are injected by the container runtime — no dotenv needed.
./node_modules/.bin/tsx scripts/seed.ts

echo "[duluan] Starting Next.js server..."
exec ./node_modules/.bin/next start -p "${PORT:-3000}" -H "${HOSTNAME:-0.0.0.0}"
