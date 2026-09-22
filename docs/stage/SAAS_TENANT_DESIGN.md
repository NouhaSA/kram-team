
L'isolation devra être centralisée autant que possible afin d'éviter que chaque fonctionnalité implémente sa propre logique de sécurité.

## 8. Risques identifiés

Les principaux risques sont :

- fuite de données entre deux tenants ;
- confusion entre rôle utilisateur et tenant ;
- accès indirect à des données d'un autre tenant ;
- relations entre entités permettant de contourner l'isolation ;
- données globales ou partagées mal identifiées.

## 9. Plan d'implémentation proposé

1. Créer le modèle Tenant.
2. Créer la migration tenants.
3. Définir l'appartenance des utilisateurs aux tenants.
4. Identifier les entités nécessitant un scope tenant.
5. Ajouter les relations et clés étrangères nécessaires.
6. Mettre en place le contexte du tenant courant.
7. Centraliser le filtrage des données.
8. Ajouter des tests d'isolation.
9. Vérifier qu'un tenant ne peut pas accéder aux données d'un autre tenant.
10. Documenter la stratégie finale.

## 10. Tests d'isolation à prévoir

Les tests devront notamment vérifier que :

- le tenant A peut accéder à ses propres données ;
- le tenant A ne peut pas accéder aux données du tenant B ;
- les listes et recherches sont limitées au tenant courant ;
- les nouvelles données sont associées au bon tenant ;
- une modification ou suppression ne peut pas cibler les données d'un autre tenant ;
- les relations indirectes ne permettent pas de contourner l'isolation.

## 11. Conclusion

Le projet possède déjà une base RBAC permettant de gérer les rôles et permissions.

La prochaine étape pour une architecture SaaS est d'introduire explicitement la notion de tenant et son isolation.

Ce document constitue une conception préparatoire. L'implémentation de la base de données et des mécanismes d'isolation devra être réalisée après validation de l'architecture retenue.

