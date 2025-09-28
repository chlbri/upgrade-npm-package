# Tâches : Gestion améliorée de l'état des dépendances et rollback

**Entrée** : Documents de conception de `/specs/002-spec-validate-bullet/`
**Prérequis** : plan.md (requis), research.md, data-model.md,
contracts/, quickstart.md

## Flux d'exécution (principal)

```
1. Charger plan.md depuis le répertoire de fonctionnalité ✅
  → Extraire : TypeScript 5.x, Node.js >= 20, cmd-ts, execa, vitest
  → Structure : Projet unique (outil CLI avec couche de services)
2. Charger les documents de conception ✅ :
  → data-model.md : DependencyState, ScriptConfig, UpgradeOptions, UpgradeResult
  → contracts/openapi.yaml : Contrats API pour la gestion d'état et le rollback
  → research.md : Adaptateurs de gestionnaire de packages, mécanismes de rollback
  → quickstart.md : 5 scénarios de test avec validation de rollback
3. Générer des tâches par catégorie ✅ :
  → Configuration : Types améliorés, modifications de services existants
  → Tests : Tests de contrat, scénarios d'intégration depuis quickstart
  → Noyau : DependencyStateManager, orchestrateur amélioré
  → Intégration : CLI avec 3 scripts requis, flux de rollback
  → Polissage : Tests unitaires, gestion d'erreurs, validation de performance
4. Appliquer les règles de tâches ✅ :
  → Fichiers différents = marquer [P] pour parallèle
  → Services améliorés = séquentiel (mêmes fichiers)
  → Tests avant l'implémentation (TDD)
5. Tâches numérotées T001-T020 ✅
6. Dépendances mappées ✅
7. Exemples d'exécution parallèle inclus ✅
```

## Format : `[ID] [P?] Description`

- **[P]** : Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- Inclure les chemins de fichiers exacts dans les descriptions

## Conventions de chemin

Structure de projet unique (outil CLI) :

- **Noyau** : `src/models/`, `src/services/`, `src/cli/`, `src/lib/`
- **Tests** : `tests/contract/`, `tests/integration/`, `tests/unit/`

## Phase 3.1 : Configuration et définitions de types

