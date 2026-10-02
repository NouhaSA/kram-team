#!/bin/sh
set -e
# Backup quotidien de PostgreSQL, retention 7 jours.
# A ajouter en cron sur le serveur, ex: 0 2 * * * /opt/kram-team/scripts/backup-postgres.sh

BACKUP_DIR="/opt/kram-team/backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILE="$BACKUP_DIR/kram_team_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "==> Sauvegarde vers $FILE"
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump --clean --if-exists -U kram kram_team | gzip > "$FILE"

echo "==> Suppression des sauvegardes de plus de 7 jours"
find "$BACKUP_DIR" -name "kram_team_*.sql.gz" -mtime +7 -delete

echo "==> Sauvegarde terminee : $FILE"
