# Feature Specification: Safe dependency upgrader with fallback

**Feature Branch**: `001-this-lib-will`  
**Created**: 2025-09-27  
**Status**: Draft  
**Input**: User description: "This lib will use edit-json-file package. It
has two parts. First list for all packages installed all newer versions
from npm registry. Second, from the latest version, you will upgrade each
deps from the newest to the last oldest after the installed one. Eventually
you run the script \"ci\" after each iteration, and only if the script not
passing, you will downgrade the to the next. Third the first command is to
run first the script \"ci:admin\", and if it works, you just keep it. No
iteration will be needed."

## Execution Flow (main)

```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines

- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements

- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation

When creating this spec from a user prompt:

1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question]
   for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login
   system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the
   "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing _(mandatory)_

### Primary User Story

As a maintainer, I want a tool that lists newer versions for all installed
dependencies and safely upgrades them while running CI after each attempt,
so that I can keep the project up to date without breaking the build.

### Acceptance Scenarios

1. Given a project with a passing CI and outdated dependencies, When I run
   the “admin” mode (ci:admin first), Then if `pnpm run ci:admin` passes,
   the process finishes with updated deps and no per-version iteration.
2. Given a project with a passing CI and outdated dependencies, When I run
   the iterative upgrade mode, Then the tool lists all available newer
   versions for each installed package from the npm registry.
3. Given the iterative mode and a package with multiple newer versions,
   When the tool tries the newest version first and runs `pnpm run ci`,
   Then if CI fails, it automatically downgrades to the next lower version
   and repeats until a passing version is found or none remain.
4. Given the project has optionalDependencies, When the tool upgrades
   dependencies, Then optionalDependencies are treated the same way as
   normal dependencies (listed, attempted from newest to oldest newer, with
   CI after each attempt).

### Edge Cases

- No newer versions available: iterative flow should report “up to date”
  and exit.
- Pre-releases are excluded: list and attempts MUST ignore prerelease
  versions unless explicitly enabled by a future flag.
- Peer dependency constraints: if CI fails due to peer conflicts, tool MUST
  skip that version and try the next; the tool MUST NOT auto-adjust
  peerDependencies.
- Registry policy: use npmjs.org only; ignore custom workspace .npmrc
  registries for this operation and warn if detected.
- Network failures while fetching versions: tool should retry with backoff
  and surface a clear error if persistent.
- Scope: direct dependencies only; no forced transitive upgrades.
  Incidental lockfile changes are acceptable, but no overrides/resolutions
  are applied.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST list, for every installed dependency
  (dependencies, devDependencies, optionalDependencies), all newer versions
  available from the npm registry relative to the currently
  installed/declared version.
- **FR-002**: System MUST support an “admin” fast path: run
  `pnpm run ci:admin` first; if it passes, keep the resulting state and
  exit without per-version iteration.
- **FR-003**: In iterative mode, for each dependency with newer versions,
  the system MUST attempt upgrades starting from the newest version down to
  the oldest version that is still newer than the installed one.
- **FR-004**: After each attempted upgrade, the system MUST run
  `pnpm run ci`. If CI passes, the upgrade is accepted; if it fails, the
  system MUST revert to the previous state for that package and try the
  next version down.
- **FR-005**: The system MUST persist successful upgrades in `package.json`
  and lockfile; if all newer versions fail CI, the dependency MUST remain
  unchanged and be clearly reported.
- **FR-006**: The system MUST use `edit-json-file` to apply JSON edits to
  `package.json` atomically and reliably.
- **FR-007**: The system SHOULD print a summary report: upgraded packages,
  skipped packages (with reasons), and any remaining outdated packages.
- **FR-008**: The system MUST respect the project’s package manager (pnpm)
  and run installs as needed to sync lockfile before running CI.
- **FR-009**: The system MUST exclude prerelease versions from both listing
  and iterative attempts (stable-only policy), unless a dedicated option is
  introduced to allow prereleases.
- **FR-010**: The system MUST query and upgrade against the default npm
  registry (npmjs.org) only, ignoring custom registries in .npmrc for the
  scope of this operation; if a custom registry is detected, the system
  MUST emit a warning in the summary report.
- **FR-011**: On CI failure due to peer dependency constraints, the system
  MUST revert the attempted upgrade and try the next lower version; it MUST
  NOT modify peerDependencies automatically, and MUST report the conflict.
- **FR-012**: On accepted upgrade, the system MUST preserve the existing
  semver operator in package.json (e.g., ^ or ~) and update the minimal
  version accordingly; it MUST NOT pin exact versions unless explicitly
  configured by a future option.
- **FR-013**: Upgrade scope MUST be limited to direct dependencies listed
  in package.json (dependencies, devDependencies, optionalDependencies).
  The tool MUST NOT force transitive upgrades via overrides/resolutions.
  Incidental transitive updates arising from lockfile refresh are
  acceptable.

### Non-Functional Requirements

- **NFR-001**: Changes MUST comply with repository Constitution
  (pnpm-first, minimal deps, tests/lint/size-limit passing).
- **NFR-002**: Logs MUST be clear and actionable; failures must include the
  dependency and version that failed.
- **NFR-003**: The tool MUST be idempotent: re-running after a successful
  upgrade should not reattempt already-accepted versions.

### Key Entities _(include if feature involves data)_

- **Dependency**: name, section (dep/dev/optional), current version,
  available newer versions [v_newest … v_oldest_newer].
- **Attempt Result**: package name, candidate version, ciStatus
  (pass/fail), reason on failure (e.g., peer conflict, test failure),
  chosen action (accept/revert).

---

## Clarifications

### Session 2025-09-27

- Q: Policy for prereleases during listing and upgrades? → A: A
  (stable-only; exclude prereleases)
- Q: Registry policy for listing and upgrades? → A: A (npmjs.org only)
- Q: Handling of peer dependency conflicts? → A: A (skip to next lower; do
  not auto-adjust peers)
- Q: Version operator policy for accepted upgrades? → A: A (keep operator;
  bump minimal version)
- Q: Upgrade scope for dependencies? → A: A (direct dependencies only)

## Review & Acceptance Checklist

_GATE: Automated checks run during main() execution_

### Content Quality

- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders
- [ ] All mandatory sections completed

### Requirement Completeness

- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status

_Updated by main() during processing_

- [ ] User description parsed
- [ ] Key concepts extracted
- [ ] Ambiguities marked
- [ ] User scenarios defined
- [ ] Requirements generated
- [ ] Entities identified
- [ ] Review checklist passed

---
