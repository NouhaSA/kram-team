#!/bin/sh
set -e
# Restaure une sauvegarde PostgreSQL.
# Usage : ./scripts/restore-postgres.sh backups/kram_team_20260101_020000.sql.gz
# ATTENTION : ecrase la base actuelle.

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore-postgres.sh <fichier.sql.gz>"
  exit 1
fi

echo "==> Restauration depuis $1"
gunzip -c "$1" | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U kram -d kram_team

echo "==> Restauration terminee."
