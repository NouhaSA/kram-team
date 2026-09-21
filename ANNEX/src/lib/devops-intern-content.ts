export const internBrand = {
  name: "Kram Team",
  tagline: "Force & Honor",
  title: "Cahier de stage — DevOps",
  subtitle: "Industrialiser le déploiement de la plateforme Fitness Management",
  duration: "Stage 4 à 8 semaines (adaptable)",
  audience: "Profil DevOps / SysAdmin / Cloud junior",
  location: "Le Kram — Tunisie / remote hybride",
};

export const internContext = {
  product:
    "Kram Team Fitness Management Platform est une application web de gestion de salle (kickboxing, MMA, fitness) : CRM adhérents, abonnements, planning, réservations, check-in QR, paiements, notifications, Green Rewards, stats coach et dashboards multi-rôles.",
  stack: [
    "Backend : Laravel 12, PHP 8.3+, API REST, Sanctum",
    "Frontend : React 19, TypeScript, Vite, TailwindCSS",
    "Données : PostgreSQL (cible prod) / MySQL-MariaDB possible selon l’hébergeur",
    "Cache & files d’attente : Redis + queue Laravel",
    "Local actuel : Laragon (Windows) — API :8001, app :5173",
  ],
  today: [
    "Code métier fonctionnel en local (admin, gestionnaire, coach, adhérent).",
    "Docker Compose backend existant (app, postgres, redis, queue) mais encore orienté développement.",
    "Pas de CI/CD, pas d’environnements staging/prod, pas de Nginx/SSL automatisés, pas de backups ni monitoring.",
    "Frontend servi via Vite en dev, pas de pipeline de build + assets statiques en prod.",
  ],
  goal:
    "À la fin du stage, un push (ou un tag) déploie automatiquement la plateforme sur un serveur : HTTPS, base, Redis, workers, cron, backups, logs et rollback. Zéro intervention manuelle « artisan serve ».",
};

export const internTarget = {
  title: "Cible d’architecture (prod)",
  items: [
    "1 VPS Ubuntu 24.04 — 2 vCPU / 4 Go RAM (charge ~500 visites/jour).",
    "Nginx reverse-proxy + TLS Let’s Encrypt.",
    "Conteneurs : nginx, php-fpm (API), frontend (nginx static), postgres, redis, queue worker, scheduler.",
    "Secrets hors Git (.env / Docker secrets / variables CI).",
    "CI : tests + build images. CD : deploy automatique vers staging puis prod.",
    "Observabilité : healthchecks, logs centralisés, alertes down, backup DB quotidien.",
  ],
};

