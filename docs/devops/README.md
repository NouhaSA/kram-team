# DevOps — Kram Team Fitness Management

Documentation DevOps du projet, tenue à jour à chaque sprint.
Objectif final du stage : plateforme 100 % automatisée sur serveur (CI/CD, HTTPS, backups, workers).

> **Statut** : Sprint 1 en cours (comprendre, figer, conteneuriser).
> Les étapes marquées « à valider » n'ont pas encore été testées.

---

## 1. Structure du dépôt

| Dossier | Contenu |
|---|---|
| `backend/` | API Laravel 12 (PHP 8.3), organisée en modules dans `backend/app/Modules/` |
| `frontend/` | Application React 19 + TypeScript + Vite + Tailwind |
| `ANNEX/` | Application Next.js indépendante (documents internes, PDF). **Ne fait pas partie du déploiement de la plateforme.** |
| `docs/devops/` | Cette documentation |

Modules backend : Attendance, Authentication, Booking, Core, Dashboard, GreenRewards, HealthTracking, Members, Notifications, Offers, Payments, QRSystem, Quotas, Reports, Schedule, Subscriptions, Users.

## 2. Architecture actuelle (flux local)

```
Navigateur ──> Vite (5173) ──proxy /api──> Laravel (8001) ──> PostgreSQL (5432)
                                                        └──> Redis (6379)
```

- Les routes des modules sont chargées avec le préfixe `/api/v1` (voir `ModuleServiceProvider`).
- Authentification : Laravel Sanctum, jeton **Bearer** stocké côté navigateur (`localStorage`). Pas de cookies de session pour l'API.
- Le frontend appelle l'API en chemin relatif `/api/v1` (variable `VITE_API_URL` pour le surcharger).
- Rôles : admin, réception (gestionnaire), coach, membre.
- Tâche planifiée : `kram:notifications-scheduled`, chaque jour à 08:00 (déclarée dans `backend/routes/console.php`).
- Endpoints de santé : `GET /up` (Laravel) et `GET /api/health` (JSON).

## 3. Prérequis (poste de développement Windows)

| Outil | Version | Remarque |
|---|---|---|
| PHP | 8.3 | Extensions : `pdo_pgsql`, `pgsql`, `zip`, `mbstring`, `openssl`, `fileinfo`, `curl` |
| Composer | 2.x | |
| Docker Desktop | 28.x | Utilisé pour PostgreSQL et Redis |
| Node.js | à compléter | Nécessaire pour le frontend (à valider) |
| Git | récent | |

Installation de PHP 8.3 via winget : le fichier `php.ini` n'existe pas par défaut. Copier `php.ini-development` en `php.ini` et activer les extensions ci-dessus. Vérifier avec `php -m`.

Si une ancienne version de PHP (8.1) est dans le PATH, elle passe avant : vérifier avec `where.exe php` et `php -v`.

## 4. Ports

| Service | Port | Où |
|---|---|---|
| API Laravel (`php artisan serve`) | 8001 | Hôte |
| Frontend Vite | 5173 | Hôte (à valider) |
| PostgreSQL | 5432 | Conteneur `kram-postgres` |
| Redis | 6379 | Conteneur `kram-redis` |

Le proxy de `frontend/vite.config.ts` pointe vers `127.0.0.1:8001`. Le `docker-compose.yml` actuel expose l'API sur 8000 : à harmoniser.

## 5. Variables d'environnement

Le modèle local est `backend/.env.example`. Le fichier réel `backend/.env` n'est **jamais** committé.

| Variable | Rôle | Local | Production |
|---|---|---|---|
| `APP_ENV` | Environnement | `local` | `production` |
| `APP_DEBUG` | Affiche les erreurs détaillées | `true` | **`false`** |
| `APP_KEY` | Clé de chiffrement (`php artisan key:generate`) | générée | propre à chaque serveur, secrète |
| `APP_URL` | URL de l'API | `http://localhost:8000` | URL publique en HTTPS |
| `FRONTEND_URL` | Origine autorisée par le CORS | `http://localhost:5173` | URL publique du site |
| `DB_CONNECTION` | Pilote de base | `pgsql` | `pgsql` |
| `DB_HOST` | Hôte de la base | `127.0.0.1` | nom du service (`postgres`) |
| `DB_DATABASE` / `DB_USERNAME` | Base et utilisateur | `kram_team` / `kram` | idem |
| `DB_PASSWORD` | Mot de passe de la base | `secret` | **secret, hors Git** |
| `QUEUE_CONNECTION` | File d'attente | `database` | `redis` |
| `CACHE_STORE` | Cache | `database` | `redis` |
| `SESSION_DRIVER` | Sessions | `database` | `redis` |
| `REDIS_HOST` / `REDIS_PORT` | Redis | `127.0.0.1` / `6379` | `redis` / `6379` |
| `LOG_LEVEL` | Niveau de logs | `debug` | `warning` ou `info` |

