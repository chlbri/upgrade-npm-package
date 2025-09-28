# Plan d'implémentation : Outil sûr de mise à niveau des dépendances avec fallback

**Branche** : `001-this-lib-will` | **Date** : 2025-09-27 | **Spec** :
[spec.md](./spec.md) **Entrée** : Spécification de fonctionnalité depuis
`/specs/001-this-lib-will/spec.md`

## Flux d'exécution (portée de la commande /plan)

```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT** : La commande /plan S'ARRÊTE à l'étape 8. Les phases 2-4 sont exécutées
par d'autres commandes :

-- Phase 2 : la commande /tasks crée tasks.md
-- Phase 3-4 : Exécution d'implémentation (manuelle ou via outils)

## Suivi d'avancement

✅ **Étape 1** : Spécification chargée depuis le chemin d'entrée  
✅ **Étape 2** : Contexte technique complété avec intégration de cmd-ts  
✅ **Étape 3** : Vérification constitutionnelle complétée - PASS (aucune violation)  
✅ **Étape 4** : Évaluation constitutionnelle initiale complétée  
✅ **Étape 5** : Phase 0 (research.md) mise à jour avec les décisions cmd-ts  
✅ **Étape 6** : Artéfacts Phase 1 générés - data-model.md, quickstart.md, contracts/openapi.yaml mis à jour  
✅ **Étape 7** : Re-vérification post-design de la Constitution - PASS (conformité maintenue)  
✅ **Étape 8** : Planification Phase 2 décrite ci-dessous

## Planification Phase 2 (Approche de génération des tâches)

La commande /tasks générera tasks.md avec des tâches d'implémentation ordonnées selon le TDD :

### Ordre d'implémentation (TDD requis)

1. **Modèles & Types** : Définir d'abord les interfaces TypeScript
2. **Tests Unitaires** : Écrire des tests qui échouent pour chaque service/utilitaire
3. **Services centraux** : Implémenter PackageJsonService, RegistryService, CiRunnerService
4. **Orchestration** : Implémenter UpgradeOrchestrator avec la logique métier
5. **Interface CLI** : Implémenter le parsing cmd-ts et le point d'entrée principal
6. **Tests d'intégration** : Validation du workflow de bout en bout
7. **Tests de contrat** : Valider contre la spécification OpenAPI

### Testing Strategy

- **Unit Tests**: Mock external dependencies, test service isolation
- **Integration Tests**: Use fixture package.json files, test real
  workflows
- **Contract Tests**: Validate data structures match OpenAPI definitions
- **TDD Enforcement**: All tests written before implementation per
  Constitution Principle VI

Ready for /tasks command execution.

## Résumé

Un outil sûr de mise à niveau des dépendances qui liste les versions plus récentes depuis le registre npm et effectue des mises à jour itératives avec contrôle CI. Fonctionnalités : mode fast-path admin, upgrade itératif en fallback, gestion des conflits de peer dependencies, et reporting complet. Interface CLI utilisant la librairie cmd-ts pour un parsing d'arguments typé.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js >= 20  
**Primary Dependencies**: edit-json-file (typed), semver (typed), shelljs +
@types/shelljs, cmd-ts for CLI  
**Storage**: package.json manipulation, backup files for safe operations  
**Testing**: Vitest (unit/integration/contract), TDD enforced by
constitution  
**Target Platform**: Node.js CLI tool, cross-platform (macOS, Linux,
Windows)  
**Project Type**: single - npm library with CLI interface  
**Performance Goals**: Fast dependency analysis, minimal network requests
to npmjs.org  
**Constraints**: pnpm-first, ESM-first with CJS compatibility, <10KB bundle
size per output  
**Scale/Scope**: Single package.json processing, supports typical Node.js
project dependency counts

**Intégration des arguments utilisateur** : La CLI doit utiliser la lib cmd-ts (parsing d'arguments piloté par les types avec support TypeScript)

## Vérification de la Constitution

_GATE : Doit être passé avant la recherche Phase 0. Re-vérifier après la conception Phase 1._

**Vérification initiale (Pré-Phase 0) :** ✅ **Principe I** (pnpm-first, Node 20+, ESM-first) : Conforme - utilisation de pnpm, Node >= 20, ESM-first avec compatibilité CJS  
✅ **Principe II** (Dépendances minimales) : Conforme - seules les dépendances essentielles : edit-json-file, semver, shelljs, cmd-ts  
✅ **Principe III** (Mises à jour automatisées) : Conforme - cet outil permet les mises à jour automatisées des dépendances  
✅ **Principe IV** (Discipline test, lint, taille) : Conforme - tests Vitest, size-limit <10KB appliqué  
✅ **Principe V** (Stabilité API) : Conforme - versionnement sémantique planifié  
✅ **Principe VI** (TDD) : Conforme - TDD imposé, développement tests-first requis

**Re-vérification Post-Phase 1 :** ✅ **Architecture des services** : La structure projet unique s'aligne avec les contraintes constitutionnelles  
✅ **Conception CLI** : cmd-ts apporte la sécurité de type et une gestion d'erreur supérieure  
✅ **Stratégie de tests** : Tests unitaires/intégration/contrats planifiés pour conformité TDD  
✅ **Système de build** : Rollup configuré pour respecter le budget <10KB  
✅ **Dépendances** : Tous les runtime deps sont justifiés et minimaux (edit-json-file, semver, shelljs, cmd-ts)

**Statut** : PASS - La conception maintient la conformité constitutionnelle. Aucune violation introduite en Phase 1.

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

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

_Based on Constitution v1.1.0 - See `/memory/constitution.md`_

**Structure Decision**: Single project (npm library with CLI)

```
src/
├── models/              # TypeScript interfaces and types
├── services/            # Core business logic services
├── cli/                 # Command-line interface using cmd-ts
└── lib/                 # Shared utilities and helpers

tests/
├── contract/            # API contract tests
├── integration/         # End-to-end workflow tests
├── unit/                # Isolated component tests
└── fixtures/            # Test data and mock packages
```

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)

api/ └── [same as backend above]

ios/ or android/ └── [platform-specific structure: feature modules, UI
flows, platform tests]

```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
```

For each unknown in Technical Context: Task: "Research {unknown} for
{feature context}" For each technology choice: Task: "Find best practices
for {tech} in {domain}"

```

3. **Consolidate findings** in `research.md` using format:
- Decision: [what was chosen]
- Rationale: [why chosen]
- Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
- Entity name, fields, relationships
- Validation rules from requirements
- State transitions if applicable

2. **Generate API contracts** from functional requirements:
- For each user action → endpoint
- Use standard REST/GraphQL patterns
- Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
- One test file per endpoint
- Assert request/response schemas
- Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
- Each story → integration test scenario
- Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
- Run `.specify/scripts/bash/update-agent-context.sh copilot`
  **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
- If exists: Add only NEW tech from current plan
- Preserve manual additions between markers
- Update recent changes (keep last 3)
- Keep under 150 lines for token efficiency
- Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P]
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)
**Phase 4**: Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [ ] Phase 0: Research complete (/plan command)
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [ ] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Basé sur la Constitution v1.1.0 - Voir `/memory/constitution.md`*
```