/** Checklist ordonnée PC → Git → VPS (à envoyer au stagiaire). */
export const internPhases = [
  {
    id: "A",
    title: "Phase A — Git & méthode de travail (PC)",
    goal: "Tout le travail passe par Git. Rien n’est « seulement sur le PC ».",
    tasks: [
      "Cloner le dépôt Kram Team et créer une branche : feature/devops-stage-<prenom>.",
      "Lire backend/, frontend/, Docker existant ; noter ports (API 8001, Vite 5173).",
      "Créer le dossier docs/devops/ et un journal JOURNAL.md (1 entrée / jour).",
      "Vérifier .gitignore : .env, vendor/, node_modules/, storage/logs exclus.",
      "Chaque tâche = 1 commit clair + push sur sa branche (jamais de push force sur main).",
      "Ouvrir une PR à la fin de chaque phase pour revue tuteur.",
    ],
    done: "Branche distante active, premier PR « setup stage » ouvert.",
  },
  {
    id: "B",
    title: "Phase B — Tout faire marcher sur le PC (comme en prod)",
    goal: "Reproduire la prod en local avec Docker, sans Laragon / artisan serve.",
    tasks: [
      "Rédiger .env.example backend + frontend (local / staging / prod commentés).",
      "Dockerfile backend prod : php-fpm + extensions (pas php artisan serve).",
      "Dockerfile frontend multi-stage : npm ci && npm run build → nginx static.",
      "docker-compose.prod.yml : api, front, postgres, redis, queue, scheduler.",
      "Scripts make up / down / logs / migrate / seed / shell.",
      "Lancer la stack localement ; login démo OK (admin / reception / coach / member).",
      "Documenter dans docs/devops/LOCAL.md : commandes + dépannage.",
      "Commit + push + PR « docker prod local ».",
    ],
    done: "docker compose -f docker-compose.prod.yml up -d = plateforme complète sur le PC.",
  },
  {
    id: "C",
    title: "Phase C — Préparer le VPS (encore depuis le PC)",
    goal: "Tout le provisionnement est versionné dans Git avant de toucher le serveur.",
    tasks: [
      "Choisir VPS Ubuntu 24.04 (2 vCPU / 4 Go) + 2 domaines (app + api) ou 1 domaine + chemins.",
      "Écrire playbook Ansible (ou script bash) : user deploy, SSH keys, UFW, Docker Engine.",
      "Configs Nginx/Traefik + Let’s Encrypt versionnées dans deploy/.",
      "Modèle .env.production.example (sans secrets réels) + checklist secrets à créer sur le VPS.",
      "Script deploy.sh : pull images / compose up / migrate --force / healthcheck.",
      "Script backup-db.sh + restore-db.sh (testés en local contre Postgres du compose).",
      "Commit + push + PR « infra as code ».",
    ],
    done: "Un nouveau VPS peut être monté en suivant uniquement les scripts du repo.",
  },
  {
    id: "D",
    title: "Phase D — Mettre en ligne sur le VPS",
    goal: "HTTPS public, login réel, workers et cron actifs.",
    tasks: [
      "Créer le VPS ; lancer le playbook depuis le PC (SSH key only, root login off).",
      "Copier .env.production sur le serveur (jamais dans Git).",
      "Premier déploiement manuel : deploy.sh → site joignable en HTTPS.",
      "Vérifier : login, réservation, QR, queue, scheduler, storage:link.",
      "Activer backup quotidien (cron) + rotation 7–14 jours.",
      "Healthchecks : /up API + page front ; alerte basique (email/Telegram).",
      "Noter IP, domaines, versions images dans docs/devops/PROD.md.",
      "Commit doc + PR « go-live VPS ».",
    ],
    done: "Kram Team accessible en HTTPS sur le VPS ; Laragon n’est plus nécessaire.",
  },
  {
    id: "E",
    title: "Phase E — Automatiser : Git push → VPS à jour",
    goal: "Plus de déploiement manuel. Un push (ou un tag) met le serveur à jour.",
    tasks: [
      "GitHub Actions : lint/test backend + build frontend sur chaque PR.",
      "Build & push images Docker (GHCR) sur merge main.",
      "Job deploy staging auto (SSH + compose pull + up --wait).",
      "Deploy prod sur tag vX.Y.Z (ou bouton manuel approuvé).",
      "Rollback documenté : redéployer l’image précédente en 1 commande.",
      "Secrets CI (SSH key, registry) dans GitHub Secrets uniquement.",
      "RUNBOOK.md : incident, restore DB, rotate secrets, restart workers.",
      "Démo finale tuteur : push → CI verte → VPS à jour + rollback.",
    ],
    done: "Merge/tag = déploiement automatique. Serveur autonome après reboot.",
  },
];

export const internSprints = internPhases.map((p, i) => ({
  week: `Phase ${p.id} — ${["Sem. 1", "Sem. 1–2", "Sem. 2–3", "Sem. 3–4", "Sem. 4–8"][i]}`,
  title: p.title.replace(/^Phase [A-E] — /, ""),
  tasks: p.tasks,
  done: p.done,
}));

export const internRules = [
  "Ne jamais committer de secrets, dumps, ni .env de prod.",
  "Toute automatisation doit être reproductible (IaC / scripts versionnés).",
  "Pas de docker-compose « tout en root » sans durcissement SSH/firewall.",
  "Les migrations DB en prod sont versionnées et journalisées.",
  "Le stagiaire documente chaque sprint (markdown dans /docs/devops/).",
  "Livrables hebdo : démo courte + PR + notes de risques.",
];

export const internDeliverables = [
  "docker-compose.prod.yml + Dockerfiles frontend/backend production.",
  "Playbooks Ansible (ou Terraform) de provisionnement VPS.",
  "Pipeline CI/CD (YAML) avec staging + prod.",
  "Scripts backup/restore + cron scheduler/queue.",
  "docs/devops/README.md + RUNBOOK.md.",
  "Rapport de stage : architecture, choix, métriques, pistes d’amélioration.",
];

export const internEval = [
  "Reproductibilité : un nouveau VPS se monte en < 30 min via scripts.",
  "Disponibilité : HTTPS, workers, cron actifs après reboot.",
  "Sécurité : SSH keys, firewall, secrets hors repo, headers Nginx.",
  "Qualité : CI verte, images taguées, rollback démontré.",
  "Autonomie : runbook utilisable par quelqu’un qui n’a pas fait le stage.",
];
