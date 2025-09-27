# Phase 0 Research: Safe dependency upgrader with fallback

Date: 2025-09-27 Branch: 001-this-lib-will Input Spec:
/Users/chlbri/Documents/github/NODE JS/Librairies
bemedev/upgrade-npm-package/specs/001-this-lib-will/spec.md

## Unknowns Extracted from Technical Context

- Project Type: Library/CLI in Node.js (TypeScript, pnpm) → inferred from
  repo
- Primary Dependency: edit-json-file → required by FR-006
- Testing: Vitest → per Constitution
- Package Manager: pnpm → per Constitution
- Target Platform: Node.js >= 20 → per Constitution
- Performance Goals: Not explicitly defined → keep operations bounded to
  direct deps
- Constraints: Stable-only versions, npmjs.org registry, no peer auto-fix

All critical ambiguities are addressed in Clarifications of the feature
spec.

## Decisions and Rationale

1. Stable-only (exclude prereleases)

- Decision: Exclude prereleases from listing and attempts.
- Rationale: Aligns with risk-averse upgrade path; reduces CI flakiness.
- Alternatives: Allow prereleases behind a flag (deferred option).

2. Registry policy

- Decision: Use npmjs.org only for queries and upgrades; warn if custom
  .npmrc is detected.
- Rationale: Ensures deterministic behavior; avoids private registry
  surprises.
- Alternatives: Respect .npmrc but increases variability across
  environments.

3. Peer dependency conflicts

- Decision: On CI failure rooted in peer constraints, revert and try the
  next lower version; do not modify peerDependencies automatically.
- Rationale: Prevents cascading changes and unbounded scope.
- Alternatives: Auto-adjust peers (rejected due to scope creep and risk).

4. Semver operator preservation

- Decision: Preserve existing operator (^, ~) and bump minimal version only
  on accepted upgrades.
- Rationale: Keeps consumer intent and update semantics intact.
- Alternatives: Pin exact versions (rejected; violates FR-012 policy).

5. Upgrade scope

- Decision: Direct dependencies only: dependencies, devDependencies,
  optionalDependencies.
- Rationale: Keeps behavior predictable and bounded; transitive updates are
  incidental via lockfile refresh.
- Alternatives: Force overrides/resolutions (rejected as out-of-scope per
  FR-013).

6. Tooling choices

- Decision: Use edit-json-file for atomic package.json edits; use pnpm for
  install/lockfile sync.
- Rationale: Matches FR-006 and Constitution’s pnpm-first policy.
- Alternatives: Manual fs edits or other package managers (rejected by
  constraints).

## Patterns and Best Practices

- Version fetching: Use npm registry APIs; filter prereleases (/-/v1/search
  or package metadata) and sort by semver.
- Backoff strategy: Exponential backoff on transient network errors; clear
  error reporting after retries.
- Idempotency: Cache or detect already-accepted upgrades to skip rework
  when re-running.
- Logging: Structured output summarizing per-dependency attempts and
  outcomes.

## Alternatives Considered

- Auto-fix peerDependencies: Too risky; conflicts with FR-011.
- Include prereleases: Increases breakage; conflicts with clarified policy.
- Transitive upgrades via overrides: Out-of-scope; conflicts with FR-013.

## Outcome

All NEEDS CLARIFICATION resolved per spec; proceed to Phase 1.

---

Based on Constitution v1.1.0

# Research (Phase 0)

Date: 2025-09-27

## Known Decisions (from Clarifications)

- Registry: npmjs.org only
- Prereleases: excluded (stable-only)
- Peer conflicts: do not auto-adjust; skip to next lower
- Version operator: preserve existing (^/~) and bump minimal version
- Scope: direct dependencies only (deps/dev/optional); accept incidental
  lockfile changes

## Open Questions (none blocking)

- Performance metrics: no hard targets; aim for reasonable CI duration

## Notes

- Ensure all imports have TypeScript types. If a library lacks types, add
  corresponding @types package.
- Use shelljs to run `pnpm run ci` and `pnpm run ci:admin` from TypeScript.

## Additional Technical Decisions (Phase 0 Update)

### CLI Architecture with cmd-ts

- **Decision**: Use cmd-ts for command-line interface as specified by user
  requirement
- **Rationale**: Provides type-driven argument parsing, superior error
  handling, and aligns with TypeScript-first approach
- **Implementation**: Single main command with options for admin mode,
  dry-run, and output formatting

### Service Layer Design

- **PackageJsonService**: Safe JSON manipulation with backup/restore using
  edit-json-file
- **RegistryService**: npm registry API integration with stable version
  filtering
- **CiRunnerService**: Shell command execution via shelljs with proper exit
  code handling
- **UpgradeOrchestrator**: Main workflow coordination implementing
  fast-path and iterative modes

### Error Handling Strategy

- **Graceful degradation**: Continue processing remaining packages on
  individual failures
- **Atomic operations**: Backup before changes, restore on CI failure
- **Structured logging**: Clear progress reporting and failure analysis

Phase 0 complete - proceeding to Phase 1 design artifacts.
