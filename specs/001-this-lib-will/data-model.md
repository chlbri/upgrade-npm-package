# Data Model: Safe dependency upgrader with fallback

Based on feature spec and research.

## Entities

### Dependency

- name: string
- section: enum('dependencies' | 'devDependencies' |
  'optionalDependencies')
- currentVersion: string (declared minimal version preserving operator)
- availableNewer: string[] (sorted newest → oldest; stable-only)

Validation:

- name non-empty
- section must be one of allowed values
- currentVersion must be valid semver range

### AttemptResult

- packageName: string
- candidateVersion: string (exact version attempted)
- ciStatus: enum('pass' | 'fail')
- reason?: string (on failure; e.g., peer conflict, test failure)
- action: enum('accept' | 'revert')
- timestamp: ISO string

Validation:

- candidateVersion must be a valid semver version (no prerelease unless
  flagged)
- action correlates with ciStatus (pass→accept, fail→revert)

### SummaryReport

- upgraded: Array<{ name: string; from: string; to: string }>
- skipped: Array<{ name: string; reason: string }>
- remainingOutdated: string[]
- warnings: string[] (e.g., custom registry detected)

Relationships:

- AttemptResult belongs to Dependency
- SummaryReport aggregates results over all dependencies

## Additional Design Details (Phase 1 Update)

### CLI Data Structures (cmd-ts integration)

- **UpgradeOptions**: Command-line arguments parsed by cmd-ts
  - `adminOnly`: boolean (fast-path mode)
  - `dryRun`: boolean (preview mode without changes)
  - `verbose`: boolean (detailed logging)
  - `workingDir`: string (target directory, default: cwd)

### Service Layer Interfaces

- **PackageJsonService**: edit-json-file wrapper with backup/restore
- **RegistryService**: npm API client with stable version filtering
- **CiRunnerService**: shelljs wrapper for CI command execution
- **UpgradeOrchestrator**: Main workflow coordination

### Error Handling

- **Graceful degradation**: Continue processing on individual package
  failures
- **Atomic operations**: All-or-nothing upgrades with automatic rollback
- **Structured logging**: Clear progress and failure reporting

---

Non-functional constraints per Constitution v1.1.0 are satisfied by design.
cmd-ts integration provides type-safe CLI argument parsing as requested.
