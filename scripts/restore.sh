#!/bin/sh
# ------------------------------------------------------------------
# Stellt ein Datenbank-Backup wieder her.
# Verwendung:
#   ./scripts/restore.sh backups/db_20260101_030000.sql.gz
# ------------------------------------------------------------------
set -e

if [ -z "$1" ]; then
  echo "Bitte Backup-Datei angeben, z. B.: ./scripts/restore.sh backups/db_XXXX.sql.gz"
  exit 1
fi

if [ -f .env ]; then
  set -a
  . ./.env
  set +a
fi

DB_USER="${POSTGRES_USER:-cockpit}"
DB_NAME="${POSTGRES_DB:-schulcockpit}"

echo "⚠ Achtung: überschreibt die aktuelle Datenbank '$DB_NAME'."
echo "▶ Spiele $1 ein…"
gunzip -c "$1" | docker compose exec -T db psql -U "$DB_USER" -d "$DB_NAME"

echo "✅ Wiederherstellung abgeschlossen."
