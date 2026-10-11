#!/bin/sh
set -e
DB_NAME="${DB_NAME:-kram_team}"
# Restaure une sauvegarde PostgreSQL.
# Usage : ./scripts/restore-postgres.sh backups/kram_team_20260101_020000.sql.gz
# ATTENTION : ecrase la base actuelle.

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore-postgres.sh <fichier.sql.gz>"
  exit 1
fi

echo "==> Restauration depuis $1"
gunzip -c "$1" | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -v ON_ERROR_STOP=1 -U kram -d "$DB_NAME"

echo "==> Restauration terminee."
