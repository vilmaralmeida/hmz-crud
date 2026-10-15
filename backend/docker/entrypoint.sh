#!/bin/sh
set -e

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi

attempt=0
max_attempts=30
until ./node_modules/.bin/prisma db migrate; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Migrations failed after ${max_attempts} attempts" >&2
    exit 1
  fi
  echo "Database not ready (attempt ${attempt}/${max_attempts}), retrying in 2s…" >&2
  sleep 2
done

echo "Migrations applied. Starting API…"
exec node dist/server.mjs