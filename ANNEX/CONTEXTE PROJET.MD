CONTEXTE PROJET

Tu es un Software Architect Senior Full Stack expert en :

Laravel 12
React 19
TypeScript
PostgreSQL
TailwindCSS
SaaS Architecture
Clean Architecture
Domain Driven Design
Gamification Systems


Tu dois développer une plateforme complète de gestion pour la salle de sport :

Kram Team Fitness Management Platform

La plateforme doit transformer Kram Team en un écosystème digital complet comprenant :

Site vitrine premium
CRM adhérents
Gestion abonnements
Gestion offres complexes
Gestion quotas
QR Check-in
Réservation séances
Gestion coachs
Application adhérent
Dashboard administration
Dashboard réception
Dashboard coach
Notifications automatiques
Paiements
Programmes sportifs
IA Assistant
Module écologique Green Rewards 🌱

L'application doit être :

Production Ready
Scalable
Sécurisée
Responsive
PWA Ready
Modulaire
Facilement maintenable
STACK TECHNIQUE

Backend :

Laravel 12
PHP 8.3+
PostgreSQL
REST API
Laravel Sanctum/JWT
Eloquent ORM
Events & Listeners
Queue Jobs
Notifications
Storage

Frontend :

React 19
TypeScript
Vite
TailwindCSS
React Router
React Query
Framer Motion
Recharts
Lucide Icons

Infrastructure :

Docker
Redis
Queue Worker
CI/CD Ready

Sécurité :

RBAC Roles Permissions
Policies Laravel
Validation Requests
API Resources
Audit Logs
ARCHITECTURE OBLIGATOIRE

Organiser le projet par modules métiers.

Structure :

Modules

├── Authentication
├── Users
├── Members
├── Coaches
├── Offers
├── Subscriptions
├── Quotas
├── Attendance
├── QR System
├── Booking
├── Schedule
├── Payments
├── Notifications
├── Programs
├── Events
├── CRM
├── Blog
├── Green Rewards Engine


Utiliser :

Service Layer
Repository Pattern si nécessaire
Events/Listeners
Jobs Async
Domain Services
SITE VITRINE KRAM TEAM

Créer un site premium inspiré de :

Gymshark
Technogym
Nike Training Club
Pages
Accueil

Créer :

Hero vidéo plein écran
Animation moderne
Présentation Kram Team
Valeurs
Statistiques animées
Coachs
Activités
Offres
Transformation membres
Témoignages
Planning
Galerie
Evènements
Blog
CTA rejoindre Kram Team
À propos
Histoire
Mission
Valeurs
Equipe
Certifications
Activités

Créer :

Musculation
CrossFit
Fitness
Cardio
Boxe
MMA
Yoga
Pilates
Coaching personnel
Offres

Afficher :

Prix
Avantages
Comparaison
Achat
Réservation
Planning

Afficher :

Cours
Coach
Niveau
Places disponibles
GESTION DES ADHERENTS

Créer une fiche complète.

Informations :

Nom
Prénom
Photo
QR Code
Téléphone
Email
Adresse
Date naissance
Sexe
Objectifs
Coach référent

Documents :

Certificat médical

Historique :

Présences
Réservations
Paiements
Progression
Notifications
Green Score
GESTION DES OFFRES

Supporter plusieurs types :

Offre illimitée

Durée :

1 mois
3 mois
6 mois
12 mois

Sans limitation.

Offre par séances

Exemples :

10 séances
20 séances
40 séances

Chaque présence déduit une séance.

Offre horaire

Exemples :

10 heures
20 heures

Calcul automatique :

Check-in

↓

Check-out

↓

Déduction temps consommé

Offre Mixte

Exemple :

12 séances Fitness

8 séances CrossFit

5 heures Coaching privé

4 séances MMA

Chaque quota est indépendant.

Paramètres :

Nom
Prix
Durée
Dates
Quotas
Services inclus
Coaches autorisés
Réservation obligatoire
Promotion
Image
GESTION DES ABONNEMENTS

Statuts :

Actif
Suspendu
Expiré
En attente
Résilié
Renouvelé

Créer historique complet.

MOTEUR QUOTA

Créer :

QuotaService

Fonctions :

Calcul consommation
Solde restant
Historique
Alertes

Afficher :

Total
Consommé
Restant
Expiration
MODULE QR CHECK-IN

Chaque adhérent possède :

QR Code unique

Le QR contient :

UUID sécurisé

Lors du scan :

Vérifier :

abonnement actif
quota
réservation
autorisation accès

Créer :

Attendance automatiquement.

Empêcher :

Double scan
Fraude
Expiration

Créer :

QRCodeService

RESERVATION DES SEANCES

Chaque cours contient :

Coach
Date
Heure
Durée
Capacité
Salle
Niveau
Type

Fonctions :

Réservation
Annulation
Liste attente
QR réservation
DASHBOARD ADMIN

Créer statistiques :

Membres actifs
Revenus
Présences
Réservations
Abonnements expirés
Coach performance

Graphiques :

Evolution revenus
Fréquentation
Cours populaires
DASHBOARD COACH

Afficher :

Mes cours
Planning
Membres
Progression
Programmes
Messages
ESPACE ADHERENT

Afficher :

Abonnement
QR Code
Quota
Planning
Réservations
Coach
Paiements
Programmes
Notifications
PROGRAMMES SPORTIFS

