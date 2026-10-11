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

## Secrets et configuration
- Creer un fichier .env a la racine (non versionne) a partir de .env.compose.example.
- DB_PASSWORD doit etre une valeur forte (ex : openssl rand -base64 24). Le compose refuse de demarrer si elle manque.
- PostgreSQL n'applique le mot de passe qu'a la creation du volume. Pour le changer ensuite :
  ALTER USER kram PASSWORD '...'; puis mettre a jour .env et relancer up -d.
- Fuseau horaire : APP_TIMEZONE=Africa/Tunis (compose). Verifier avec php artisan about --only=environment.

## Environnements et deploiement
- Staging : automatique a chaque push sur main. Production : uniquement sur un tag vX.Y.Z.
- Creer les environnements GitHub staging et production, chacun avec ses secrets DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY.
- Activer le deploiement avec la variable de depot DEPLOY_ENABLED=true. Sans elle, les jobs sont ignores (pas d'echec).
- Approbation manuelle de la production : Settings > Environments > production > Required reviewers (selon l'offre GitHub).

## Nginx apres un redemarrage du backend
- Nginx memorise l'adresse du backend au demarrage. Si le backend est recree, Nginx renvoie 502.
- deploy-migrate.sh et rollback.sh redemarrent Nginx. En manuel : docker compose -f docker-compose.prod.yml restart nginx.

## Test de restauration (base isolee)
- Sauvegarde locale : BACKUP_DIR=./backups bash scripts/backup-postgres.sh.
- Creer une base vide kram_restore_test, puis : DB_NAME=kram_restore_test bash scripts/restore-postgres.sh <fichier>.
- Comparer SELECT count(*) FROM users; dans les deux bases, puis supprimer la base de test.

## Seed de production
- Ne jamais lancer DemoDataSeeder en production (comptes de demo, mot de passe connu, et Faker absent de l'image).
- Premier amorcage : ADMIN_EMAIL=... ADMIN_PASSWORD=... ./scripts/deploy-migrate.sh --seed
  (mot de passe de 12 caracteres minimum, jamais ecrit dans un fichier).
- Le seed de demonstration reste reserve au poste local : php artisan db:seed avec les dependances de dev.
