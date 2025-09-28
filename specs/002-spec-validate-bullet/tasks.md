# Tasks: Enhanced Dependency State Management and Rollback

**Input**: Design documents from `/specs/002-spec-validate-bullet/`
**Prerequisites**: plan.md (required), research.md, data-model.md,
contracts/, quickstart.md

## Execution Flow (main)

```
1. Load plan.md from feature directory ✅
   → Extract: TypeScript 5.x, Node.js >= 20, cmd-ts, execa, vitest
   → Structure: Single project (CLI tool with service layer)
2. Load design documents ✅:
   → data-model.md: DependencyState, ScriptConfig, UpgradeOptions, UpgradeResult
   → contracts/openapi.yaml: API contracts for state management and rollback
   → research.md: Package manager adapters, rollback mechanisms
   → quickstart.md: 5 test scenarios with rollback validation
3. Generate tasks by category ✅:
   → Setup: Enhanced types, existing service modifications
   → Tests: Contract tests, integration scenarios from quickstart
   → Core: DependencyStateManager, enhanced orchestrator
   → Integration: CLI with 3 required scripts, rollback flow
   → Polish: Unit tests, error handling, performance validation
4. Apply task rules ✅:
   → Different files = mark [P] for parallel
   → Enhanced services = sequential (same files)
   → Tests before implementation (TDD)
5. Numbered tasks T001-T020 ✅
6. Dependencies mapped ✅
7. Parallel execution examples included ✅
```

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions

Single project structure (CLI tool):

- **Core**: `src/models/`, `src/services/`, `src/cli/`, `src/lib/`
- **Tests**: `tests/contract/`, `tests/integration/`, `tests/unit/`

## Phase 3.1: Setup & Type Definitions

- [x] **T001** [P] Enhanced types in `src/models/types.ts` - Add
      DependencyState, ScriptConfig, UpgradeOptions interfaces with string
      union types (no enums)
- [x] **T002** [P] Configure project dependencies - Ensure cmd-ts, execa
      are available for enhanced functionality
- [x] **T003** [P] Update ESLint configuration for new type patterns and
      simplified interfaces

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY
implementation**

- [x] **T004** [P] Contract test dependency state capture in
      `tests/contract/dependency-state.spec.ts` - Test captureInitialState
      API contract from OpenAPI spec
- [x] **T005** [P] Contract test rollback mechanism in
      `tests/contract/rollback-mechanism.spec.ts` - Test
      rollbackToInitialState API contract
- [x] **T006** [P] Contract test script execution in
      `tests/contract/script-execution.spec.ts` - Test executeScript API
      contract with 3 required scripts
- [x] **T007** [P] Integration test enhanced dependency tracking in
      `tests/integration/enhanced-dependency-tracking.test.ts` -
      Filesystem-based dependency state management tests
- [x] **T008** [P] Integration test script execution with rollback in
      `tests/integration/script-execution-rollback.test.ts` - End-to-end
      script execution and automatic rollback tests
- [x] **T009** [P] Unit test dependency state manager in
      `tests/unit/dependency-state-manager.test.ts` - Comprehensive unit
      tests for DependencyStateManager class
- [x] **T010** [P] Unit test package manager adapter in
      `tests/unit/package-manager-adapter.test.ts` - Tests for
      npm/yarn/pnpm/bun abstraction layer
- [x] **T011** [P] Unit test script execution service in
      `tests/unit/script-execution.test.ts` - Detailed unit tests for
      script execution with timeout and error handling

## Phase 3.3: Core Implementation (ONLY after tests are failing)

- [ ] **T012** [P] DependencyStateManager service in
      `src/services/dependency-state-manager.ts` - Core state management
      with capture, rollback, cleanup methods
- [ ] **T013** Enhanced CiRunnerService in `src/services/ci-runner.ts` -
      Add 3 required script configuration support (testScript, buildScript,
      installScript)
- [ ] **T014** Enhanced PackageJsonService in
      `src/services/package-json.ts` - Add state capture/restore with
      semver sign preservation
- [ ] **T015** Enhanced UpgradeOrchestrator in
      `src/services/upgrade-orchestrator.ts` - Integrate
      DependencyStateManager and rollback mechanism
- [x] **T016** Enhanced CLI in `src/cli/upgrade.ts` - Add --test-script,
      --build-script required options (install-script auto-generated from
      package manager)
- [x] **T017** Enhanced reporting in `src/lib/report.ts` - Add rollback
      status and error reporting
