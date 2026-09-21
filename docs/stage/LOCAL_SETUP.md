# Environnement local — Kram Team

Documente l'environnement local reproductible.
Mission 3 de la Phase 1 (« Environnement local »).

## 1. Prérequis

| Outil | Version testée | Remarque |
|---|---|---|
| PHP | 8.3 | Extensions : `pdo_pgsql`, `pgsql`, `zip`, `mbstring`, `openssl`, `fileinfo`, `curl` |
| Composer | 2.9 | |
| Node.js | 24.19 (LTS) | Le projet exige Node 20.19+ ou 22.12+ (Vite 8) |
| npm | 11 | |
| Docker Desktop | 28.5 | Utilisé pour PostgreSQL et Redis |
| Git | récent | |

## 2. Ports

| Service | Port | Où |
|---|---|---|
| API Laravel (`php artisan serve`) | 8001 | Hôte |
| Frontend Vite | 5173 | Hôte |
| PostgreSQL | 5432 | Conteneur `kram-postgres` |
| Redis | 6379 | Conteneur `kram-redis` |

## 3. Étapes de démarrage (testées et validées)

### 3.1 Backend

```powershell
cd backend
composer install
copy .env.example .env
php artisan key:generate
```

### 3.2 Base de données et cache (Docker)

```powershell
docker compose up -d postgres redis
docker compose ps
```

Vérifier que `kram-postgres` et `kram-redis` sont à l'état `Up`.

### 3.3 Migrations et données de démonstration

```powershell
php artisan migrate
php artisan db:seed
```

Le seed crée des comptes de démonstration (voir § 5). **Ne jamais lancer ce seed en production.**

### 3.4 Lancer l'API

```powershell
php artisan serve --port=8001
```

Garder cette fenêtre ouverte. Vérification dans une autre fenêtre :

```powershell
curl.exe http://127.0.0.1:8001/api/health
```

Résultat attendu : `{"status":"ok","app":"Kram Team","version":"1.0.0"}`.

### 3.5 Frontend

Dans une autre fenêtre :

```powershell
cd frontend
npm ci
npm run dev
```

Résultat attendu : `Local: http://localhost:5173/`.

### 3.6 Validation du login démo

1. Ouvrir `http://localhost:5173`.
2. Se connecter avec `admin@kramteam.com` / `password`.
3. Le tableau de bord d'administration s'affiche (membres actifs, abonnements, revenu du mois, présences).

**Validé le jour de la rédaction : login réussi, tableau de bord affiché.**

## 4. Utilisation progressive de Docker

État actuel : seuls PostgreSQL et Redis tournent en conteneurs. L'API (`artisan serve`) et le frontend (`npm run dev`) tournent directement sur la machine.

Étape suivante (hors Phase 1, prévue dans le cahier de stage) : conteneuriser aussi le backend (image php-fpm) et le frontend (build Node servi par Nginx), pour arriver à un `docker compose up -d` qui démarre toute la stack.

## 5. Comptes de démonstration (local uniquement)

Mot de passe pour tous : `password`.

| Rôle | Email |
|---|---|
| Admin | `admin@kramteam.com` |
| Réception | `reception@kramteam.com` |
| Coach | `coach@kramteam.com` |
| Membre | `member@kramteam.com` |

## 6. Écarts Laragon vs Docker

| Sujet | Constat |
|---|---|
| `pcntl` | Absent sous Windows : le `--timeout` de `queue:work` ne s'applique pas en local, seulement dans un conteneur Linux. |
| Extension `redis` (PECL) | Non installée en local : le cache/queue/session local utilisent `database`, alors que le `docker-compose.yml` du projet force `redis`. |
| `php.ini` | Absent par défaut avec l'installation PHP via winget : à créer depuis `php.ini-development` et à configurer. |
| Node | La version initialement installée (14.15.0, via un ancien outil du poste) était incompatible avec Vite 8 (exige 20.19+ ou 22.12+) : mise à jour vers la version LTS. |
| `artisan serve` | Ne gère qu'un seul processus sous Windows, malgré `PHP_CLI_SERVER_WORKERS=4` dans `.env.example` (avertissement affiché au démarrage). php-fpm gérera plusieurs processus en production. |
| Ports | Le proxy Vite (`frontend/vite.config.ts`) pointe vers le port 8001, alors que `backend/docker-compose.yml` expose l'API sur le port 8000. À harmoniser lors de la conteneurisation du backend. |

## 7. Choix retenus

- PostgreSQL et Redis sont lancés uniquement via Docker, jamais installés directement sur la machine : cohérent avec la cible de production et évite les conflits de version.
- Le cache, la session et la queue restent en `database` en local (pas de client Redis PHP installé), pour rester au plus proche de `.env.example`. La bascule vers `redis` se fera avec la conteneurisation complète du backend.
- Le seed de démonstration (`db:seed`) est réservé au développement local ; un seeder de production distinct (rôles, offres, sans comptes de démo) est identifié comme travail à faire (cahier de stage, Sprint 1/2).
