# Runbook - Kram Team

Guide d exploitation du serveur de production.

## Deploiement

- Automatique : un merge/tag sur main declenche .github/workflows/deploy.yml
- Manuel : ./scripts/deploy-migrate.sh (migrations + storage:link)

## Rollback

  ./scripts/rollback.sh <tag_ou_sha_precedent>

## Backup

- Quotidien automatique (cron, 02h00) : scripts/backup-postgres.sh
- Retention : 7 jours, dossier backups/

## Restore

  ./scripts/restore-postgres.sh backups/<fichier>.sql.gz

A tester au moins une fois avant mise en production reelle.

## Rotation des secrets

1. Regenerer le secret (mot de passe DB, APP_KEY, cle SSH deploy).
2. Mettre a jour le .env sur le serveur (jamais dans Git).
3. docker compose -f docker-compose.prod.yml up -d --force-recreate

## Scale workers

  docker compose -f docker-compose.prod.yml up -d --scale queue=3

## Incident : le site ne repond plus

1. docker compose -f docker-compose.prod.yml ps
2. docker compose -f docker-compose.prod.yml logs <service> --tail=100
3. curl https://api.__DOMAIN__/api/health
4. docker compose -f docker-compose.prod.yml restart <service>

## Etat de validation

Deploiement automatique, rollback et backup ecrits mais non executes :
necessitent le VPS et les secrets GitHub (DEPLOY_HOST, DEPLOY_USER,
DEPLOY_SSH_KEY) non encore configures. A valider lors du premier
deploiement reel.