Coach crée :

Programme mensuel

Contient :

Objectifs
Exercices
Séries
Répétitions
Charges
Repos
Vidéos
Photos
Commentaires
=================================================
MODULE KRAM TEAM GREEN REWARDS 🌱
=================================================

Créer un moteur écologique complet.

Objectif :

Transformer Kram Team en communauté sportive écologique.

Chaque membre possède :

Green Score
Eco Points
Niveau
Badges
Classement
Impact écologique
GREEN LEVEL SYSTEM

Créer niveaux :

0

Green Starter


500

Eco Member


1500

Green Athlete


3000

Eco Warrior


5000+

Kram Green Champion

Evolution automatique selon points.

ECO POINT ENGINE

Créer un moteur configurable.

Table :

eco_rules

Champs :

id

code

name

category

points

validation_type

daily_limit

monthly_limit

active

Catégories :

Mobilité
Vélo +50
Marche +40
Transport public +20
Covoiturage +30
Eau
Gourde +10
Economie eau +20
Recyclage
Plastique +5
Tri +10
Textile +40
Association
Nettoyage plage +100
Plantation arbres +150
Collecte déchets +80
Vie Kram Team
Présence régulière +50
Participation événement +30
Parrainage +100
VALIDATION ACTIONS

Workflow :

Member submit action

↓

Pending

↓

Coach/Admin validation

↓

Approved

↓

Points ajoutés

Statuts :

Pending
Approved
Rejected

Support :

automatique
coach
admin
QR event
photo preuve
GREEN QR EVENT SYSTEM

Créer QR dynamique.

Table :

eco_qr_tokens

Champs :

uuid

event_id

expires_at

max_scan

used_count

Fonctionnement :

Scan QR événement

↓

Vérification membre

↓

Validation présence

↓

Attribution points

Protection :

expiration
UUID sécurisé
anti double scan
ECO CHALLENGES

Créer système challenges.

Exemples :

30 jours sans plastique
10 venues vélo
Nettoyage environnement
Zéro déchet

Chaque challenge :

Nom
Description
Image
Dates
Objectif
Points
Badge
BADGES

Créer :

eco_badges

Exemples :

🌱 Green Starter

🚴 Bike Member

💧 Water Saver

♻ Recycling Hero

🌊 Ocean Protector

🌳 Tree Guardian

🏆 Eco Champion

REWARDS STORE

Catalogue récompenses.

Exemples :

500 points :

Séance gratuite

1000 :

Réduction abonnement

1500 :

T-shirt

2000 :

Coaching privé

3000 :

Pack Premium

Créer :

Reward Redemption System.

ECO IMPACT TRACKING

Créer :

eco_impacts

Suivre :

CO2 économisé
Eau économisée
Déchets recyclés
Arbres plantés

Créer rapports :

"Kram Team Environmental Impact Report"

GREEN LEADERBOARD

Créer classements :

Global
Mensuel
Amis
Equipe
GREEN COMMUNITY FEED

Créer fil communautaire :

Exemple :

Ahmed a planté un arbre 🌳

Mariem a terminé challenge zéro plastique ♻️
TRUST SCORE ANTI FRAUDE

Créer :

Eco Reputation Score

Analyser :

actions validées
rejets
comportement
IA GREEN COACH

Créer assistant IA capable de :

analyser comportement écologique
recommander actions
proposer challenges
générer rapport mensuel
prédire évolution Green Level

Exemple :

Votre score augmente.

Vous pouvez devenir Eco Warrior dans 20 jours.

Actions recommandées :

- venir vélo 2 fois/semaine
- participer nettoyage plage
DATABASE GREEN MODULE

Créer migrations :

eco_rules

eco_actions

member_eco_actions

eco_points_transactions

eco_levels

eco_badges

member_badges

eco_challenges

member_challenges

eco_rewards

reward_redemptions

eco_events

eco_event_participants

eco_impacts

eco_qr_tokens

eco_feed

eco_leaderboards

eco_reports
API GREEN

Créer :

GET /api/member/green-profile

GET /api/member/eco-history

POST /api/member/eco-action

GET /api/challenges

POST /api/challenge/join

POST /api/reward/redeem

GET /api/leaderboard

POST /api/admin/validate-action
DESIGN UI

Identité Kram Team :

Couleurs :

Black
#0B0B0B

Orange
#FF7A00

White
#FFFFFF

Green
#22C55E

Style :

Dark mode
Glassmorphism
Claymorphism léger
Framer Motion
Cards premium
Progress bars
Badges animés
Recharts
LIVRABLES OBLIGATOIRES

Générer :

Backend :

migrations
models
relations
services
controllers API
policies
events/listeners
jobs
notifications
seeders
tests

Frontend :

pages React
composants réutilisables
dashboards
QR scanner
charts
animations

Documentation :

architecture
installation
API documentation
deployment guide
IMPORTANT AVANT CODAGE

Avant toute génération de code :

Analyser l'architecture existante.
Identifier les modèles déjà présents.
Ne jamais créer de duplication.
Proposer un plan d'implémentation par Sprint.
Implémenter module par module.
Respecter SOLID + Clean Architecture.

Le résultat final doit être une plateforme SaaS professionnelle capable de supporter plusieurs salles de sport dans le futur.