Environnements prévus : `.env.example` (local), `.env.staging.example` et `.env.production.example` (à créer, sans aucun secret).

## 6. Démarrage local du backend

Testé le jour de la rédaction.

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
docker compose up -d postgres redis
php artisan migrate
php artisan db:seed
php artisan serve --port=8001
```

Vérifications (dans un second terminal) :

```powershell
curl.exe http://127.0.0.1:8001/api/health
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8001/api/v1/auth/login -ContentType 'application/json' -Headers @{Accept='application/json'} -Body '{"email":"admin@kramteam.com","password":"password"}'
```

Résultat attendu : `{"status":"ok",...}` puis `success : True`.

Ne pas taper `Ctrl+C` dans la fenêtre du serveur tant qu'on en a besoin : cela arrête l'API.

Après un redémarrage du PC : lancer Docker Desktop, refaire `docker compose up -d postgres redis`, puis relancer `php artisan serve --port=8001`. Les données PostgreSQL sont conservées dans le volume Docker.

## 7. Démarrage local du frontend (à valider)

```powershell
cd frontend
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173` et redirige `/api` vers l'API sur le port 8001.

## 8. Comptes de démonstration (local uniquement)

Créés par `php artisan db:seed` : `admin@kramteam.com` et des comptes membres, coachs et réception de démo, tous avec le mot de passe `password`.

**Ces comptes ne doivent jamais exister en production.**

## 9. Écarts Windows (Laragon) / Docker

- `pcntl` n'existe pas sous Windows : l'option `--timeout` de `queue:work` n'est pas appliquée en local. Elle le sera dans le conteneur Linux.
- PHP local : build ZTS. L'extension `redis` (PECL) n'est pas installée en local ; on garde `database` pour le cache et les files en local.
- `artisan serve` ne gère qu'un seul processus sous Windows (avertissement sur `PHP_CLI_SERVER_WORKERS`). En production, php-fpm gère les processus.

## 10. Points de vigilance identifiés (audit du dépôt)

| Sujet | Constat | Action prévue |
|---|---|---|
| Dockerfile backend | Image de développement : `php:8.3-cli`, `COPY . .`, `composer install ... \|\| true` (les erreurs sont masquées), pas de php-fpm, pas d'opcache, exécution en root | Réécrire en image de production multi-stage (Sprint 1) |
| `docker-compose.yml` | Monte `.:/var/www` (écrase le code de l'image), lance `artisan serve`, mot de passe `secret` en clair, ports 5432 et 6379 publiés | Créer `docker-compose.prod.yml` (réseau interne, volumes, secrets) |
| Pare-feu | Les ports publiés par Docker contournent UFW | Ne publier que Nginx (80/443) en production |
| Scheduler | Commande planifiée déclarée mais aucun service ne l'exécute | Ajouter un service `scheduler` |
| Fuseau horaire | `'timezone' => 'UTC'` écrit en dur dans `config/app.php` : la tâche de 08:00 part à 09:00 à Tunis | Décider : `env('APP_TIMEZONE', 'UTC')` puis `Africa/Tunis`, ou assumer l'UTC |
| Seed | `DatabaseSeeder` crée un admin et des comptes de démo au mot de passe `password` | Séparer un seeder « bootstrap production » du seeder démo |
| Dérive d'environnement | `.env.example` (`database`) et compose (`redis`) divergent | Un modèle par environnement |
| Ports | Vite → 8001, compose → 8000 | Harmoniser |
| Frontend | `VITE_API_URL` est figée au build | Préférer un seul domaine avec Nginx qui route `/api` vers l'API |
| Tests | Uniquement `ExampleTest` dans `backend/tests/` | Ajouter des tests de fumée avant la CI |
| `ANNEX/` | Application Next.js indépendante | Filtrer par chemins dans la CI |

## 11. Avancement du Sprint 1

- [x] PHP 8.3 + Composer sur le poste
- [x] Backend local opérationnel (PostgreSQL et Redis en conteneurs, migrate, seed, login testé)
- [x] Dépôt Git privé et premier push
- [ ] Cartographie complète du repo et lancement du frontend
- [x] README DevOps (ce document, à compléter)
- [ ] `.env.staging.example` et `.env.production.example`
- [ ] Dockerfile frontend (build Node → Nginx statique)
- [ ] Dockerfile backend de production (php-fpm)
- [ ] `docker-compose.prod.yml`
- [ ] Makefile ou scripts (`up`, `down`, `logs`, `migrate`)

**Critère de fin** : `docker compose -f docker-compose.prod.yml up -d` lance l'API, le front, la base et Redis en local.

## 12. Règles à respecter

- Ne jamais committer de secrets, de dumps de base ni de `.env` réel.
- Toute automatisation doit être reproductible (scripts versionnés).
- Les migrations en production sont versionnées et journalisées.
- Chaque sprint est documenté dans `docs/devops/`.
- Livrables hebdomadaires : démo courte, Pull Request et notes de risques.
