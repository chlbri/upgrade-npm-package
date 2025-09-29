# Plan d'Implémentation : Gestion Améliorée de l'État des Dépendances et Rollback

**Branch**: `002-spec-validate-bullet` | **Date**: 2025-09-29 | **Spec**:
[./spec.md](./spec.md) **Input**: Feature specification from
`/Users/chlbri/Documents/github/NODE JS/Librairies bemedev/upgrade-npm-package/specs/002-spec-validate-bullet/spec.md`

## Execution Flow (/plan command scope)

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

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed
by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Résumé

Système de gestion améliorée de l'état des dépendances avec capacités de
rollback pour l'outil CLI upgrade-npm-package. Le système capture l'état
initial des dépendances (y compris les signes semver), effectue des mises à
niveau atomiques avec validation de scripts configurable, et rollback
automatiquement en cas d'échecs. Principales modifications techniques :
support de 3 scripts obligatoires (test, build, lint), scripts
d'installation auto-générés depuis le type de gestionnaire de packages, et
suivi amélioré de l'état des dépendances avec sécurité de rollback.

## Contexte Technique

**Langage/Version** : TypeScript 5.x avec Node.js >= 22 (ESM-first)  
**Dépendances Principales** : cmd-ts, execa, utilitaires de parsing
semver  
**Stockage** : Gestion d'état en mémoire pendant le processus de mise à
niveau (pas de stockage persistant)  
**Tests** : Vitest (tests unitaires et d'intégration avec approche TDD)  
**Plateforme Cible** : Outil CLI Node.js supportant npm, yarn, pnpm, bun  
**Type de Projet** : Projet de bibliothèque unique - outil CLI avec
architecture par couche de services  
**Objectifs de Performance** : Capture d'état < 5 secondes, opérations de
rollback < 30 secondes  
**Contraintes** : Opérations atomiques uniquement, sécurité de rollback
obligatoire, conformité constitutionnelle  
**Échelle/Portée** : Outil CLI traitant les dépendances typiques de projets
Node.js (10-500 packages)

**Détails d'Entrée Utilisateur** :

- Configuration de scripts étendue : L'utilisateur fournit maintenant TROIS
  scripts : --test-script, --build-script, et --lint-script
- Les scripts d'installation DOIVENT être auto-générés basés sur le type de
  gestionnaire de packages détecté
- Scripts supplémentaires repositionnés pour des fins de test au sein de la
  méthode upgradeWithRollback (pas de configuration)
- Mécanisme de rollback amélioré avec suivi d'état des dépendances incluant
  les signes semver

## Vérification Constitutionnelle

_PORTE : Doit passer avant la recherche Phase 0. Re-vérifier après la
conception Phase 1._

**✅ Évaluation de Conformité Constitutionnelle** :

- **Principe I (pnpm-first, Node 22+, ESM-first)** : ✅ PASS - TypeScript
  5.x avec Node.js >= 22, architecture ESM-first
- **Principe II (Dépendances runtime minimales)** : ✅ PASS - cmd-ts,
  execa, semver sont des dépendances nécessaires minimales
- **Principe VI (Développement Piloté par les Tests)** : ✅ PASS - Approche
  TDD spécifiée pour toutes les nouvelles fonctionnalités
- **Principe VII (Sécurité de Rollback & Opérations Atomiques)** : ✅
  PASS - Exigence de fonctionnalité core, capacités de rollback complètes
  avec DependencyStateManager
- **Principe VIII (Types Union de Chaînes sur Énums)** : ✅ PASS - Types de
  gestionnaire de packages comme unions de chaînes ('npm' | 'yarn' | 'pnpm'
  | 'bun')
- **Exigences CLI** : ✅ PASS - Mode amélioré avec scripts configurables
  (test, build, lint), rollback activé par défaut

**Aucune violation détectée** - La fonctionnalité s'aligne sur les
principes constitutionnels avec l'ajout du script lint comme extension
validée.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

_Basé sur Constitution v1.3.0 - Voir `/memory/constitution.md`_

**Structure de Projet Unique (Sélectionnée)** :

```
src/
├── models/          # Définitions de types, interfaces
├── services/        # Services logiques core
├── cli/            # Interface en ligne de commande
└── lib/           # Bibliothèques utilitaires

tests/
├── contract/       # Tests de validation de contrat API
├── integration/    # Tests de bout en bout
└── unit/          # Tests isolés
```

**Décision de Structure** : Structure de projet unique sélectionnée car il
s'agit d'un outil CLI bibliothécaire. La structure existante s'aligne
parfaitement avec les exigences constitutionnelles et les besoins de la
fonctionnalité - couche services pour la logique métier
(DependencyStateManager, ScriptExecutionService), couche CLI pour
l'interface utilisateur, et couverture de tests complète à travers les
niveaux contract, integration, et unit.

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

_Prerequisites: research.md complete_

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
  **IMPORTANT**: Execute it exactly as specified above. Do not add or
  remove any arguments.
- If exists: Add only NEW tech from current plan
- Preserve manual additions between markers
- Update recent changes (keep last 3)
- Keep under 150 lines for token efficiency
- Output to repository root

**Output**: data-model.md, /contracts/\*, failing tests, quickstart.md,
agent-specific file

## Phase 2: Task Planning Approach

_This section describes what the /tasks command will do - DO NOT execute
during /plan_

**Task Generation Strategy**:

- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model,
  quickstart)
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

_These phases are beyond the scope of the /plan command_

**Phase 3**: Task execution (/tasks command creates tasks.md) **Phase 4**:
Implementation (execute tasks.md following constitutional principles)
**Phase 5**: Validation (run tests, execute quickstart.md, performance
validation)

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Progress Tracking

_This checklist is updated during execution flow_

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach
      only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Basé sur Constitution v1.3.0 - Voir `/memory/constitution.md`_

```

```
