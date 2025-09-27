# Tasks: Safe dependency upgrader with fallback

**Input**: Design documents from `/specs/001-this-lib-will/`
**Prerequisites**: plan.md (required), research.md, data-model.md,
contracts/

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Extracted: TypeScript 5.x, Node >= 20, cmd-ts CLI, edit-json-file, semver, shelljs
2. Load optional design documents: ✅
   → data-model.md: Dependency, AttemptResult, SummaryReport entities
   → contracts/openapi.yaml: CLI tool contracts with 3 main operations
   → research.md: Technical decisions and architecture with cmd-ts integration
   → quickstart.md: Admin fast-path and iterative scenarios
3. Generate tasks by category: ✅
   → Setup: TypeScript project, dependencies, linting
   → Tests: contract tests, integration tests (TDD)
   → Core: models, services, CLI commands with cmd-ts
   → Integration: orchestrator, error handling
   → Polish: unit tests, performance, docs
4. Apply task rules: ✅
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...) ✅
6. Generate dependency graph ✅
7. Create parallel execution examples ✅
8. Validate task completeness: ✅
   → All contracts have tests ✅
   → All entities have models ✅
   → cmd-ts CLI implementation included ✅
```

## Format: `[ID] [P?] Description`

- [P]: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Phase 3.1: Setup

- [ ] T001 Ensure repo scripts and configs support feature
  - Verify scripts in `package.json`: `ci`, `ci:admin`
  - Verify TypeScript, Vitest, ESLint/Prettier, Rollup setup
- [ ] T002 [P] Add typed runtime deps for implementation
  - Add `edit-json-file`, `semver`, `shelljs`, `cmd-ts`
  - Add typings: `@types/shelljs`, `@types/semver`, `@types/edit-json-file`
- [ ] T003 [P] Prepare source and test directories
  - Create `src/cli/`, `src/services/`, `src/models/`, `src/lib/`
  - Create `tests/unit/`, `tests/integration/`, `tests/contract/`
- [ ] T004 Configure lint rules for new folders
  - Ensure `eslint.config.mjs` covers `src/**` and `tests/**`

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

- [ ] T005 [P] Contract test: OpenAPI conformance
  - Validate `contracts/openapi.yaml` structure and basic invariants
  - Create `tests/contract/openapi.spec.ts` to parse and assert required
    fields (version, paths if any)
- [ ] T006 [P] Unit test: data models from `data-model.md`
  - Create `tests/unit/models.test.ts` validating `Dependency`,
    `AttemptResult`, `SummaryReport` shapes
- [ ] T007 [P] Unit test: semver operator preservation
  - Create `tests/unit/semver-policy.test.ts` asserting operator (^/~)
    retained while min version bumps
- [ ] T008 [P] Unit test: prerelease exclusion and registry policy
  - Create `tests/unit/registry-policy.test.ts` ensuring prereleases
    filtered and npmjs.org enforced
- [ ] T009 [P] Unit test: peer conflict skip logic
  - Create `tests/unit/peer-policy.test.ts` asserting “skip to next lower”
    behavior and no auto-adjust
- [ ] T010 [P] Integration test: fast-path admin flow from quickstart
  - Create `tests/integration/fastpath.test.ts` simulating `ci:admin` green
    → exit early
- [ ] T011 [P] Integration test: iterative per-dependency upgrades
  - Create `tests/integration/iterative-upgrade.test.ts` covering
    newest→older attempts, revert on fail, persist on pass, and summary
    report
  - Use a localized inner npm package fixture (generated under
    `tests/fixtures/fastpath/` and `tests/fixtures/iterative/`) with its
    own package.json (no monorepo). Install with pnpm in test setup.

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] T012 [P] Define TypeScript models/interfaces
  - Add `src/models/types.ts` for `Dependency`, `AttemptResult`,
    `SummaryReport`
- [ ] T013 [P] Semver utilities
  - Add `src/lib/semver-utils.ts` to preserve operator and compute next
    candidates from available versions
- [ ] T014 [P] Registry and versions listing service
  - Add `src/services/registry.ts` to list newer stable versions from
    npmjs.org (can be mocked in tests)
- [ ] T015 [P] Package.json edit service
  - Add `src/services/package-json.ts` using `edit-json-file` to bump and
    restore versions across sections (deps/dev/optional)
- [ ] T016 [P] CI runner service
  - Add `src/services/ci-runner.ts` using `shelljs` to run `pnpm run ci`
    and `pnpm run ci:admin`
- [ ] T017 Orchestrator: fast-path + iterative upgrade
  - Add `src/services/upgrade-orchestrator.ts` implementing the flow per
    spec and returning `SummaryReport`
- [ ] T018 CLI entry with cmd-ts integration
  - Add `src/cli/upgrade.ts` using cmd-ts for type-safe argument parsing
  - Support flags: --admin, --dry-run, --verbose, --working-dir
  - Keep within size-limit budget

## Phase 3.4: Integration

- [ ] T019 Logging and reporting utilities
  - Add `src/lib/report.ts` to format and print `SummaryReport`; wire into
    orchestrator/CLI

## Phase 3.5: Polish

- [ ] T020 [P] Unit tests for utilities and services
  - Add tests in `tests/unit/` for semver-utils, package-json service,
    registry mock, ci-runner mock
- [ ] T021 [P] Update docs
  - Update `README.md` usage and add a brief
    `specs/001-this-lib-will/contracts/cli.md` contract for CLI flags/exit
    codes
- [ ] T022 [P] Size-limit and lint pass
  - Ensure bundle files stay <10 KB and lint passes
- [ ] T023 CI matrix update (if needed)
  - Ensure CI jobs cover Node 20 and pnpm; include running new tests
- [x] T024 [P] Unit test: SummaryReport shape and content
  - Create `tests/unit/report.test.ts` asserting
    upgraded/skipped/remainingOutdated/warnings present and correctly
    populated
- [x] T025 [P] Unit test: Idempotence
  - Create `tests/unit/idempotence.test.ts` ensuring reruns skip
    already-accepted upgrades
- [x] T026 [P] Unit test: Logs clarity
  - Create `tests/unit/logs.test.ts` asserting log messages include
    dependency and version context on failures

## Dependencies

- Setup (T001-T004) before Tests and Core
- Tests (T005-T011) before Core (T012-T018)
- Models (T012) before services/orchestrator (T015-T017)
- Semver utils (T013) before orchestrator (T017)
- CI Runner (T016) before orchestrator (T017)
- Implementation before Polish (T020-T023)

## Parallel Example

```
# Launch T006-T011 together (independent files):
Task: "Unit test models in tests/unit/models.test.ts"
Task: "Unit test semver policy in tests/unit/semver-policy.test.ts"
Task: "Unit test registry policy in tests/unit/registry-policy.test.ts"
Task: "Unit test peer policy in tests/unit/peer-policy.test.ts"
Task: "Integration fast-path in tests/integration/fastpath.test.ts"
Task: "Integration iterative upgrade in tests/integration/iterative-upgrade.test.ts"
```

## Validation Checklist ✅

- [x] All entities have model tasks (T012 covers Dependency, AttemptResult,
      SummaryReport)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks are independent (different files marked with [P])
- [x] Each task specifies exact file path
- [x] No task modifies the same file as another [P] task
- [x] cmd-ts integration included in CLI task (T018)
- [x] Constitutional compliance maintained (TDD, pnpm-first, size limits)
