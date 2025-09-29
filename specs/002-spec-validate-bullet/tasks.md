# Tâches d'implémentation - Gestion améliorée de l'état des dépendances

**Fonctionnalité** : 002-spec-validate-bullet  
**Date** : 2025-01-12  
**Source** : Documents de conception analysés
(/specs/002-spec-validate-bullet/)

## Vue d'ensemble de l'implémentation

Cette liste de tâches est générée à partir de l'analyse complète des
documents de conception :

- **plan.md** : Architecture TypeScript 5.x + Node.js >= 22, configuration
  3-scripts (test/build/lint)
- **data-model.md** : Interfaces DependencyState, ScriptConfig,
  UpgradeOptions étendues
- **contracts/openapi.yaml** : API endpoints pour gestion d'état et
  rollback
- **research.md** : Adaptateurs multi-gestionnaires, mécanismes de rollback
  atomique
- **quickstart.md** : 5 scénarios de validation avec auto-détection et
  rollback

## Règles d'exécution

**Format** : `[ID] [P?] Description`

- **[P]** = Peut s'exécuter en parallèle (fichiers différents, pas de
  dépendances partagées)
- **Séquentiel** = Modification du même fichier ou dépendance forte
- **TDD** = Tests avant implémentation pour tous les composants core

## Configuration et fondations

- [x] **T001** [P] Configuration TypeScript 5.x - Valider tsconfig.json
      pour Node.js >= 22 avec moduleResolution "Node" et support ESM
- [x] **T002** [P] Extension interfaces dans `src/models/types.ts` -
      Ajouter `lintScript` à UpgradeOptions, étendre DependencyState avec
      opérateurs semver
- [x] **T003** [P] Mettre à jour la configuration ESLint pour les nouveaux
      patterns de types et les interfaces simplifiées

## Tests et validation (TDD - Tests déjà implémentés)

- [x] **T003** [P] Tests de contrat OpenAPI dans
      `tests/contract/openapi.spec.ts` - Valider endpoints POST
      /dependencies/capture, POST /dependencies/rollback, GET
      /dependencies/status selon contrat OpenAPI 3.1.0
- [x] **T004** [P] Tests unitaires interfaces étendues dans
      `tests/unit/models.test.ts` - Valider UpgradeOptions avec lintScript,
      DependencyState avec opérateurs semver, ScriptConfig avec timeout
- [x] **T005** [P] Tests détection gestionnaire de paquets dans
      `tests/unit/package-manager-detection.test.ts` - Tests auto-détection
      npm/yarn/pnpm/bun via fichiers lock, fallback npm par défaut

## Implémentation services principaux

- [x] **T006** [P] Service DependencyStateManager dans
      `src/services/dependency-state-manager.ts` - Gestion d'état central
      avec captureState(), rollback(), validation intégrité, Map<string,
      DependencyState> en mémoire
- [x] **T007** [P] Adaptateur PackageManagerAdapter dans
      `src/services/package-manager-adapter.ts` - Interface abstraction +
      implémentations NpmAdapter, YarnAdapter, PnpmAdapter, BunAdapter avec
      factory pattern
- [x] **T008** Extension UpgradeOrchestrator dans
      `src/services/upgrade-orchestrator.ts` - Intégrer
      DependencyStateManager, arrêt sur échec (test→build→lint), rollback
      automatique sur échec script
- [x] **T009** Extension CLI upgrade dans `src/cli/upgrade.ts` - Ajouter
      option --lint-script, valider 3 scripts obligatoires, validation
      format JSON, gestion erreur claire, option --verbose

## Tests d'intégration complets

- [x] **T010** [P] Tests intégration workflow dans
      `tests/integration/complete-workflow.test.ts` - Scénarios: succès
      complet, échec test/build/lint avec rollback, préservation opérateurs
      semver
- [x] **T011** [P] Tests performance dans
      `tests/integration/performance.test.ts` - Capture état <5s, rollback
      <30s, projets 10/100/500 dépendances, gestion mémoire, timeout
      scripts
- [x] **T012** [P] Tests compatibilité multi-gestionnaires dans
      `tests/integration/multi-package-manager.test.ts` - Workflow complet
      npm/yarn/pnpm/bun, migration entre gestionnaires

