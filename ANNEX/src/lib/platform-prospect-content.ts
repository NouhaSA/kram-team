export const prospectBrand = {
  name: "Kram Team",
  tagline: "Force & Honor",
  product: "Fitness Management Platform",
  subtitle: "Plateforme digitale complète pour salles de combat & fitness",
  contactEmail: "admin@kramteam.com",
  location: "Le Kram — Tunisie",
};

export const prospectIntro = {
  title: "Une salle connectée, un business maîtrisé",
  paragraphs: [
    "Kram Team Fitness Management Platform digitalise l’intégralité du parcours salle : acquisition, abonnements, réservations, check-in QR, coaching, paiements, notifications et fidélisation écologique.",
    "Conçue pour les clubs de kickboxing, MMA et fitness, la solution unifie admin, gestionnaire, coach et adhérent dans une expérience premium, mobile-ready et modulaire.",
  ],
};

export const prospectValue = [
  {
    title: "Moins d’admin papier",
    text: "CRM, abonnements, quotas et paiements centralisés — moins d’erreurs, plus de temps sur le ring.",
  },
  {
    title: "Plus de présence",
    text: "QR check-in, réservations validées, planning coach assigné : la salle tourne en temps réel.",
  },
  {
    title: "Plus de rétention",
    text: "Notifications, suivi santé, Green Rewards et stats visibles pour garder les adhérents engagés.",
  },
  {
    title: "Pilotage financier",
    text: "Revenus, check-ins, masse salariale coach (heures × taux) : décisions basées sur les chiffres.",
  },
];

export const prospectRoles = [
  {
    role: "Administrateur",
    items: [
      "Dashboard KPI (membres, CA, présences, green)",
      "Comptes staff (gestionnaire & coach)",
      "Contrôle privilèges + historique d’actions",
      "Offres, abonnements, paiements",
      "Stats coach & salaire",
      "Validation réservations / Green",
    ],
  },
  {
    role: "Gestionnaire",
    items: [
      "Scan QR entrée / sortie",
      "Validation réservations adhérents",
      "CRM membres & abonnements",
      "Planning : créer / modifier / assigner coach",
      "Paiements & check-in live",
      "Validation actions & échanges Green",
    ],
  },
  {
    role: "Coach",
    items: [
      "Dashboard séances & membres assignés",
      "Planning & scan QR",
      "Stats personnelles (séances, heures)",
      "Salaire période (taux horaire)",
      "Rapports jour / semaine / mois",
    ],
  },
  {
    role: "Adhérent",
    items: [
      "QR code personnel scannable",
      "Réservation avec choix d’abonnement",
      "Suivi santé & objectifs",
      "Green Rewards (points, boutique, challenges)",
      "Notifications & prochaines séances",
      "Espace abonnement / quotas",
    ],
  },
];

export const prospectModules = [
  {
    title: "Site & image de marque",
    items: [
      "Landing premium Force & Honor",
      "Planning public des créneaux",
      "Identité visuelle black / red",
    ],
  },
  {
    title: "CRM & adhérents",
    items: [
      "Fiches membres, QR UUID",
      "Assignation coach",
      "Statistiques adhérent",
      "Activation / désactivation comptes",
    ],
  },
  {
    title: "Offres & abonnements",
    items: [
      "Types : illimité, séances, horaire, mixte",
      "Quotas par activité",
      "Souscription, suspension, renouvellement",
      "Réservation liée à l’abonnement choisi",
    ],
  },
  {
    title: "Planning & réservations",
    items: [
      "Calendrier mensuel",
      "Créneaux : cours, salle, capacité, coach",
      "Demande adhérent → validation admin/gestionnaire",
      "Waitlist si complet",
    ],
  },
  {
    title: "QR Check-in",
    items: [
      "Scan caméra + saisie manuelle",
      "Check-in / check-out auto",
      "Contrôle abonnement & quotas",
      "Sessions ouvertes en temps réel",
    ],
  },
  {
    title: "Paiements",
    items: [
      "Enregistrement paiements",
      "Statuts & références",
      "Lien abonnement / encaissement",
      "Vue gestionnaire & admin",
    ],
  },
  {
    title: "Notifications",
    items: [
      "Réservations, planning, paiements",
      "Green & anniversaires",
      "Rappels renouvellement",
      "CTA action (réserver / valider)",
    ],
  },
  {
    title: "Green Rewards",
    items: [
      "Actions éco & validation staff",
      "Points, niveaux, badges",
      "Boutique & échanges à accepter",
      "Challenges & classement",
    ],
  },
  {
    title: "Santé & coaching",
    items: [
      "Profil objectifs & mesures",
      "Historique poids / anthropométrie",
      "Recommandations nutrition",
      "Suivi par staff / coach",
    ],
  },
  {
    title: "Stats coach & RH",
    items: [
      "Séances, heures, personnes formées",
      "Taux horaire configurable",
      "Salaire = heures × taux (TND)",
      "Masse salariale agrégée",
    ],
  },
  {
    title: "Gouvernance",
    items: [
      "RBAC : admin, gestionnaire, coach, member",
      "Journal d’activité (audit)",
      "API REST Laravel Sanctum",
      "Architecture modulaire scalable",
    ],
  },
];

export const prospectStack = {
  backend: ["Laravel 12", "PHP 8.3+", "REST API", "Sanctum", "Events & Notifications"],
  frontend: ["React 19", "TypeScript", "Vite", "TailwindCSS", "React Query"],
  ops: ["Modulaire (DDD-like)", "RBAC & Policies", "Audit logs", "Responsive / PWA-ready"],
};

export const prospectBenefits = [
  "Déploiement rapide pour une salle existante ou un réseau multi-clubs",
  "Parcours adhérent premium (QR, résa, green, santé) différenciant vs concurrence",
  "Réduction des no-shows grâce à validation + rappels",
  "Transparence RH coach (heures & salaire)",
  "Base SaaS : un produit, plusieurs rôles, une seule source de vérité",
];

export const prospectNext = [
  "Démo live (admin / gestionnaire / coach / adhérent)",
  "Atelier besoins : offres, quotas, tarifs coach",
  "Paramétrage salle + import adhérents",
  "Go-live check-in QR & planning",
  "Accompagnement formation staff (2–4 h)",
];
