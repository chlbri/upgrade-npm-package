# Research: Enhanced Dependency State Management and Rollback

**Date**: 2025-09-28  
**Feature**: Enhanced dependency state management with rollback
capabilities

## Research Findings

### Script Configuration Architecture

**Decision**: Simplified Two-Script Configuration with Auto-Generated
Install Commands  
**Rationale**:

- User cognitive load reduced by requiring only test and build script
  configuration
- Install scripts are highly predictable based on package manager type
- Eliminates configuration errors from mismatched install commands
- Follows principle of "convention over configuration"

**Alternatives considered**:

- Three-script configuration (test, build, install) - Rejected: unnecessary
  cognitive overhead
- Zero configuration with package.json detection - Rejected: insufficient
  flexibility for complex projects
- Full script array configuration - Rejected: over-engineering for common
  use cases

**Implementation Approach**:

```typescript
// Auto-generate install commands based on package manager
const INSTALL_COMMANDS = {
  npm: 'npm install',
  yarn: 'yarn install',
  pnpm: 'pnpm install',
  bun: 'bun install',
} as const;
```

### Additional Scripts Positioning

**Decision**: Additional Scripts for Testing Integration, Not Setup
interface  
**Rationale**:

- Additional scripts should validate upgrade compatibility, not prepare
  environment
- Positioning after upgrade attempts allows testing of actual dependency
  changes
- Aligns with rollback strategy - test integration before committing
  changes
- Provides extensibility for domain-specific validation (e.g., browser
  tests, performance checks)

**Alternatives considered**:

- Pre-upgrade setup scripts - Rejected: doesn't test actual upgrade impact
- Post-rollback cleanup scripts - Rejected: unnecessary complexity
- Parallel script execution - Rejected: sequential execution provides
  clearer failure attribution

**Implementation Approach**:

```typescript
// Within upgradeWithRollback method, after dependency changes but before commit
if (options?.additionalScripts?.length > 0) {
  for (const script of options.additionalScripts) {
    const result = await this.scriptExecutionService.executeScript(
      script,
      this.workingDir,
    );
    if (!result.success) {
      // Trigger rollback with clear failure attribution
      throw new Error(
        `Integration test failed: ${script.command} - ${result.stderr}`,
      );
    }
  }
}
```

### Dependency State Management with Semver Preservation

**Decision**: Enhanced DependencyStateManager with Full Semver Sign
Tracking  
**Rationale**:

- Semver operators (^, ~, exact) encode important compatibility intentions
- Rollback must restore exact original state including operator preferences
- Version bumping must preserve operator semantics during upgrades
- Critical for maintaining project's dependency resolution strategy

**Alternatives considered**:

- Simple version string storage - Rejected: loses semantic operator
  information
- Separate operator/version storage - Rejected: increases state complexity
  unnecessarily
- Package manager lockfile-only rollback - Rejected: doesn't handle
  package.json changes

**Implementation Approach**:

```typescript
interface DependencyState {
  packageName: string;
  version: string; // Clean version without operator
  semverSign: '^' | '~' | 'exact';
  dependencyType:
    | 'dependencies'
    | 'devDependencies'
    | 'optionalDependencies';
}
```

### Package Manager Abstraction

**Decision**: String Union Type-Based Package Manager Adapter  
**Rationale**:

- Constitutional requirement for string unions over enums
- Better JSON serialization and debugging experience
- Cleaner runtime behavior with simplified type checking
- Extensible for future package manager support

**Alternatives considered**:

- Enum-based types - Rejected: violates constitutional principle VIII
- Class-based adapter pattern - Rejected: over-engineering for simple
  command mapping
- Runtime detection only - Rejected: insufficient for explicit user
  configuration

**Implementation Approach**:

```typescript
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

const PACKAGE_MANAGER_COMMANDS = {
  npm: { install: 'npm install', run: 'npm run' },
  yarn: { install: 'yarn install', run: 'yarn' },
  pnpm: { install: 'pnpm install', run: 'pnpm run' },
  bun: { install: 'bun install', run: 'bun run' },
} as const;
```

### Atomic Operations and Rollback Strategy

**Decision**: State Capture Before Any Modifications with Automatic
Rollback  
**Rationale**:

- Constitutional principle VII requires atomic operations with rollback
  safety
- Early state capture ensures complete recovery capability
- Automatic rollback on failure prevents partial upgrade states
- Separate rollback error tracking provides comprehensive failure
  diagnostics

**Alternatives considered**:

- Incremental state tracking - Rejected: partial states increase rollback
  complexity
- Manual rollback triggers - Rejected: violates atomic operation principle
- Best-effort rollback - Rejected: insufficient safety guarantee

**Implementation Approach**:

```typescript
// Capture complete initial state before any modifications
const initialState = await this.stateManager.captureInitialState();

try {
  // Perform upgrades...
} catch (error) {
  // Automatic rollback with error segregation
  if (options?.rollbackOnFailure !== false) {
    try {
      await this.stateManager.rollbackToState(initialState);
      rollbackPerformed = true;
    } catch (rollbackError) {
      rollbackErrors.push(rollbackError.message);
    }
  }
}
```

## Implementation Readiness

All research complete. No unresolved technical unknowns remain. The design
approach aligns with constitutional principles and addresses all functional
requirements from the feature specification.

**Key Technical Decisions Made**:

1. ✅ Two-script configuration (test + build) with auto-generated install
   commands
2. ✅ Additional scripts for integration testing post-upgrade
3. ✅ Enhanced dependency state management with semver sign preservation
4. ✅ String union-based package manager abstraction
5. ✅ Atomic operations with mandatory rollback safety

**Ready for Phase 1: Design & Contracts**

### New Services Required

- **DependencyStateManager**: Core state management functionality
- **PackageManagerAdapter**: Abstract package manager differences
- **RollbackService**: Specialized rollback logic and verification

## Risk Mitigations Identified

1. **Concurrent Modifications**: File system watching during upgrade
   process
2. **Package Manager Edge Cases**: Comprehensive test coverage for each PM
3. **Semver Sign Variations**: Explicit parsing and validation logic
4. **Rollback Failures**: Multi-level error handling with manual recovery
   guides
5. **Script Timeout Handling**: Configurable timeouts with graceful
   termination

## Dependencies Analysis

### No New Runtime Dependencies Required

- Semver parsing: Use Node.js built-in or existing project utilities
- File system operations: Node.js fs module
- Process execution: Existing execa integration
- JSON parsing: Node.js built-in

### Enhanced DevDependencies

- Additional test fixtures for various package manager scenarios
- Mock utilities for package manager command simulation

## Performance Considerations

- State capture: O(n) where n = number of dependencies
- Rollback operations: O(n) for restoration + package manager install time
- Memory usage: Minimal - only dependency metadata stored
- I/O operations: Limited to package.json read/write + package manager
  commands

## Next Steps

Research complete. Ready for Phase 1 design and contracts generation.
