<!--
Sync Impact Report
- Version change: none → 1.0.0
- Modified principles: n/a (initial ratification)
- Added sections: Core Principles; Project Constraints; Development Workflow & Quality Gates; Governance
- Removed sections: none
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ updated to reference Constitution v1.0.0
	- .specify/templates/spec-template.md: ✅ reviewed (no constitution-version reference)
	- .specify/templates/tasks-template.md: ✅ reviewed (no constitution-version reference)
	- .specify/templates/agent-file-template.md: ✅ reviewed (no changes required)
- Follow-up TODOs: none
-->

# upgrade-npm-package Constitution

## Core Principles

### I. pnpm-first, Node 20+, ESM-first library

This package is built and maintained as an npm library using pnpm. Runtime
targets MUST support Node.js >= 20. The codebase is ESM-first (package.json
"type":"module"), with CJS output provided for compatibility as needed by
the build.

Rationale: Ensures modern language features, faster installs, and
compatibility with current tooling while keeping consumers unblocked.

### II. Minimal runtime dependencies, zero-cost defaults

Runtime dependencies MUST be kept minimal or zero when possible. Prefer
devDependencies for tooling and build-time features. Optional functionality
MAY use optionalDependencies, but MUST degrade gracefully when not present.

Rationale: Reduces attack surface, improves install speed, and simplifies
maintenance.

### III. Automated upgrades, including optional dependencies

The `upgrade` script uses `pnpm upgrade --latest` and MUST upgrade all
declared dependencies, including `optionalDependencies` when present. After
any upgrade, CI MUST pass (lint, tests, size-limit) before merge.

Rationale: Keeps the library current and secure without drift; optional
features stay compatible.

### IV. Test, lint, and size discipline

All changes MUST include tests (Vitest). ESLint + Prettier formatting MUST
pass. Built artifacts MUST respect the size limit budget (currently 10 KB
per output file) enforced by size-limit. Changes exceeding budget require
explicit justification and a follow-up optimization task before release.

Rationale: Guards quality, regression safety, and consumer performance.

### V. API stability and semantic versioning

Public API changes follow semver. Breaking changes require a MAJOR bump and
migration notes. Feature additions are MINOR, and fixes/chores are PATCH.

Rationale: Predictable releases for consumers.

## Project Constraints

- Package Manager: pnpm
- Language/Module: TypeScript, ESM-first with CJS compatibility via Rollup
- Node Engine: >= 20 (enforced via package.json engines)
- Build: Rollup configuration in `rollup.config.mjs`
- Tests: Vitest (unit and coverage) with helpers from `@bemedev/*`
- Lint/Format: ESLint + Prettier
- Size Budget: size-limit capped at 10 KB per bundle output
- Scripts of record:
  - `build`: clean `lib/` then bundle with Rollup
  - `ci`: offline install, lint, test, format, pretty-quick
  - `upgrade`: `pnpm upgrade --latest` (MUST include optionalDependencies
    when present)
  - `rinit`/`rinit:off`: reinstall/reset workflows

## Development Workflow & Quality Gates

1. Branch, implement, and keep changes scoped and tested.
2. Run `pnpm run ci` locally; fix lint, tests, and formatting.
3. Ensure size-limit passes; if not, justify and plan optimization prior to
   release.
4. Open a PR. Reviewers MUST check compliance with all Core Principles and
   Constraints.
5. For dependency updates (including optionals), ensure no regressions. If
   a regression is found, pin or revert with clear rationale and follow-up
   tasks.

## Governance

- Authority: This Constitution supersedes ad-hoc practices for this
  repository.
- Amendments: Proposed via PR. Each amendment MUST include rationale,
  impact assessment, and, if changing principles, a version bump per policy
  below.
- Versioning (constitution):
  - MAJOR: Backward-incompatible governance/principle removals or
    redefinitions.
  - MINOR: New principle/section added or materially expanded guidance.
  - PATCH: Clarifications, wording, typo fixes, non-semantic refinements.
- Compliance: All PRs MUST include a checklist referencing the Core
  Principles. CI MUST be green. Violations require explicit justification
  and follow-up.

**Version**: 1.0.0 | **Ratified**: 2025-09-27 | **Last Amended**:
2025-09-27
