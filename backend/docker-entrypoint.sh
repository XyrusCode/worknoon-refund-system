#!/bin/sh
set -e

echo "🚀 [Backend] Starting WORKNOON Refund System API..."

# Wait for database connection
echo "⏳ [Backend] Checking database connection..."
until npx prisma db push --skip-generate; do
  echo "⏳ [Backend] Waiting for PostgreSQL database to be reachable..."
  sleep 2
done

echo "🌱 [Backend] Seeding initial customer & order data..."
npx tsx prisma/seed.ts || echo "ℹ️ [Backend] Seed already applied or completed."

echo "✨ [Backend] Launching NestJS API server on port ${PORT:-3001}..."
exec node dist/src/main.js