- [x] **T001** [P] Types améliorés dans `src/models/types.ts` - Ajouter
    les interfaces DependencyState, ScriptConfig, UpgradeOptions avec des
    types union de chaînes (pas d'enums)
- [x] **T002** [P] Configurer les dépendances du projet - S'assurer que cmd-ts, execa
    sont disponibles pour les fonctionnalités améliorées
- [x] **T003** [P] Mettre à jour la configuration ESLint pour les nouveaux patterns de types et
    les interfaces simplifiées

## Phase 3.2 : Tests d'abord (TDD) ⚠️ DOIT ÊTRE TERMINÉ AVANT 3.3

**CRITIQUE : Ces tests DOIVENT être écrits et DOIVENT ÉCHOUER avant TOUTE
implémentation**

- [x] **T004** [P] Test de contrat de capture d'état des dépendances dans
    `tests/contract/dependency-state.spec.ts` - Tester le contrat API
    captureInitialState depuis la spécification OpenAPI
- [x] **T005** [P] Test de contrat du mécanisme de rollback dans
    `tests/contract/rollback-mechanism.spec.ts` - Tester le contrat API
    rollbackToInitialState
- [x] **T006** [P] Test de contrat d'exécution de script dans
    `tests/contract/script-execution.spec.ts` - Tester le contrat API
    executeScript avec 3 scripts requis
- [x] **T007** [P] Test d'intégration de suivi amélioré des dépendances dans
    `tests/integration/enhanced-dependency-tracking.test.ts` -
    Tests de gestion d'état des dépendances basés sur le système de fichiers
- [x] **T008** [P] Test d'intégration d'exécution de script avec rollback dans
    `tests/integration/script-execution-rollback.test.ts` - Tests de bout en bout
    d'exécution de script et de rollback automatique
- [x] **T009** [P] Test unitaire du gestionnaire d'état des dépendances dans
    `tests/unit/dependency-state-manager.test.ts` - Tests unitaires complets pour
    la classe DependencyStateManager
- [x] **T010** [P] Test unitaire de l'adaptateur de gestionnaire de packages dans
    `tests/unit/package-manager-adapter.test.ts` - Tests pour la couche
    d'abstraction npm/yarn/pnpm/bun
- [x] **T011** [P] Test unitaire du service d'exécution de script dans
    `tests/unit/script-execution.test.ts` - Tests unitaires détaillés pour
    l'exécution de script avec timeout et gestion d'erreurs

## Phase 3.3 : Implémentation noyau (UNIQUEMENT après que les tests échouent)

- [ ] **T012** [P] Service DependencyStateManager dans
    `src/services/dependency-state-manager.ts` - Gestion d'état noyau
    avec méthodes de capture, rollback, nettoyage
- [ ] **T013** Service CiRunnerService amélioré dans `src/services/ci-runner.ts` -
    Ajouter le support de configuration pour 3 scripts requis (testScript, buildScript,
    installScript)
- [ ] **T014** Service PackageJsonService amélioré dans
    `src/services/package-json.ts` - Ajouter la capture/restauration d'état avec
    préservation des signes semver
- [ ] **T015** Orchestrateur UpgradeOrchestrator amélioré dans
    `src/services/upgrade-orchestrator.ts` - Intégrer
    DependencyStateManager et le mécanisme de rollback
- [x] **T016** CLI amélioré dans `src/cli/upgrade.ts` - Ajouter les options requises --test-script,
    --build-script (install-script généré automatiquement depuis le gestionnaire de packages)
- [x] **T017** Rapport amélioré dans `src/lib/report.ts` - Ajouter le statut de rollback
    et le rapport d'erreurs
- [x] **T018** Utilitaires semver améliorés dans `src/lib/semver-utils.ts` - Ajouter
    l'analyse et la préservation des signes semver

## Phase 3.4 : Intégration et gestion d'erreurs

- [x] **T019** Validation des tests d'intégration - Mettre à jour et valider
    les tests d'intégration pour le mécanisme de rollback et les fonctionnalités d'exécution de script
    (12 tests réussis sur 2 fichiers)
- [x] **T020** Mise à jour de la documentation - Compléter README.md, CHANGE_LOG.md,
    et les mises à jour de package.json pour les fonctionnalités améliorées et la fonctionnalité CLI
- [x] **T021** Validation finale - Validation complète de la suite de tests (117
    tests réussis) et vérification de la fonctionnalité CLI

## Dépendances

- Types (T001) avant toutes les tâches d'implémentation (T012-T018)
- Tests de contrat (T004-T006) avant les implémentations correspondantes
- Tests d'intégration (T007-T011) avant l'intégration finale (T019-T020)
- T012 (DependencyStateManager) bloque T015 (UpgradeOrchestrator)
- T013-T014 (Services améliorés) peuvent s'exécuter en parallèle mais avant T015
- T016-T018 (CLI et utils) peuvent s'exécuter en parallèle après T015
- Toute implémentation avant l'intégration (T019-T020)

## Exemples d'exécution parallèle

### Phase 3.1 - Configuration (Tous parallèles)

```bash
# Lancer T001-T003 ensemble :
npx @taskagent/cli "Types améliorés dans src/models/types.ts - Ajouter les interfaces DependencyState, ScriptConfig, UpgradeOptions avec des types union de chaînes"
npx @taskagent/cli "Configurer les dépendances du projet - S'assurer que cmd-ts, execa sont disponibles"
npx @taskagent/cli "Mettre à jour la configuration ESLint pour les nouveaux patterns de types"
```

### Phase 3.2 - Tests de contrat (Tous parallèles)

```bash
# Lancer T004-T006 ensemble :
npx @taskagent/cli "Test de contrat de capture d'état des dépendances dans tests/contract/dependency-state.spec.ts"
npx @taskagent/cli "Test de contrat du mécanisme de rollback dans tests/contract/rollback-mechanism.spec.ts"
npx @taskagent/cli "Test de contrat d'exécution de script dans tests/contract/script-execution.spec.ts"
```

### Phase 3.2 - Tests d'intégration (Tous parallèles)

```bash
# Lancer T007-T011 ensemble :
npx @taskagent/cli "Test d'intégration de scénario de mise à niveau réussie dans tests/integration/successful-upgrade.test.ts"
npx @taskagent/cli "Test d'intégration de scénario de rollback dans tests/integration/rollback-scenario.test.ts"
npx @taskagent/cli "Test d'intégration de configuration de script personnalisé dans tests/integration/custom-scripts.test.ts"
# ... etc pour T009-T011
```

### Phase 3.3 - Services noyau (Parallèles si possible)

```bash
# T012 d'abord (DependencyStateManager) :
npx @taskagent/cli "Service DependencyStateManager dans src/services/dependency-state-manager.ts"

# Puis T013-T014 ensemble :
npx @taskagent/cli "Service CiRunnerService amélioré dans src/services/ci-runner.ts - Ajouter la configuration pour 3 scripts requis"
npx @taskagent/cli "Service PackageJsonService amélioré dans src/services/package-json.ts - Ajouter la capture/restauration d'état"

# Puis T015 (dépend de T012) :
npx @taskagent/cli "Orchestrateur UpgradeOrchestrator amélioré dans src/services/upgrade-orchestrator.ts"

# Enfin T016-T018 ensemble :
npx @taskagent/cli "CLI amélioré dans src/cli/upgrade.ts - Ajouter 3 options de script requises"
npx @taskagent/cli "Rapport amélioré dans src/lib/report.ts - Ajouter le statut de rollback"
npx @taskagent/cli "Utilitaires semver améliorés dans src/lib/semver-utils.ts"
```

## Notes d'implémentation clés

- **Types union de chaînes** : Utiliser `'npm' | 'yarn' | 'pnpm' | 'bun' | 'shell'`
  au lieu d'enums partout
- **3 scripts requis** : testScript, buildScript, installScript doivent tous
  être fournis
- **Architecture simplifiée** : Éviter les hiérarchies de services profondes, se concentrer sur
  l'amélioration des services existants
- **Approche TDD** : Tous les tests de contrat et d'intégration doivent être écrits et
  échouer avant l'implémentation
- **Sécurité de rollback** : Chaque changement d'état doit être atomique avec
  capacité de rollback
- **Objectifs de performance** : Capture d'état < 5 secondes, opérations de rollback <
  30 secondes

## Liste de contrôle de validation

- [ ] Tous les contrats OpenAPI ont des tests correspondants (T004-T006)
- [ ] Tous les scénarios quickstart ont des tests d'intégration (T007-T011)
- [ ] Toutes les entités du modèle de données implémentées (DependencyState, ScriptConfig,
    etc.)
- [ ] Tous les 3 scripts requis supportés dans le CLI (test, build, install)
- [ ] Mécanisme de rollback entièrement implémenté et testé
- [ ] Types union de chaînes utilisés de manière cohérente (pas d'enums)
- [ ] Exigences de performance validées (T020)

## Critères de succès

- Tous les tests passent avec les fonctionnalités améliorées
- 3 scripts requis (test, build, install) configurables via CLI
- Rollback automatique en cas d'échec de script
- Gestion d'état avec préservation des signes semver
- Pas de changements cassants à l'interface CLI existante
- Objectifs de performance atteints selon les spécifications NFR

