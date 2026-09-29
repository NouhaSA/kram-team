#!/bin/sh
set -e
# Rollback : redeploie l'image precedente (tag ou SHA donne en argument)
# Usage : ./scripts/rollback.sh <tag_ou_sha_precedent>

if [ -z "$1" ]; then
  echo "Usage: ./scripts/rollback.sh <tag_ou_sha_precedent>"
  exit 1
fi

echo "==> Rollback vers $1"
git fetch --tags
git checkout "$1"
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --wait
echo "==> Rollback termine. Verifier /api/health."
