#!/bin/sh
# ------------------------------------------------------------------
# Einfaches Backup: PostgreSQL-Dump + Uploads-Archiv.
# Ausführen auf dem VPS (im Projektverzeichnis):
#   ./scripts/backup.sh
# Per Cron z. B. täglich um 3 Uhr:
#   0 3 * * * cd /opt/schulcockpit && ./scripts/backup.sh >> backups/backup.log 2>&1
# ------------------------------------------------------------------
set -e

# .env laden (für POSTGRES_*)
if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

STAMP=$(date +%Y%m%d_%H%M%S)
ZIEL="backups"
mkdir -p "$ZIEL"

DB_USER="${POSTGRES_USER:-cockpit}"
DB_NAME="${POSTGRES_DB:-schulcockpit}"

echo "▶ Sichere Datenbank ($DB_NAME)…"
docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$ZIEL/db_$STAMP.sql.gz"

echo "▶ Sichere Uploads…"
docker compose run --rm -T -v "$(pwd)/$ZIEL:/backup" web \
  tar czf "/backup/uploads_$STAMP.tar.gz" -C /app uploads 2>/dev/null \
  || tar czf "$ZIEL/uploads_$STAMP.tar.gz" uploads

# Alte Backups aufräumen (älter als 14 Tage)
find "$ZIEL" -name 'db_*.sql.gz' -mtime +14 -delete 2>/dev/null || true
find "$ZIEL" -name 'uploads_*.tar.gz' -mtime +14 -delete 2>/dev/null || true

echo "✅ Backup fertig: $ZIEL/db_$STAMP.sql.gz + uploads_$STAMP.tar.gz"