- [x] **T018** Enhanced semver utilities in `src/lib/semver-utils.ts` - Add
      semver sign parsing and preservation

## Phase 3.4: Integration & Error Handling

- [x] **T019** Integration tests validation - Update and validate
      integration tests for rollback mechanism and script execution
      features (12 tests passing across 2 files)
- [x] **T020** Documentation update - Complete README.md, CHANGE_LOG.md,
      and package.json updates for enhanced features and CLI functionality
- [x] **T021** Final validation - Comprehensive test suite validation (117
      tests passing) and CLI functionality verification

## Dependencies

- Types (T001) before all implementation tasks (T012-T018)
- Contract tests (T004-T006) before corresponding implementations
- Integration tests (T007-T011) before final integration (T019-T020)
- T012 (DependencyStateManager) blocks T015 (UpgradeOrchestrator)
- T013-T014 (Enhanced services) can run parallel but before T015
- T016-T018 (CLI and utils) can run parallel after T015
- All implementation before integration (T019-T020)

## Parallel Execution Examples

### Phase 3.1 - Setup (All parallel)

```bash
# Launch T001-T003 together:
npx @taskagent/cli "Enhanced types in src/models/types.ts - Add DependencyState, ScriptConfig, UpgradeOptions interfaces with string union types"
npx @taskagent/cli "Configure project dependencies - Ensure cmd-ts, execa are available"
npx @taskagent/cli "Update ESLint configuration for new type patterns"
```

### Phase 3.2 - Contract Tests (All parallel)

```bash
# Launch T004-T006 together:
npx @taskagent/cli "Contract test dependency state capture in tests/contract/dependency-state.spec.ts"
npx @taskagent/cli "Contract test rollback mechanism in tests/contract/rollback.spec.ts"
npx @taskagent/cli "Contract test script execution in tests/contract/script-execution.spec.ts"
```

### Phase 3.2 - Integration Tests (All parallel)

```bash
# Launch T007-T011 together:
npx @taskagent/cli "Integration test successful upgrade scenario in tests/integration/successful-upgrade.test.ts"
npx @taskagent/cli "Integration test rollback scenario in tests/integration/rollback-scenario.test.ts"
npx @taskagent/cli "Integration test custom script configuration in tests/integration/custom-scripts.test.ts"
# ... etc for T009-T011
```

### Phase 3.3 - Core Services (Parallel where possible)

```bash
# T012 first (DependencyStateManager):
npx @taskagent/cli "DependencyStateManager service in src/services/dependency-state-manager.ts"

# Then T013-T014 together:
npx @taskagent/cli "Enhanced CiRunnerService in src/services/ci-runner.ts - Add 3 required script configuration"
npx @taskagent/cli "Enhanced PackageJsonService in src/services/package-json.ts - Add state capture/restore"

# Then T015 (depends on T012):
npx @taskagent/cli "Enhanced UpgradeOrchestrator in src/services/upgrade-orchestrator.ts"

# Finally T016-T018 together:
npx @taskagent/cli "Enhanced CLI in src/cli/upgrade.ts - Add 3 required script options"
npx @taskagent/cli "Enhanced reporting in src/lib/report.ts - Add rollback status"
npx @taskagent/cli "Enhanced semver utilities in src/lib/semver-utils.ts"
```

## Key Implementation Notes

- **String Union Types**: Use `'npm' | 'yarn' | 'pnpm' | 'bun' | 'shell'`
  instead of enums throughout
- **3 Required Scripts**: testScript, buildScript, installScript must all
  be provided
- **Simplified Architecture**: Avoid deep service hierarchies, focus on
  enhanced existing services
- **TDD Approach**: All contract and integration tests must be written and
  failing before implementation
- **Rollback Safety**: Every state change must be atomic with rollback
  capability
- **Performance Targets**: State capture < 5 seconds, rollback operations <
  30 seconds

## Validation Checklist

- [ ] All OpenAPI contracts have corresponding tests (T004-T006)
- [ ] All quickstart scenarios have integration tests (T007-T011)
- [ ] All data model entities implemented (DependencyState, ScriptConfig,
      etc.)
- [ ] All 3 required scripts supported in CLI (test, build, install)
- [ ] Rollback mechanism fully implemented and tested
- [ ] String union types used consistently (no enums)
- [ ] Performance requirements validated (T020)

## Success Criteria

- All tests pass with enhanced functionality
- 3 required scripts (test, build, install) configurable via CLI
- Automatic rollback on script failures
- State management with semver sign preservation
- No breaking changes to existing CLI interface
- Performance targets met per NFR specifications
