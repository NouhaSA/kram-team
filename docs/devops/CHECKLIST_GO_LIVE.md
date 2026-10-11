# Checklist go-live — Kram Team

A valider avant la mise en production reelle, avec le tuteur.

## Infrastructure

- [ ] VPS provisionne (playbook Ansible execute avec succes)
- [ ] Pare-feu UFW actif (22, 80, 443 uniquement)
- [ ] Docker Engine + Compose installes et fonctionnels
- [ ] Domaines DNS pointes vers l'IP du VPS (app. et api.)

## Securite

- [ ] Connexion SSH par cle uniquement (mot de passe desactive)
- [ ] Connexion root SSH desactivee
- [ ] Secrets en production generes (APP_KEY, mots de passe DB/Redis) et
      differents des valeurs de developpement
- [ ] Aucun secret commite dans Git

## Application

- [ ] docker-compose.prod.yml demarre les 7 services sans erreur
- [ ] Certificats Let's Encrypt obtenus et valides
- [ ] /api/health repond 200 en HTTPS
- [ ] Page d'accueil accessible en HTTPS
- [ ] Login demo fonctionnel sur le serveur
- [ ] Migrations executees (`scripts/deploy-migrate.sh`)
- [ ] Seed de production execute (pas DemoDataSeeder)

## CI/CD

- [ ] CI GitHub Actions verte sur develop et main
- [ ] Secrets GitHub configures (DEPLOY_HOST, DEPLOY_USER, DEPLOY_SSH_KEY)
- [ ] Un merge sur main declenche le deploiement automatique (teste)
- [ ] Rollback teste au moins une fois (scripts/rollback.sh)

## Fiabilite

- [ ] Backup automatique en cron, teste manuellement
- [ ] Restore teste au moins une fois
- [ ] Limites CPU/RAM en place sur tous les services
- [ ] Rotation des logs Docker configuree
- [ ] Monitoring actif avec alerte fonctionnelle

## Documentation

- [ ] RUNBOOK.md a jour et relu
- [ ] README DevOps a jour

## Revue finale

- [ ] Revue effectuee avec le tuteur
- [ ] Date de mise en production validee

## Etat actuel

La plupart des points "Infrastructure", "CI/CD" (deploiement reel) et
"Fiabilite" (execution reelle) restent a faire : ils dependent du VPS,
pas encore disponible. Le reste (code, scripts, documentation) est pret.
