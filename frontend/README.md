# Kram Team Frontend

React 19 + Vite + TypeScript + TailwindCSS 4

## Démarrer

```bash
# Terminal 1 — API
cd backend
php artisan serve --host=127.0.0.1 --port=8001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

Login seed : `admin@kramteam.com` / `password`

Autres comptes (mdp `password`) : `reception@kramteam.com`, `coach@kramteam.com`, `member@kramteam.com` (+ member2…5, coach2).

## Stack

- React Router
- TanStack Query
- Framer Motion
- Lucide Icons
- Charte Kram Team (noir / rouge / Bebas Neue + Montserrat)

## Pages

| Route | Rôle |
|-------|------|
| `/` | Site vitrine public |
| `/planning` | Planning public (14 jours) |
| `/login` | Public |
| `/app/admin` | admin |
| `/app/reception` | admin, reception |
| `/app/coach` | admin, coach |
| `/app/member` | admin, member |
| `/app/members` | admin, reception, coach |
| `/app/offers` | tous |
| `/app/bookings` | tous |
| `/app/schedule` | admin, reception, coach |
| `/app/coach-reports` | admin, reception, coach — jour / semaine / mois |
| `/app/health` | tous (auth) — parcours poids / taille / IMC |
| `/app/green` | tous (auth) |
| `/app/payments` | admin, reception |
| `/app/subscriptions` | admin, reception |
| `/app/notifications` | tous (auth) |
| `/app/qr` | admin, reception, coach — caméra + saisie manuelle |

Le proxy Vite envoie `/api/*` vers `http://127.0.0.1:8001`.
