# Plan d'Implémentation : Gestion Améliorée de l'État des Dépendances et Rollback

**Branche** : `002-spec-validate-bullet` | **Date** : 2025-09-28 | **Spécification** :
[./spec.md](./spec.md) **Entrée** : Spécification de fonctionnalité depuis
`/specs/002-spec-validate-bullet/spec.md`

## Flux d'Exécution (portée de la commande /plan)

```
1. Charger la spécification de fonctionnalité depuis le chemin d'entrée
   → Si non trouvée : ERREUR "Aucune spécification de fonctionnalité à {chemin}"
2. Remplir le Contexte Technique (scanner pour NEEDS CLARIFICATION)
   → Détecter le Type de Projet depuis la structure du système de fichiers ou le contexte (web=frontend+backend, mobile=app+api)
   → Définir la Décision de Structure basée sur le type de projet
3. Remplir la section Vérification Constitutionnelle basée sur le contenu du document constitutionnel.
4. Évaluer la section Vérification Constitutionnelle ci-dessous
   → Si des violations existent : Documenter dans Suivi de Complexité
   → Si aucune justification possible : ERREUR "Simplifier l'approche d'abord"
   → Mettre à jour Suivi de Progrès : Vérification Constitutionnelle Initiale
5. Exécuter Phase 0 → research.md
   → Si NEEDS CLARIFICATION subsistent : ERREUR "Résoudre les inconnus"
6. Exécuter Phase 1 → contrats, data-model.md, quickstart.md, fichier modèle spécifique à l'agent (par ex., `CLAUDE.md` pour Claude Code, `.github/copilot-instructions.md` pour GitHub Copilot, `GEMINI.md` pour Gemini CLI, `QWEN.md` pour Qwen Code ou `AGENTS.md` pour opencode).
7. Réévaluer la section Vérification Constitutionnelle
   → Si nouvelles violations : Refactoriser la conception, retourner à Phase 1
   → Mettre à jour Suivi de Progrès : Vérification Constitutionnelle Post-Conception
8. Planifier Phase 2 → Décrire l'approche de génération de tâches (NE PAS créer tasks.md)
9. ARRÊT - Prêt pour la commande /tasks

## Approche de Génération de Tâches Phase 2

### Stratégie de Décomposition des Tâches
La commande `/tasks` générera des tâches d'implémentation basées sur les conclusions de recherche, le modèle de données et les contrats de Phase 1. Les tâches seront organisées par :

1. **Développement de Services Core** : Services DependencyStateManager, PackageManagerAdapter
2. **Amélioration CLI** : Interface de commande mise à jour supportant la configuration simplifiée de scripts
3. **Gestion d'État** : Opérations atomiques avec mécanismes de rollback
4. **Tests d'Intégration** : Scripts supplémentaires positionnés pour la validation de tests
5. **Documentation** : Guides d'implémentation et documentation API

### Priorisation des Tâches
- **Priorité 1** : Fondation de capture d'état et rollback (bloquant pour toutes les autres fonctionnalités)
- **Priorité 2** : Abstraction du gestionnaire de packages et logique de détection automatique
- **Priorité 3** : Implémentation de configuration simplifiée de scripts
- **Priorité 4** : Mises à jour de l'interface CLI et tests d'intégration
- **Priorité 5** : Documentation et gestion des cas limites

### Intégration de Conformité Constitutionnelle
Chaque tâche inclura des étapes de validation constitutionnelle assurant :
- Types union de chaînes pour toutes les options de configuration
- Validation de sécurité de rollback dans les opérations de gestion d'état
- Approche TDD avec développement de tests contractuels en premier

Cette approche assure une implémentation systématique tout en maintenant les principes constitutionnels établis dans la phase de recherche.

**IMPORTANT** : La commande /plan S'ARRÊTE à l'étape 7. Les Phases 2-4 sont exécutées
par d'autres commandes :

- Phase 2 : La commande /tasks crée tasks.md
- Phase 3-4 : Exécution d'implémentation (manuelle ou via outils)

## Résumé

Système de gestion améliorée de l'état des dépendances avec capacités de rollback pour
l'outil CLI upgrade-npm-package. Le système capture les états initiaux des dépendances (y compris les signes semver),
effectue des mises à niveau atomiques avec validation de scripts configurable, et rollback automatiquement en cas d'échecs. Principales modifications techniques : simplification de la configuration de scripts (l'utilisateur fournit uniquement les scripts test et build,
les scripts d'installation sont auto-générés depuis le type de gestionnaire de packages),
repositionnement des scripts supplémentaires pour les tests plutôt que la configuration, et
suivi amélioré de l'état des dépendances avec sécurité de rollback.

## Contexte Technique

**Langage/Version** : TypeScript 5.x avec Node.js >= 22 (ESM-first)  
**Dépendances Principales** : cmd-ts, execa, utilitaires de parsing semver  
**Stockage** : Gestion d'état en mémoire pendant le processus de mise à niveau (pas de
stockage persistant)  
**Tests** : Vitest (tests unitaires et d'intégration avec approche TDD)  
**Plateforme Cible** : Outil CLI Node.js supportant npm, yarn, pnpm, bun  
**Type de Projet** : Projet de bibliothèque unique - outil CLI avec architecture par
couche de services  
**Objectifs de Performance** : Capture d'état < 5 secondes, opérations de rollback < 30
secondes  
**Contraintes** : Opérations atomiques uniquement, sécurité de rollback obligatoire,
conformité constitutionnelle  
**Échelle/Portée** : Outil CLI traitant les dépendances typiques de projets Node.js
(10-500 packages)

**Détails d'Entrée Utilisateur** :

- Configuration de scripts simplifiée : L'utilisateur fournit uniquement les scripts test et build
- Les scripts d'installation doivent être auto-générés basés sur le type de gestionnaire de packages détecté
- Scripts supplémentaires repositionnés pour des fins de test au sein de
  la méthode upgradeWithRollback (pas de configuration)
- Mécanisme de rollback amélioré avec suivi d'état des dépendances incluant
  les signes semver

## Vérification Constitutionnelle

_PORTE : Doit passer avant la recherche Phase 0. Re-vérifier après la conception Phase 1._

**✅ Évaluation de Conformité Constitutionnelle** :

- **Principe I (pnpm-first, Node 20+, ESM-first)** : ✅ PASS - TypeScript
  5.x avec Node.js >= 20, architecture ESM-first
- **Principe II (Dépendances runtime minimales)** : ✅ PASS - cmd-ts, execa,
  semver sont des dépendances nécessaires minimales
- **Principe VI (Développement Piloté par les Tests)** : ✅ PASS - Approche TDD
  spécifiée pour toutes les nouvelles fonctionnalités
- **Principe VII (Sécurité de Rollback & Opérations Atomiques)** : ✅ PASS - Exigence de fonctionnalité core, capacités de rollback complètes avec
  DependencyStateManager
- **Principe VIII (Types Union de Chaînes sur Énums)** : ✅ PASS - Types de gestionnaire de packages comme unions de chaînes ('npm' | 'yarn' | 'pnpm' | 'bun')
- **Exigences CLI** : ✅ PASS - Mode amélioré avec scripts configurables,
  rollback activé par défaut

**Aucune violation détectée** - La fonctionnalité s'aligne sur les principes constitutionnels.

## Structure du Projet

### Documentation (cette fonctionnalité)

```
specs/[###-feature]/
├── plan.md              # Ce fichier (sortie de commande /plan)
├── research.md          # Sortie Phase 0 (/plan command)
├── data-model.md        # Sortie Phase 1 (/plan command)
├── quickstart.md        # Sortie Phase 1 (/plan command)
├── contracts/           # Sortie Phase 1 (/plan command)
└── tasks.md             # Sortie Phase 2 (/tasks command - NON créé par /plan)
```

### Code Source (racine du dépôt)

<!--
  ACTION REQUISE : Remplacer l'arborescence placeholder ci-dessous par la mise en page concrète
  pour cette fonctionnalité. Supprimer les options inutilisées et développer la structure choisie avec
  des chemins réels (par ex., apps/admin, packages/something). Le plan livré ne doit pas
  inclure d'étiquettes Option.
-->

_Basé sur Constitution v1.2.0 - Voir `/memory/constitution.md`_

**Structure de Projet Unique (Sélectionnée)** :

```
src/
├── models/          # Définitions de types, interfaces
├── services/        # Logique métier core des services
├── cli/            # Interface en ligne de commande
└── libs/           # Bibliothèques utilitaires

tests/
├── contract/       # Tests de validation de contrats API
 # Plan d'implémentation : Gestion d'état améliorée des dépendances et rollback

 **Branche** : `002-spec-validate-bullet` | **Date** : 2025-09-28 | **Spec** : [./spec.md](./spec.md)  **Entrée** : spécification de la fonctionnalité depuis `/specs/002-spec-validate-bullet/spec.md`

 ## Flux d'exécution (périmètre de la commande /plan)

 ```
 1. Charger la spécification de la fonctionnalité depuis le chemin d'entrée
    → Si non trouvée : ERREUR « No feature spec at {path} »
 2. Remplir le Contexte Technique (rechercher les NEEDS CLARIFICATION)
    → Détecter le type de projet depuis la structure des fichiers ou le contexte (web=frontend+backend, mobile=app+api)
    → Définir la décision de structure en fonction du type de projet
 3. Remplir la section Constitution Check d'après le document de constitution
 4. Évaluer la section Constitution Check ci‑dessous
    → Si des violations existent : Documenter dans Complexity Tracking
    → Si aucune justification possible : ERREUR « Simplify approach first »
    → Mettre à jour le suivi de progression : Initial Constitution Check
 5. Exécuter la Phase 0 → `research.md`
    → Si des NEEDS CLARIFICATION persistent : ERREUR « Resolve unknowns »
 6. Exécuter la Phase 1 → `contracts`, `data-model.md`, `quickstart.md`, fichier template spécifique à l'agent (ex. `CLAUDE.md` pour Claude Code, `.github/copilot-instructions.md` pour GitHub Copilot, `GEMINI.md` pour Gemini CLI, `QWEN.md` pour Qwen Code ou `AGENTS.md` pour opencode).
 7. Réévaluer la section Constitution Check
    → Si nouvelles violations : Refactoriser la conception, revenir à la Phase 1
    → Mettre à jour le suivi : Post-Design Constitution Check
 8. Planifier la Phase 2 → Décrire l'approche de génération des tâches (NE PAS créer `tasks.md`)
 9. STOP - Prêt pour la commande /tasks
 ```

 ## Approche de génération des tâches (Phase 2)

 ### Stratégie de découpage des tâches
 La commande `/tasks` générera des tâches d'implémentation à partir des résultats de la recherche, du data model et des contrats de la Phase 1. Les tâches seront organisées par :

 1. Développement des services coeur : `DependencyStateManager`, `PackageManagerAdapter`
 2. Amélioration du CLI : interface de commande mise à jour supportant la configuration simplifiée des scripts
 3. Gestion d'état : opérations atomiques avec mécanismes de rollback
 4. Tests d'intégration : scripts additionnels positionnés pour la validation des tests
 5. Documentation : guides d'implémentation et documentation API

 ### Priorisation des tâches
 - **Priorité 1** : Fondations de capture d'état et rollback (bloquant pour les autres fonctionnalités)
 - **Priorité 2** : Abstraction du gestionnaire de paquets et logique d'auto‑détection
 - **Priorité 3** : Implémentation de la configuration simplifiée des scripts
 - **Priorité 4** : Mises à jour de l'interface CLI et tests d'intégration
 - **Priorité 5** : Documentation et gestion des cas limites

 ### Intégration de la conformité constitutionnelle
 Chaque tâche inclura des étapes de validation constitutionnelle garantissant :
 - Types sous forme d'union de chaînes pour toutes les options de configuration
 - Validation de la sécurité du rollback dans les opérations de gestion d'état
 - Approche TDD avec développement des tests avant l'implémentation (contract-first)

 Cette approche garantit une implémentation systématique tout en respectant les principes constitutionnels définis lors de la phase de recherche.

 ```

 **IMPORTANT** : La commande /plan S'ARRÊTE à l'étape 7. Les phases 2–4 sont exécutées par d'autres commandes :

 - Phase 2 : la commande /tasks crée `tasks.md`
 - Phase 3–4 : exécution de l'implémentation (manuelle ou via des outils)

 ## Résumé

 Système de gestion d'état des dépendances amélioré avec capacités de rollback pour l'outil CLI `upgrade-npm-package`. Le système capture l'état initial des dépendances (y compris les opérateurs semver), réalise des mises à jour atomiques avec validation configurable des scripts, et restaure automatiquement en cas d'échec. Changements techniques clés : simplification de la configuration des scripts (l'utilisateur fournit uniquement `test` et `build` ; les scripts d'installation sont générés automatiquement selon le type de gestionnaire de paquets détecté), repositionnement des scripts additionnels pour les tests plutôt que pour la configuration, et suivi renforcé de l'état des dépendances avec sécurité de rollback.

 ## Contexte technique

 **Langage/Version** : TypeScript 5.x avec Node.js >= 20 (ESM‑first)  
 **Dépendances principales** : `cmd-ts`, `execa`, utilitaires de parsing `semver`  
 **Stockage** : gestion d'état en mémoire pendant le processus d'upgrade (pas de stockage persistant)  
 **Tests** : Vitest (tests unitaires et d'intégration avec approche TDD)  
 **Plateforme cible** : outil CLI Node.js supportant `npm`, `yarn`, `pnpm`, `bun`  
 **Type de projet** : projet de bibliothèque unique - outil CLI avec architecture en couche de services  
 **Objectifs de performance** : capture d'état < 5 secondes, rollback < 30 secondes  
 **Contraintes** : opérations atomiques uniquement, sécurité du rollback obligatoire, conformité constitutionnelle  
 **Échelle/Portée** : outil CLI traitant les dépendances typiques d'un projet Node.js (10–500 paquets)

 **Détails sur l'entrée utilisateur** :

 - Configuration des scripts simplifiée : l'utilisateur fournit uniquement les scripts `test` et `build`
 - Les scripts d'installation doivent être générés automatiquement en fonction du gestionnaire de paquets détecté
 - Les scripts additionnels sont repositionnés pour les tests dans la méthode `upgradeWithRollback` (et non pour le setup)
 - Mécanisme de rollback amélioré avec suivi d'état des dépendances incluant les opérateurs semver

 ## Contrôle de conformité constitutionnelle

 _GATE : Doit être validé avant la Phase 0 research. Re‑vérifier après la Phase 1 design._

 **✅ Évaluation de conformité constitutionnelle** :

 - **Principe I (pnpm‑first, Node 20+, ESM‑first)** : ✅ PASS - TypeScript 5.x avec Node.js >= 20, architecture ESM‑first
 - **Principe II (Dépendances runtime minimales)** : ✅ PASS - `cmd-ts`, `execa`, `semver` sont des dépendances minimales nécessaires
 - **Principe VI (Test‑Driven Development)** : ✅ PASS - approche TDD spécifiée pour toute nouvelle fonctionnalité
 - **Principe VII (Sécurité du rollback & opérations atomiques)** : ✅ PASS - exigence core, capacités de rollback complètes via `DependencyStateManager`
 - **Principe VIII (Unions de chaînes plutôt qu'enums)** : ✅ PASS - types de gestionnaire de paquets en union de chaînes ('npm' | 'yarn' | 'pnpm' | 'bun')
 - **Exigences CLI** : ✅ PASS - mode amélioré avec scripts configurables, rollback activé par défaut

 **Aucune violation détectée** : la fonctionnalité respecte les principes constitutionnels.

 ## Structure du projet

 ### Documentation (cette fonctionnalité)

 ```
 specs/[###-feature]/
 ├── plan.md              # Ce fichier (sortie de la commande /plan)
 ├── research.md          # Sortie Phase 0 (commande /plan)
 ├── data-model.md        # Sortie Phase 1 (commande /plan)
 ├── quickstart.md        # Sortie Phase 1 (commande /plan)
 ├── contracts/           # Sortie Phase 1 (commande /plan)
 └── tasks.md             # Sortie Phase 2 (commande /tasks - NON créée par /plan)
 ```

 ### Code source (racine du dépôt)

 <!--
   ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
   for this feature. Delete unused options and expand the chosen structure with
   real paths (e.g., apps/admin, packages/something). The delivered plan must
   not include Option labels.
 -->

 _Basé sur Constitution v1.2.0 - Voir `/memory/constitution.md`_

 **Structure de projet mono‑paquet (sélectionnée)** :

 ```
 src/
 ├── models/          # Définitions de types, interfaces
 ├── services/        # Services logiques coeur
 ├── cli/             # Interface en ligne de commande
 └── libs/            # Bibliothèques utilitaires

 tests/
 ├── contract/       # Tests de validation de contrat API
 ├── integration/    # Tests de bout en bout
 └── unit/           # Tests isolés
 ```

 **Décision de structure** : la structure mono‑projet a été choisie car il s'agit d'un outil CLI bibliothécaire. La structure existante correspond aux exigences constitutionnelles et aux besoins de la fonctionnalité : couche services pour la logique métier (`DependencyStateManager`, `ScriptExecutionService`), couche CLI pour l'interface utilisateur, et couverture de tests complète (contract, integration, unit).

 ## Phase 0 : Plan et recherche

 1. **Extraire les inconnues** du Contexte Technique ci‑dessus :
    - Pour chaque NEEDS CLARIFICATION → tâche de recherche
    - Pour chaque dépendance → tâche « best practices »
    - Pour chaque intégration → tâche « patterns »

 2. **Générer et dispatcher des agents de recherche** :

 ```

 Pour chaque inconnue dans le Contexte Technique : Tâche : "Research {unknown} for {feature context}" Pour chaque choix technologique : Tâche : "Find best practices for {tech} in {domain}"

 ```

 3. **Consolider les résultats** dans `research.md` en utilisant le format :

 - Decision : [ce qui a été choisi]
 - Rationale : [pourquoi choisi]
 - Alternatives considered : [autres options évaluées]

 **Sortie** : `research.md` avec toutes les NEEDS CLARIFICATION résolues

 ## Phase 1 : Design & Contrats

 _Prérequis : `research.md` terminé_

 1. **Extraire les entités** depuis la spécification → `data-model.md` :

 - Nom de l'entité, champs, relations
 - Règles de validation issues des exigences
 - Transitions d'état si applicable

 2. **Générer les contrats API** depuis les exigences fonctionnelles :

 - Pour chaque action utilisateur → endpoint
 - Utiliser les patterns REST/GraphQL standards
 - Produire le schéma OpenAPI/GraphQL dans `/contracts/`

 3. **Générer les tests de contrat** depuis les contrats :

 - Un fichier de test par endpoint
 - Asserter les schémas requête/response
 - Les tests doivent échouer (pas d'implémentation encore)

 4. **Extraire les scénarios de test** depuis les user stories :

 - Chaque story → scénario de test d'intégration
 - Quickstart test = étapes de validation de la story

 5. **Mettre à jour le fichier agent** de manière incrémentale (opération O(1)) :

 - Exécuter `.specify/scripts/bash/update-agent-context.sh copilot`
   **IMPORTANT** : l'exécuter exactement comme indiqué ci‑dessus. Ne pas ajouter ni supprimer d'arguments.
 - Si existant : n'ajouter que les nouvelles techs depuis le plan courant
 - Préserver les ajouts manuels entre balises
 - Mettre à jour les changements récents (garder les 3 derniers)
 - Rester < 150 lignes pour l'efficacité des tokens
 - Écrire vers la racine du dépôt

 **Sortie** : `data-model.md`, `/contracts/*`, tests échouant, `quickstart.md`, fichier agent spécifique

 ## Phase 2 : Approche de planification des tâches

 _Cette section décrit ce que fera la commande /tasks - NE PAS exécuter
 durant /plan_

 **Stratégie de génération des tâches** :

 - Charger `.specify/templates/tasks-template.md` comme base
 - Générer des tâches à partir des docs de la Phase 1 (contracts, data model, quickstart)
 - Chaque contrat → tâche de test de contrat [P]
 - Chaque entité → tâche de création de modèle [P]
 - Chaque user story → tâche de test d'intégration
 - Tâches d'implémentation pour rendre les tests verts

 **Stratégie d'ordonnancement** :

 - Ordre TDD : tests avant implémentation
 - Ordre de dépendance : modèles avant services avant UI
 - Marquer [P] les exécutions parallèles (fichiers indépendants)

 **Sortie estimée** : 25–30 tâches numérotées et ordonnées dans `tasks.md`

 **IMPORTANT** : Cette phase est exécutée par la commande /tasks, PAS par /plan

 ## Phase 3+ : Implémentation future

 _Ces phases dépassent le périmètre de la commande /plan_

 **Phase 3** : Exécution des tâches (la commande /tasks crée `tasks.md`)  **Phase 4** : Implémentation (exécuter `tasks.md` selon les principes constitutionnels)  **Phase 5** : Validation (exécuter les tests, exécuter `quickstart.md`, validation des performances)

 ## Suivi de complexité

 _Remplir UNIQUEMENT si le Constitution Check révèle des violations qui nécessitent justification_

 | Violation                  | Pourquoi nécessaire | Alternative plus simple rejetée car |
 | -------------------------- | ------------------- | ---------------------------------- |
 | [ex. 4th project]         | [besoin courant]    | [pourquoi 3 projets insuffisants] |
 | [ex. Repository pattern]  | [problème spécifique]| [pourquoi l'accès DB direct est insuffisant] |

 ## Suivi de progression

 _Cette checklist est mise à jour durant le flux d'exécution_

 **Statut des phases** :

 - [x] Phase 0 : Recherche terminée (commande /plan)
 - [ ] Phase 1 : Design terminé (commande /plan)
 - [ ] Phase 2 : Planification des tâches terminée (commande /plan - description seulement)
 - [ ] Phase 3 : Tâches générées (commande /tasks)
 - [ ] Phase 4 : Implémentation terminée
 - [ ] Phase 5 : Validation réussie

 **Statut des gates** :

 - [x] Initial Constitution Check : PASS
 - [ ] Post-Design Constitution Check : PASS
 - [ ] Toutes les NEEDS CLARIFICATION résolues
 - [ ] Écarts de complexité documentés

 ---

 _Basé sur Constitution v1.2.0 - Voir `/memory/constitution.md`_

 ```

