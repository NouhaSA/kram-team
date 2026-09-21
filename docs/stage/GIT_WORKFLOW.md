# Git Workflow — Kram Team

Documente la convention Git du projet et la procédure de démarrage.
Mission 2 de la Phase 1 (« Git / GitHub »).

## 1. Structure du dépôt

| Dossier | Contenu |
|---|---|
| `backend/` | API Laravel 12, organisée en modules (`backend/app/Modules/`) |
| `frontend/` | Application React 19 + TypeScript + Vite |
| `ANNEX/` | Application Next.js indépendante (documents internes). Ne fait pas partie du déploiement de la plateforme. |
| `docs/devops/` | Documentation DevOps (cahier de stage) |
| `docs/stage/` | Documentation de la mission Phase 1 |

## 2. Branches

| Branche | Rôle |
|---|---|
| `main` | Code stable. On n'y committe jamais directement. |
| `develop` | Intégration des fonctionnalités en cours. Cible des Pull Requests de la Phase 1. |
| `feature/devops-phase1-<prenom>` | Branche de travail individuelle pour la Phase 1. |
| `feature/devops-sprint<n>` | Branche de travail pour chaque sprint du cahier de stage. |

Convention de nommage : `feature/<sujet>`, en minuscules, mots séparés par des tirets.

## 3. Vérifications de sécurité

- `.gitignore` (racine et `backend/`) exclut `.env`, `vendor/`, `node_modules/`, les logs et le cache Laravel.
- `backend/.env.example` est le seul fichier d'environnement suivi par Git : il ne contient aucun secret réel.
- Avant tout `git push`, vérifier qu'aucun `.env` réel n'est ajouté :
  ```powershell
  git status --ignored
  ```
  `backend/.env` doit apparaître dans la section « Ignored files », jamais dans les fichiers ajoutés.

## 4. Cycle de travail

1. Se mettre à jour depuis `develop` :
   ```powershell
   git switch develop
   git pull
   ```
2. Créer sa branche de travail :
   ```powershell
   git switch -c feature/devops-phase1-<prenom>
   ```
3. Travailler, committer régulièrement avec des messages clairs (préfixes `docs:`, `chore:`, `feat:`, `fix:`).
4. Envoyer la branche :
   ```powershell
   git push -u origin feature/devops-phase1-<prenom>
   ```
5. Ouvrir une Pull Request sur GitHub, **base : `develop`**, **compare : sa branche**.
6. Attendre la relecture du tuteur avant de fusionner.

## 5. Procédure de démarrage (clone → install → migrate → serve)

### Prérequis
- PHP 8.3 (extensions : `pdo_pgsql`, `pgsql`, `zip`, `mbstring`, `openssl`, `fileinfo`, `curl`)
- Composer 2
- Node.js 20.19+ (ou 22.12+) et npm
- Docker Desktop
- Git

### Backend

```powershell
git clone https://github.com/NouhaSA/kram-team.git
cd kram-team/backend
composer install
copy .env.example .env
php artisan key:generate
docker compose up -d postgres redis
php artisan migrate
php artisan db:seed
php artisan serve --port=8001
```

Vérification :
```powershell
curl.exe http://127.0.0.1:8001/api/health
```

### Frontend

```powershell
cd kram-team/frontend
npm ci
npm run dev
```

Site disponible sur `http://localhost:5173`.

### Comptes de démonstration (local uniquement)

Mot de passe pour tous : `password`.

| Rôle | Email |
|---|---|
| Admin | `admin@kramteam.com` |
| Réception | `reception@kramteam.com` |
| Coach | `coach@kramteam.com` |
| Membre | `member@kramteam.com` |

## 6. Écarts constatés (Windows / Laragon vs Docker)

- `pcntl` n'existe pas sous Windows : le `--timeout` de `queue:work` ne s'applique pas en local.
- PHP local (winget) sans `php.ini` par défaut : il faut le créer depuis `php.ini-development` et activer les extensions listées ci-dessus.
- Si plusieurs versions de PHP ou de Node sont installées, vérifier laquelle est active avec `where.exe php` / `where.exe node`, la plus récente doit passer en premier dans le PATH.
- `artisan serve` ne gère qu'un seul processus sous Windows, contrairement à php-fpm en production.

## 7. Règles

- Ne jamais committer de secrets, dumps de base ou fichier `.env` réel.
- Une PR par mission ou par sprint, avec une description qui résume le travail fait.
- Toute Pull Request cible `develop`, jamais `main` directement.
