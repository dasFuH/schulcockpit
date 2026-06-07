#!/bin/sh
# ------------------------------------------------------------------
# Startet die App im Container:
# 1) wartet kurz, wendet ausstehende DB-Migrationen an
# 2) startet den Next.js-Standalone-Server
# ------------------------------------------------------------------
set -e

echo "▶ Wende Datenbank-Migrationen an (prisma migrate deploy)…"
npx prisma migrate deploy

# Optionales Seeding nur, wenn SEED_ON_START=true gesetzt ist.
if [ "$SEED_ON_START" = "true" ]; then
  echo "▶ Führe Seed aus…"
  node prisma/seed.js 2>/dev/null || npx tsx prisma/seed.ts || echo "Seed übersprungen."
fi

echo "▶ Starte Schul-Cockpit auf Port ${PORT:-3000}…"
exec node server.js
