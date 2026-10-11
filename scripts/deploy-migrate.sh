#!/bin/sh
set -e

# Script de deploiement : migrations + seed initial controle + storage:link
# A executer sur le serveur de production, depuis la racine du projet.
#
# Usage :
#   ./scripts/deploy-migrate.sh          -> migrate --force uniquement
#   ./scripts/deploy-migrate.sh --seed   -> migrate --force + seed (premiere fois seulement)

echo "==> Lancement des migrations (production)"
docker compose -f docker-compose.prod.yml exec -T backend php artisan migrate --force

echo "==> Lien de stockage public"
docker compose -f docker-compose.prod.yml exec -T backend php artisan storage:link

if [ "$1" = "--seed" ]; then
  echo "==> Seed initial (bootstrap production : roles, permissions, offres)"
  echo "    ATTENTION : ne pas utiliser DemoDataSeeder en production."
  docker compose -f docker-compose.prod.yml exec -T -e ADMIN_EMAIL="$ADMIN_EMAIL" -e ADMIN_PASSWORD="$ADMIN_PASSWORD" backend php artisan db:seed --class=ProductionSeeder --force
fi

echo "==> Redemarrage de Nginx (le backend a une nouvelle adresse apres up -d)"
docker compose -f docker-compose.prod.yml restart nginx
echo "==> Termine."
