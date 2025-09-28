# Implementation Plan: Enhanced Dependency State Management and Rollback

**Branch**: `002-spec-validate-bullet` | **Date**: 2025-09-28 | **Spec**:
[./spec.md](./spec.md) **Input**: Feature specification from
`/specs/002-spec-validate-bullet/spec.md`

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

## Phase 2 Task Generation Approach

### Task Breakdown Strategy
The `/tasks` command will generate implementation tasks based on the research findings, data model, and contracts from Phase 1. Tasks will be organized by:

1. **Core Service Development**: DependencyStateManager, PackageManagerAdapter services
2. **CLI Enhancement**: Updated command interface supporting simplified script configuration
3. **State Management**: Atomic operations with rollback mechanisms
4. **Integration Testing**: Additional scripts positioned for testing validation
5. **Documentation**: Implementation guides and API documentation

### Task Prioritization
- **Priority 1**: State capture and rollback foundation (blocking for all other features)
- **Priority 2**: Package manager abstraction and auto-detection logic
- **Priority 3**: Simplified script configuration implementation
- **Priority 4**: CLI interface updates and integration testing
- **Priority 5**: Documentation and edge case handling

### Constitutional Compliance Integration
Each task will include constitutional validation steps ensuring:
- String union types for all configuration options
- Rollback safety validation in state management operations
- TDD approach with contract-first test development

This approach ensures systematic implementation while maintaining the constitutional principles established in the research phase.
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed
by other commands:

- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

Enhanced dependency state management system with rollback capabilities for
the upgrade-npm-package CLI tool. The system captures initial dependency
states (including semver signs), performs atomic upgrades with configurable
script validation, and automatically rollbacks on failures. Key technical
changes: script configuration simplification (user provides only test and
build scripts, install scripts auto-generated from package manager type),
repositioning of additional scripts for testing rather than setup, and
enhanced dependency state tracking with rollback safety.

## Technical Context

**Language/Version**: TypeScript 5.x with Node.js >= 20 (ESM-first)  
**Primary Dependencies**: cmd-ts, execa, semver parsing utilities  
**Storage**: In-memory state management during upgrade process (no
persistent storage)  
**Testing**: Vitest (unit and integration tests with TDD approach)  
**Target Platform**: Node.js CLI tool supporting npm, yarn, pnpm, bun  
**Project Type**: Single library project - CLI tool with service layer
architecture  
**Performance Goals**: State capture < 5 seconds, rollback operations < 30
seconds  
**Constraints**: Atomic operations only, rollback safety mandatory,
constitutional compliance  
**Scale/Scope**: CLI tool processing typical Node.js project dependencies
(10-500 packages)

**User Input Details**:

- Script configuration simplified: User provides only test and build
  scripts
- Install scripts must be auto-generated based on detected package manager
  type
- Additional scripts repositioned for testing purposes within
  upgradeWithRollback method (not setup)
- Enhanced rollback mechanism with dependency state tracking including
  semver signs

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**✅ Constitutional Compliance Assessment**:

- **Principle I (pnpm-first, Node 20+, ESM-first)**: ✅ PASS - TypeScript
  5.x with Node.js >= 20, ESM-first architecture
- **Principle II (Minimal runtime dependencies)**: ✅ PASS - cmd-ts, execa,
  semver are minimal necessary dependencies
- **Principle VI (Test-Driven Development)**: ✅ PASS - TDD approach
  specified for all new functionality
- **Principle VII (Rollback Safety & Atomic Operations)**: ✅ PASS - Core
  feature requirement, full rollback capabilities with
  DependencyStateManager
- **Principle VIII (String Union Types over Enums)**: ✅ PASS - Package
  manager types as string unions ('npm' | 'yarn' | 'pnpm' | 'bun')
- **CLI Requirements**: ✅ PASS - Enhanced mode with configurable scripts,
  rollback enabled by default

**No violations detected** - Feature aligns with constitutional principles.

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

_Based on Constitution v1.2.0 - See `/memory/constitution.md`_

**Single Project Structure (Selected)**:

```
src/
├── models/          # Type definitions, interfaces
├── services/        # Core business logic services
├── cli/            # Command-line interface
└── libs/           # Utility libraries

tests/
├── contract/       # API contract validation tests
├── integration/    # End-to-end workflow tests
└── unit/          # Isolated component tests
```

**Structure Decision**: Single project structure selected as this is a CLI
library tool. The existing structure aligns perfectly with constitutional
requirements and feature needs - services layer for business logic
(DependencyStateManager, ScriptExecutionService), CLI layer for user
interface, and comprehensive test coverage across contract, integration,
and unit levels.

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
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach
      only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---

_Based on Constitution v1.2.0 - See `/memory/constitution.md`_

```

```
