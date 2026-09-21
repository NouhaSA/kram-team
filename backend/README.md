# Kram Team — Backend API

Laravel 12 REST API pour la plateforme **Kram Team Fitness Management**.

## Stack

- PHP 8.3+ / Laravel 12
- PostgreSQL 16
- Redis 7
- Laravel Sanctum (API tokens)
- Architecture modulaire par domaine métier

## Démarrage rapide (local)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# SQLite (dev rapide)
# DB_CONNECTION=sqlite dans .env
touch database/database.sqlite

php artisan migrate --seed
php artisan serve
```

API disponible sur `http://localhost:8000`.

## Docker

```bash
cd backend
docker compose up -d
```

Services : `app` (8000), `postgres` (5432), `redis` (6379), `queue`.

## Architecture modules

```
app/Modules/
├── Authentication/   # Login, register, Sanctum
├── Users/            # User, Role, Permission (RBAC)
├── Members/          # Fiches adhérents + QR UUID
├── Core/             # Enums, traits, middleware, ApiController
└── [à venir]
    ├── Offers/
    ├── Subscriptions/
    ├── Quotas/
    ├── Attendance/
    ├── QR System/
    ├── Booking/
    ├── Payments/
    ├── Programs/
    └── GreenRewards/
```

Chaque module contient : `Models`, `Services`, `Http/Controllers`, `Http/Requests`, `Http/Resources`, `Policies`, `routes/api.php`, `Database/Migrations`.

## Comptes démo

Mot de passe pour tous : `password`

| Rôle | Email |
|------|-------|
| Administrateur | `admin@kramteam.com` |
| Réception / gestion | `reception@kramteam.com` |
| Coach | `coach@kramteam.com` |
| Coach 2 | `coach2@kramteam.com` |
| Adhérent | `member@kramteam.com` |
| Adhérent 2–5 | `member2@kramteam.com` … `member5@kramteam.com` |

```bash
php artisan db:seed --class=DemoDataSeeder
# ou tout ressemer :
php artisan migrate:fresh --seed
```

## Endpoints API (v1)

### Auth — `/api/v1/auth`

| Méthode | Route | Auth |
|---------|-------|------|
| POST | `/register` | Non |
| POST | `/login` | Non |
| POST | `/logout` | Oui |
| GET | `/me` | Oui |

### Members — `/api/v1/members`

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/` | admin, reception, coach |
| POST | `/` | admin, reception |
| GET | `/{id}` | admin, reception, coach |
| PUT/PATCH | `/{id}` | admin, reception, coach |

### Offers — `/api/v1/offers`

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/` | tous (auth) |
| POST | `/` | admin |
| GET | `/{id}` | tous (auth) |
| PUT/PATCH | `/{id}` | admin |

### Subscriptions — `/api/v1/subscriptions`

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/` | admin, reception |
| POST | `/` | admin, reception |
| GET | `/{id}` | admin, reception |
| POST | `/{id}/suspend` | admin, reception |
| POST | `/{id}/activate` | admin, reception |
| POST | `/{id}/cancel` | admin, reception |
| POST | `/{id}/renew` | admin, reception |

### Quotas — `/api/v1`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/members/{id}/quotas` | Quotas actifs d'un adhérent |
| GET | `/subscriptions/{id}/quotas` | Détail quotas abonnement |
| GET | `/subscription-quotas/{id}/history` | Historique consommation |
| POST | `/subscription-quotas/{id}/consume` | Déduire quota (admin/reception/coach) |

