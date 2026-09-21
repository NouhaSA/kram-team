export const localInternBrand = {
  name: "Kram Team",
  tagline: "Force & Honor",
  title: "Cahier de stage — Développement",
  subtitle: "Améliorer la plateforme Fitness Management en local",
  duration: "Stage 4 à 8 semaines (adaptable)",
  audience: "Profil Full Stack junior (Laravel + React)",
  location: "Le Kram — Tunisie / remote hybride",
};

export const localInternContext = {
  product:
    "Kram Team Fitness Management Platform : gestion de salle (kickboxing, MMA, fitness) — CRM adhérents, abonnements, planning, réservations, check-in QR, paiements, Green Rewards, dashboards multi-rôles.",
  stack: [
    "Backend : Laravel 12, PHP 8.3+, API REST, Sanctum — dossier backend/",
    "Frontend : React 19, TypeScript, Vite, Tailwind — dossier frontend/",
    "Local : Laragon (Windows) — API http://127.0.0.1:8001 — App http://localhost:5173",
    "Comptes démo (mot de passe : password) : admin@kramteam.com, reception@kramteam.com, coach@kramteam.com, member@kramteam.com",
  ],
  alreadyDone: [
    "Auth multi-rôles (admin, gestionnaire/reception, coach, adhérent).",
    "Membres, offres, abonnements, quotas, planning, réservations (validation staff).",
    "QR check-in, paiements, notifications, Green Rewards (validation actions / boutique).",
    "Staff CRUD, contrôle admin, stats coach / taux horaire, suivi santé de base.",
    "Site vitrine + planning public.",
  ],
  goal:
    "Le stagiaire travaille uniquement en local (Laragon + Git). Aucun déploiement VPS. Objectif : livrer des fonctionnalités métier testables, avec PR propres et documentation courte.",
};

export const localInternPhases = [
  {
    id: "1",
    title: "Phase 1 — Prise en main locale",
    goal: "Environnement stable + compréhension du code.",
    tasks: [
      "Installer Laragon, cloner le repo, créer la branche feature/stage-<prenom>.",
      "Backend : composer install, .env, migrate + seed, php artisan serve --port=8001.",
      "Frontend : npm install, npm run dev (proxy /api → 8001).",
      "Se connecter avec chaque rôle et noter ce qui marche / ce qui manque.",
      "Lire CONTEXTE PROJET.MD et cartographier backend/app/Modules + pages frontend.",
      "Créer docs/stage/JOURNAL.md (1 entrée / jour) + push régulier (pas de secrets).",
    ],
    done: "Stack locale OK, journal démarré, 1er PR « setup stage ».",
  },
  {
    id: "2",
    title: "Phase 2 — Fiabiliser l’existant",
    goal: "Corriger bugs et UX avant d’ajouter du neuf.",
    tasks: [
      "Lister 8–12 bugs / frictions (formulaires, messages d’erreur API, mobile).",
      "Corriger validation réservations / quotas côté API + messages front clairs.",
      "Améliorer fiches adhérent (photo, certificat médical upload, coach référent).",
      "Afficher solde quotas (total / consommé / restant) de façon lisible pour l’adhérent.",
      "Homogénéiser états vides, loaders et toasts sur les pages principales.",
      "Ajouter ou compléter 3–5 tests Feature Laravel sur un module critique (booking ou QR).",
      "PR « polish & fixes » avec captures avant/après.",
    ],
    done: "Parcours login → réserver → check-in fluide pour admin et adhérent.",
  },
  {
    id: "3",
    title: "Phase 3 — Module Programmes sportifs",
    goal: "Le coach assigne un programme ; l’adhérent le suit.",
    tasks: [
      "Modèle + migrations : programmes, exercices, assignations membre.",
      "API CRUD coach/admin + lecture adhérent (policies Sanctum).",
      "UI coach : créer programme (objectifs, séries, reps, charges, notes).",
      "UI adhérent : voir programme assigné + cocher séances / commentaires.",
      "Lier optionnellement au dashboard coach et espace membre.",
      "Seed de démo + doc docs/stage/PROGRAMMES.md + PR.",
    ],
    done: "Un coach crée un programme, un membre le voit et marque sa progression.",
  },
  {
    id: "4",
    title: "Phase 4 — Site vitrine & expérience adhérent",
    goal: "Renforcer la présence publique et l’app membre en local.",
    tasks: [
      "Enrichir landing : section coachs, témoignages, galerie (contenu géré ou seed).",
      "Page publique Offres (comparaison prix / avantages) branchée sur l’API.",
      "Améliorer planning public (filtres niveau / activité, places restantes).",
      "Espace membre : historique présences + paiements + prochaines séances en un coup d’œil.",
      "Notifications in-app : s’assurer que booking / green / abo génèrent des alertes utiles.",
      "Responsive mobile des pages critiques (booking, QR adhérent, green).",
      "PR « vitrine & membre ».",
    ],
    done: "Landing + offres publiques + dashboard membre cohérents et utilisables sur téléphone.",
  },
  {
    id: "5",
    title: "Phase 5 — Bonus (au choix, 1 à 2 max)",
    goal: "Approfondir selon le temps restant — toujours en local.",
    tasks: [
      "Option A — Événements salle : CRUD + inscription adhérents.",
      "Option B — Blog / actualités simple (admin écrit, public lit).",
      "Option C — PWA légère (manifest + installable) pour l’app /app.",
      "Option D — Alertes abonnements bientôt expirés (job local + notif).",
      "Option E — Export CSV membres / paiements pour la réception.",
      "Documenter le choix, démo tuteur, rapport de stage court.",
    ],
    done: "Au moins 1 bonus livré, démo complète, rapport + runbook local.",
  },
];

export const localInternRules = [
  "Travail 100 % local (Laragon). Pas de VPS, pas de CI/CD serveur obligatoire.",
  "Tout passe par Git : branche perso, commits clairs, PR par phase.",
  "Ne jamais committer .env, dumps, photos personnelles, mots de passe.",
  "Respecter modules existants (Service Layer, policies, API Resources).",
  "UI : suivre le design Kram Team (noir / rouge / cream), pas de thème générique.",
  "Livrable hebdo : démo 10 min + PR + notes dans JOURNAL.md.",
];

export const localInternDeliverables = [
  "Branche + PRs fusionnables pour chaque phase.",
  "Module Programmes (API + UI) fonctionnel en local.",
  "Améliorations vitrine / membre documentées.",
  "docs/stage/JOURNAL.md + README_SETUP_LOCAL.md mis à jour si besoin.",
  "Rapport de stage : ce qui a été fait, limites, pistes suivantes.",
];

export const localInternEval = [
  "Autonomie locale : un autre stagiaire peut relancer le projet avec la doc.",
  "Qualité code : typage TS, validation Laravel, pas de secrets, PR lisibles.",
  "Valeur métier : parcours adhérent / coach réellement améliorés.",
  "Fiabilité : pas de régression majeure sur booking, QR, abonnements.",
  "Communication : journal à jour, démos régulières.",
];