## Finition et optimisation

- [ ] **T013** [P] Documentation mise à jour dans `README.md`, guide
      migration, exemples configuration - Refléter changements 3-scripts,
      guide migration v2→v3, exemples chaque gestionnaire, API
      DependencyStateManager, troubleshooting rollbacks
- [ ] **T014** Optimisations finales dans `src/` - Optimiser imports ESM,
      logging structuré (debug/info/warn/error), cache intelligent états
      fréquents, audit sécurité dépendances
- [ ] **T015** Tests régression et validation finale - Suite complète,
      compatibilité Node.js 20/21/22, backward compatibility, test charge
      CI/CD, validation critères acceptance spec.md

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
## Dépendances et ordre d'exécution

**Dépendances critiques** :
- T001, T002 → Fondations pour toutes les autres tâches
- T003, T004, T005 → Tests TDD avant implémentations correspondantes
- T006, T007 → Services principaux indépendants (parallèle possible)
- T008 → Dépend de T006 (DependencyStateManager), peut être parallèle avec T007
- T009 → Dépend de T008 (UpgradeOrchestrator étendu)
- T010, T011, T012 → Tests intégration indépendants (parallèle)
- T013 → Peut être parallèle avec T014, T015
- T014 → Dépend de l'implémentation complète (T006-T009)
- T015 → Validation finale, dépend de tous

**Exécution recommandée par phase** :
1. **Setup** : T001, T002 (séquentiel)
2. **Tests TDD** : T003, T004, T005 (parallèle)
3. **Core Services** : T006, T007 (parallèle) → T008 → T009
4. **Integration Tests** : T010, T011, T012 (parallèle)
5. **Polish** : T013 parallèle avec T014 → T015

## Méta-informations d'implémentation

**Technologies** : TypeScript 5.x, Node.js >= 22, cmd-ts, execa, Vitest
**Architecture** : CLI tool avec couches de services, ESM-first
**Patterns** : DependencyStateManager (central state), PackageManagerAdapter (abstraction), Factory pattern (PM detection)
**Performance** : Capture état <5s, rollback <30s, gestion mémoire optimisée

**Points de validation critiques** :
- Après T005 : Tous les tests TDD échouent (comportement attendu)
- Après T009 : CLI fonctionnel avec 3-scripts, rollback opérationnel
- Après T012 : Support multi-gestionnaires validé
- Après T015 : Feature complète, prête pour release

## Notes d'implémentation

**3-scripts obligatoires** : testScript, buildScript, lintScript (user-provided)
**Scripts auto-générés** : installScript (détecté depuis gestionnaire de paquets)
**Arrêt sur échec** : test → build → lint, rollback automatique si échec
**Opérateurs semver** : Préservation ^, ~, >=, exact dans package.json
**Types** : Union strings `'npm'|'yarn'|'pnpm'|'bun'` (pas d'enums)

## Critères de succès

- [ ] Interface CLI accepte et valide 3 scripts obligatoires (test, build, lint)
- [ ] Auto-détection gestionnaire de paquets fonctionnelle (npm/yarn/pnpm/bun)
- [ ] Mécanisme de rollback restaure état initial exact en cas d'échec
- [ ] Préservation opérateurs semver dans package.json après upgrade/rollback
- [ ] Performance : capture état <5s, rollback <30s validés
- [ ] Suite de tests complète : tous les scénarios quickstart couverts
- [ ] Backward compatibility : projets existants fonctionnent sans modification
- [ ] Documentation mise à jour : guide migration, exemples, troubleshooting

Cette planification complète de 15 tâches suit l'approche TDD, respecte les dépendances critiques et optimise l'exécution parallèle pour une implémentation efficace de la gestion améliorée de l'état des dépendances avec support 3-scripts et rollback automatique.

- Tous les tests passent avec les fonctionnalités améliorées
- 3 scripts requis (test, build, install) configurables via CLI
- Rollback automatique en cas d'échec de script
- Gestion d'état avec préservation des signes semver
- Pas de changements cassants à l'interface CLI existante
- Objectifs de performance atteints selon les spécifications NFR

```
