# Recherche Phase 0 : Outil sûr de mise à niveau des dépendances avec fallback

Date : 2025-09-27 Branche : 001-this-lib-will Entrée :
/Users/chlbri/Documents/github/NODE JS/Librairies
bemedev/upgrade-npm-package/specs/001-this-lib-will/spec.md

## Points inconnus extraits du contexte technique

- Type de projet : Bibliothèque/CLI en Node.js (TypeScript, pnpm) → inféré
  depuis le dépôt
- Dépendance principale : edit-json-file → requis par FR-006
- Tests : Vitest → selon la Constitution
- Gestionnaire de paquets : pnpm → selon la Constitution
- Plateforme cible : Node.js >= 20 → selon la Constitution
- Objectifs de performance : non définis explicitement → limiter les
  opérations aux dépendances directes
- Contraintes : versions stables uniquement, registre npmjs.org, pas
  d'ajustement automatique des peers

Toutes les ambiguïtés critiques ont été résolues dans la section
Clarifications de la spécification.

## Décisions et justification

1. Versions stables uniquement (exclure les pré-releases)

- Décision : Exclure les pré-releases de la liste et des tentatives.
- Justification : Conforme à une stratégie d'upgrade prudente ; réduit la
  fragilité de la CI.
- Alternatives : Autoriser les pré-releases derrière un flag (option
  différée).

2. Politique du registre

- Décision : Utiliser uniquement npmjs.org pour les requêtes et les mises à
  jour ; avertir si un .npmrc personnalisé est détecté.
- Justification : Assure un comportement déterministe ; évite les surprises
  liées aux registres privés.
- Alternatives : Respecter .npmrc mais augmente la variabilité entre
  environnements.

3. Conflits de peer dependencies

- Décision : Si la CI échoue à cause de contraintes de peer, revenir à la
  version précédente et essayer la suivante ; ne pas modifier
  automatiquement les peerDependencies.
- Justification : Empêche des changements en cascade et un périmètre non
  maîtrisé.
- Alternatives : Ajuster automatiquement les peers (rejeté pour cause de
  complexité et de risque).

4. Préservation de l'opérateur semver

- Décision : Préserver l'opérateur existant (^, ~) et augmenter uniquement
  la version minimale lors d'une mise à jour acceptée.
- Justification : Conserve l'intention du consommateur et la sémantique des
  mises à jour.
- Alternatives : Épingler des versions exactes (rejeté ; contre FR-012).

5. Portée des mises à jour

- Décision : Dépendances directes uniquement : dependencies,
  devDependencies, optionalDependencies.
- Justification : Comportement prévisible et borné ; les mises à jour
  transitives sont incidentes via le rafraîchissement du lockfile.
- Alternatives : Forcer des overrides/resolutions (rejeté comme hors-scope
  selon FR-013).

6. Choix d'outillage

- Décision : Utiliser edit-json-file pour des modifications atomiques de
  package.json ; utiliser pnpm pour la synchronisation du lockfile.
- Justification : Conformité à FR-006 et à la politique pnpm-first de la
  Constitution.
- Alternatives : Modifications manuelles sur le fs ou autres gestionnaires
  de paquets (rejeté par les contraintes).

## Modèles et bonnes pratiques

- Récupération des versions : Utiliser les API du registre npm ; filtrer
  les pré-releases (/-/v1/search ou métadonnées de package) et trier par
  semver.
- Stratégie de backoff : Backoff exponentiel sur les erreurs réseau
  transitoires ; rapport d'erreur clair après plusieurs tentatives.
- Idempotence : Mettre en cache ou détecter les mises à jour déjà acceptées
  pour éviter de retravailler lors d'exécutions répétées.
- Journalisation : Sortie structurée résumant les tentatives et résultats
  par dépendance.

## Alternatives examinées

- Correction automatique des peerDependencies : trop risqué ; en conflit
  avec FR-011.
- Inclure les pré-releases : augmente les risques de casse ; en conflit
  avec la politique clarifiée.
- Mises à jour transitives via overrides : hors-scope ; en conflit avec
  FR-013.

## Résultat

Toutes les marques [NEEDS CLARIFICATION] ont été résolues conformément à la
spécification ; passer à la Phase 1.

---

Basé sur la Constitution v1.1.0

# Recherche (Phase 0)

Date : 2025-09-27

## Décisions connues (d'après les clarifications)

- Registre : npmjs.org uniquement
- Pré-releases : exclus (stable-only)
- Conflits de peers : ne pas ajuster automatiquement ; passer à la version
  inférieure suivante
- Opérateur de version : préserver l'existant (^/~) et augmenter la version
  minimale
- Portée : dépendances directes uniquement (deps/dev/optional) ; accepter
  les changements incidentels du lockfile

## Questions ouvertes (aucune bloquante)

- Métriques de performance : pas d'objectifs stricts ; viser une durée CI
  raisonnable

## Notes

- S'assurer que tous les imports disposent de types TypeScript. Si une
  librairie n'a pas de types, ajouter le package @types correspondant.
- Utiliser shelljs pour exécuter `pnpm run ci` et `pnpm run ci:admin`
  depuis TypeScript.

## Décisions techniques additionnelles (mise à jour Phase 0)

### Architecture CLI avec cmd-ts

- **Décision** : Utiliser cmd-ts pour l'interface en ligne de commande
  comme spécifié par l'utilisateur
- **Justification** : Fournit un parsing d'arguments piloté par les types,
  une gestion d'erreur supérieure, et s'aligne sur l'approche
  TypeScript-first
- **Implémentation** : Commande principale unique avec options pour le mode
  admin, le dry-run, et le format de sortie

### Conception de la couche de services

- **PackageJsonService** : Manipulation sûre du JSON avec backup/restore en
  utilisant edit-json-file
- **RegistryService** : Intégration API du registre npm avec filtrage des
  versions stables
- **CiRunnerService** : Exécution de commandes shell via shelljs avec
  gestion correcte des codes de sortie
- **UpgradeOrchestrator** : Coordination du workflow principal implémentant
  les modes fast-path et itératif

### Stratégie de gestion des erreurs

- **Dégradation gracieuse** : Continuer le traitement des autres paquets en
  cas d'échecs individuels
- **Opérations atomiques** : Sauvegarde avant modification, restauration en
  cas d'échec CI
- **Journalisation structurée** : Rapport clair de progression et d'analyse
  des échecs

Phase 0 terminée - passage à la Phase 1.