### QR Check-in — `/api/v1`

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/qr/verify` | Pré-vérification accès (sans enregistrer) |
| POST | `/qr/check-in` | Scan entrée + déduction séance |
| POST | `/qr/check-out` | Scan sortie + déduction heures |
| GET | `/attendances` | Historique présences |

### Schedule — `/api/v1`

| Méthode | Route | Accès / description |
|---------|-------|---------------------|
| GET | `/public/courses` | Public |
| GET | `/public/schedule-slots` | Public (14 jours, places restantes) |
| GET | `/courses` | Auth — liste des cours |
| POST | `/courses` | admin / reception / coach |
| GET | `/rooms` | Auth — salles (capacité max) |
| POST | `/rooms` | admin / reception / coach |
| GET | `/schedule-slots` | Auth — planning / créneaux |
| POST | `/schedule-slots` | Créer un créneau (capacity) |
| PUT | `/schedule-slots/{id}` | Modifier (capacité ≥ places réservées) |
| POST | `/schedule-slots/{id}/cancel` | Annuler un créneau |

### Bookings — `/api/v1`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/bookings` | Liste réservations |
| POST | `/bookings` | Réserver (confirmé ou waitlist si plein) |
| GET | `/bookings/{id}` | Détail + QR réservation |
| POST | `/bookings/{id}/cancel` | Annuler + promotion waitlist |

### Payments — `/api/v1`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/payments` | Liste paiements |
| POST | `/payments` | Enregistrer un paiement |
| GET | `/payments/{id}` | Détail |
| POST | `/payments/{id}/complete` | Valider un paiement pending |
| POST | `/payments/{id}/cancel` | Annuler |
| POST | `/payments/{id}/refund` | Remboursement total/partiel |
| GET | `/members/{id}/payments-summary` | Totaux adhérent |

### Green Rewards — `/api/v1`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/member/green-profile` | Profil Green Score / niveau / badges |
| GET | `/member/eco-history` | Historique actions |
| POST | `/member/eco-action` | Soumettre une action éco |
| GET | `/green/rules` | Règles de points |
| GET | `/green/challenges` | Challenges actifs |
| POST | `/challenge/{id}/join` | Rejoindre un challenge |
| GET | `/green/rewards` | Catalogue récompenses |
| POST | `/reward/{id}/redeem` | Échanger des points |
| GET | `/green/leaderboard` | Classement global/mensuel |
| GET | `/admin/eco-actions/pending` | Actions à valider |
| POST | `/admin/eco-actions/{id}/validate` | Approuver / rejeter |

### Dashboards — `/api/v1`

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/dashboard/admin` | admin |
| GET | `/dashboard/reception` | admin, reception |
| GET | `/dashboard/coach` | admin, coach |
| GET | `/dashboard/member` | admin, member |
| GET | `/dashboard/members/{id}` | admin, reception |

### Notifications — `/api/v1`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/notifications` | Liste in-app (+ unread_count) |
| GET | `/notifications/unread-count` | Badge compteur |
| POST | `/notifications/{id}/read` | Marquer lue |
| POST | `/notifications/read-all` | Tout marquer lu |

Déclenchées auto : booking, abonnement, paiement, action Green validée (database + mail).

### Reports — `/api/v1`

| Méthode | Route | Rôles |
|---------|-------|-------|
| GET | `/reports/coaches?period=day\|week\|month&date=&coach_id=` | admin, reception, coach |

KPIs : séances, heures, personnes entraînées (uniques), réservations, détail créneaux.

### Health Tracking — `/api/v1`

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health/me` | Parcours santé de l’adhérent connecté |
| GET | `/health/members/{id}` | Vue coach / réception / admin |
| PUT | `/health/members/{id}/profile` | Taille, objectif, poids cible, activité |
| POST | `/health/members/{id}/entries` | Saisie poids (+ options) |

Calculs : IMC, poids idéal, % avancement, BMR/TDEE, calories & protéines recommandées.

Header : `Authorization: Bearer {token}`

## Rôles RBAC

- `admin` — accès complet
- `reception` — gestion adhérents, check-in
- `coach` — consultation membres, cours
- `member` — espace adhérent

## Prochaines étapes

1. Frontend React (dashboards + site vitrine) ✅ scaffold
2. Pages métier (membres, offres, QR scan, bookings)
3. Site vitrine premium
4. QR événements Green + IA Green Coach
