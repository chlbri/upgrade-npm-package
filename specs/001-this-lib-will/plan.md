# Implementation Plan: Safe dependency upgrader with fallback

**Branch**: `001-this-lib-will` | **Date**: 2025-09-27 | **Spec**:
[spec.md](./spec.md) **Input**: Feature specification from
`/specs/001-this-lib-will/spec.md`

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

**IMPORTANT**: The /plan command STOPS at step 8. Phases 2-4 are executed
by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Progress Tracking

✅ **Step 1**: Feature spec loaded from input path  
✅ **Step 2**: Technical context filled with cmd-ts requirement
integrated  
✅ **Step 3**: Constitution check completed - PASS (no violations)  
✅ **Step 4**: Initial constitution evaluation completed  
✅ **Step 5**: Phase 0 research.md updated with cmd-ts decisions  
✅ **Step 6**: Phase 1 artifacts generated - data-model.md, quickstart.md,
contracts/openapi.yaml updated  
✅ **Step 7**: Post-design constitution re-check - PASS (compliance
maintained)  
✅ **Step 8**: Phase 2 planning described below

## Phase 2 Planning (Task Generation Approach)

The /tasks command will generate tasks.md with TDD-ordered implementation
tasks:

### Implementation Order (TDD Required)

1. **Models & Types**: Define TypeScript interfaces first
2. **Unit Tests**: Write failing tests for each service/utility
3. **Core Services**: Implement PackageJsonService, RegistryService,
   CiRunnerService
4. **Orchestration**: Implement UpgradeOrchestrator with business logic
5. **CLI Interface**: Implement cmd-ts command parsing and main entry point
6. **Integration Tests**: End-to-end workflow validation
7. **Contract Tests**: Validate against OpenAPI spec

### Testing Strategy

- **Unit Tests**: Mock external dependencies, test service isolation
- **Integration Tests**: Use fixture package.json files, test real
  workflows
- **Contract Tests**: Validate data structures match OpenAPI definitions
- **TDD Enforcement**: All tests written before implementation per
  Constitution Principle VI

Ready for /tasks command execution.

## Summary

A safe dependency upgrader that lists newer versions from npm registry and
performs iterative upgrades with CI gating. Features include: fast-path
admin mode, fallback iterative upgrading, peer dependency conflict
handling, and comprehensive reporting. CLI interface using cmd-ts library
for type-safe argument parsing.

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

**User Argument Integration**: CLI must use lib cmd-ts (type-driven command
line argument parser with TypeScript support)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Initial Check (Pre-Phase 0):** ✅ **Principle I** (pnpm-first, Node 20+,
ESM-first): Compliant - using pnpm, Node >= 20, ESM-first with CJS
compatibility  
✅ **Principle II** (Minimal runtime dependencies): Compliant - only
essential deps: edit-json-file, semver, shelljs, cmd-ts  
✅ **Principle III** (Automated upgrades): Compliant - this tool enables
automated dependency upgrades  
✅ **Principle IV** (Test, lint, size discipline): Compliant - Vitest
testing, size-limit <10KB enforced  
✅ **Principle V** (API stability): Compliant - semantic versioning
planned  
✅ **Principle VI** (TDD): Compliant - TDD enforced, tests-first
development required

**Post-Phase 1 Re-check:** ✅ **Service Architecture**: Single project
structure aligns with constitutional constraints  
✅ **CLI Design**: cmd-ts provides type safety and superior error
handling  
✅ **Testing Strategy**: Unit/integration/contract tests planned for TDD
compliance  
✅ **Build System**: Rollup configuration supports <10KB bundle size
requirement  
✅ **Dependencies**: All runtime deps justified and minimal
(edit-json-file, semver, shelljs, cmd-ts)

**Status**: PASS - Design maintains constitutional compliance. No
violations introduced in Phase 1.

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
*Based on Constitution v1.1.0 - See `/memory/constitution.md`*
```
