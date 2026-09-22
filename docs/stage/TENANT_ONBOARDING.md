# Tenant Onboarding — Kram Team

Documente la commande d'automatisation de création d'un nouveau tenant (salle) et son compte admin.
Mission 5 de la Phase 1 (« Automatisation locale »).

## 1. Objectif

Automatiser le scénario : **Nouveau client → nouveau tenant → configuration → compte admin**, en une seule commande, testable en local.

## 2. Pré-requis (mission 4)

- Table `tenants` (migration `2026_09_22_183754_create_tenants_table.php`) : `id`, `name`, `slug` (unique), `is_active`, timestamps.
- Colonne `tenant_id` sur `users` (migration `2026_09_22_184220_add_tenant_id_to_users_table.php`), nullable, clé étrangère vers `tenants`, `nullOnDelete`.
- Modèle `App\Models\Tenant`, avec relation `users()`.

Voir `docs/stage/SAAS_TENANT_DESIGN.md` pour la conception complète.

## 3. La commande `tenant:onboard`

Fichier : `backend/app/Console/Commands/TenantOnboardCommand.php`.

### Signature

```
php artisan tenant:onboard {name} {admin_email} {admin_password} {admin_first_name=Admin} {admin_last_name=Salle}
```

| Argument | Obligatoire | Description |
|---|---|---|
| `name` | oui | Nom de la salle (tenant) |
| `admin_email` | oui | Email du compte admin de la salle |
| `admin_password` | oui | Mot de passe du compte admin |
| `admin_first_name` | non (défaut `Admin`) | Prénom du compte admin |
| `admin_last_name` | non (défaut `Salle`) | Nom du compte admin |

### Ce que fait la commande

1. Vérifie que l'email n'est pas déjà utilisé (refuse sinon, sans rien créer).
2. Crée le tenant (`name`, `slug` généré automatiquement, `is_active = true`).
3. Crée l'utilisateur admin (`first_name`, `last_name`, `email`, mot de passe chiffré).
4. Rattache l'utilisateur au tenant (`tenant_id`).
5. Attribue le rôle `admin` (via `syncRoles`, mécanisme RBAC déjà présent dans le projet).
6. Affiche un résumé (nom, slug et id du tenant ; email de l'admin).

### Exemple d'utilisation

```powershell
php artisan tenant:onboard "Salle Test Nord" admin.testnord@kramteam.com "MotDePasse123!"
```

Résultat attendu :

```
Tenant cree : Salle Test Nord (slug: salle-test-nord, id: 3)
Compte admin cree : admin.testnord@kramteam.com
```

## 4. Point technique important : `$fillable` sur `User`

Le modèle `App\Modules\Users\Models\User` n'inclut pas `tenant_id` dans sa liste `$fillable`, par protection contre le remplissage de masse. Une première version de la commande, qui passait `tenant_id` directement dans `User::create([...])`, l'ignorait silencieusement (aucune erreur, mais la colonne restait `null`).

**Correction retenue** : ne pas modifier `$fillable` du modèle `User` (partagé par tout le reste de l'application), mais assigner l'attribut après création :

```php
$admin = User::create([...]); // sans tenant_id
$admin->tenant_id = $tenant->id;
$admin->save();
```

## 5. Scénario de validation testé en local

1. Lancement de la commande avec un nouveau nom de salle et un email inédit.
2. Vérification en base (Tinker) : `tenant_id` de l'utilisateur créé correspond bien à l'id du tenant créé juste avant.
3. Test de connexion via l'API (`POST /api/v1/auth/login`) avec l'email et le mot de passe fournis à la commande : réponse `success: true`.

**Résultat : validé.** Le compte admin créé automatiquement peut se connecter normalement à la plateforme.

## 6. Limites connues (hors périmètre de cette phase)

- Aucune isolation des données métier n'est encore en place (membres, abonnements, paiements, etc. ne sont pas filtrés par tenant). Voir `SAAS_TENANT_DESIGN.md`, §5 et §9 pour le plan complet.
- Pas de vérification de format sur le mot de passe fourni en argument (à durcir avant un usage réel).
- La commande ne gère pas encore la mise à jour d'un tenant existant, seulement la création.

## 7. Prochaines étapes suggérées

1. Étendre le scope tenant aux entités métier prioritaires (membres, abonnements).
2. Ajouter des tests automatisés d'isolation (tenant A ne voit pas les données du tenant B).
3. Ajouter une option `--dry-run` à la commande pour prévisualiser sans écrire en base.
