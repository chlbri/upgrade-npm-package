## Instructions pour de meilleurs commits

- Toujours écrire des messages de commit clairs et concis.
- Utiliser strictement l'anglais pour les messages de commit.
- Utiliser la (documentation)[.github/commit-message-editor.md] de
  l'extension "adam-bender.commit-message-editor"
- Inclure la (configuration actuelle
  utilisateur)[.github/vsix.commit-message-editor.json] de l'extension
  adam-bender.commit-message-editor, pour le format de chaque commit.

## Contexte : Gestion améliorée de l'état des dépendances

**Fonctionnalité actuelle** : 002-spec-validate-bullet - Gestion améliorée de
l'état des dépendances et mécanisme de rollback

**Stack technique** :

- Langage : TypeScript 5.x avec Node.js >= 20
- Framework : cmd-ts, execa, utilitaires de parsing semver
- Stockage : Gestion d'état en mémoire lors du processus d'upgrade (pas de
  stockage persistant)
- Type de projet : Bibliothèque unique - outil CLI avec architecture par
  couche de services

**Composants clés** :

- DependencyStateManager : Service central de gestion d'état
- PackageManagerAdapter : Abstraction pour npm/yarn/pnpm/bun
- ScriptConfig : Configuration typée pour l'exécution de scripts
- Mécanisme de rollback : Opérations atomiques avec restauration complète

**Modifications récentes** :

- Ajout du suivi d'état des dépendances avec préservation des opérateurs semver
- Implémentation d'un rollback automatique sur échec d'exécution de scripts
- Amélioration du CLI avec support configurable des scripts test/build
- Ajout du pattern d'adaptateur de gestionnaire de packages pour compatibilité
  multi-PM
