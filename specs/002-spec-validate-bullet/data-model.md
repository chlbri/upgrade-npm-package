# Data Model: Enhanced Dependency State Management

**Date**: 2025-09-28  
**Feature**: 002-spec-validate-bullet

## Core Types

### DependencyState

Represents the state of a single dependency at a point in time.

```typescript
interface DependencyState {
  packageName: string; // e.g., "lodash"
  version: string; // e.g., "4.17.21" (without semver sign)
  semverSign: '^' | '~' | 'exact';
  dependencyType:
    | 'dependencies'
    | 'devDependencies'
    | 'optionalDependencies';
}
```

**Validation Rules**:

- `packageName`: Must be non-empty string matching npm package name format
- `version`: Must be valid semver version string
- `semverSign`: Must be one of the allowed semver prefixes
- `dependencyType`: Must match package.json dependency section

### ScriptConfig

Configuration for executable scripts during upgrade process.

```typescript
interface ScriptConfig {
  type: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'shell';
  command: string; // Command to execute
  timeout?: number; // Optional timeout in milliseconds (default: 300000)
}
```

### UpgradeOptions

Enhanced configuration for upgrade operations.

```typescript
interface UpgradeOptions {
  // Existing options
  workingDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
  admin?: boolean;

  // Required user-provided scripts (2 mandatory)
  testScript: ScriptConfig;
  buildScript: ScriptConfig;

  // Auto-generated script (user cannot override)
  installScript?: ScriptConfig; // Generated from packageManager type

  // Package manager configuration
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';

  // Optional additional scripts (for integration testing)
  additionalScripts?: ScriptConfig[];
  rollbackOnFailure?: boolean; // Default: true
}
```

**Validation Rules**:

- `workingDir`: Must be valid directory path if provided
- Script configs: Must pass ScriptConfig validation
- `rollbackOnFailure`: Boolean flag for rollback behavior

### UpgradeResult

Enhanced result object with rollback information.

```typescript
interface UpgradeResult {
  // Existing fields
  upgraded: PackageUpgrade[];
  warnings: string[];
  errors: string[];

  // New fields for this feature
  rollbackPerformed?: boolean;
  initialState?: DependencyState[];
  rollbackErrors?: string[];
}

interface PackageUpgrade {
  packageName: string;
  oldVersion: string;
  newVersion: string;
  rollbackAvailable: boolean; // New field
}
```

### ExecutionResult

Result of command execution.

```typescript
interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}
```

## Key Relationships

- `UpgradeOrchestrator` manages dependency state and orchestrates upgrade
  process
- `ScriptConfig` defines executable commands for validation
- `DependencyState` tracks package versions and semver signs
- `UpgradeResult` contains outcome and rollback information

## Error Handling

### UpgradeError

```typescript
interface UpgradeError {
  type:
    | 'STATE_CAPTURE_FAILED'
    | 'SCRIPT_EXECUTION_FAILED'
    | 'ROLLBACK_FAILED'
    | 'VALIDATION_FAILED'
    | 'PACKAGE_MANAGER_ERROR';
  message: string;
  details?: any;
  rollbackAvailable: boolean;
}
```

## Core Validation Rules

- All dependency states must have valid semver versions
- Semver signs must be consistently applied
- Package names must be valid npm identifiers
- Initial state must be captured before any modifications
- Script execution must respect timeout constraints
- Rollback must restore exact initial state
