export interface Dependency {
  name: string;
  section: 'dependencies' | 'devDependencies' | 'optionalDependencies';
  currentVersion: string;
  availableNewers: string[];
}

export interface AttemptResult {
  packageName: string;
  candidateVersion: string;
  ciStatus: 'pass' | 'fail';
  reason?: string;
  action: 'accept' | 'revert';
  timestamp: string;
}

export interface SummaryReport {
  upgraded: Array<{ name: string; from: string; to: string }>;
  skipped: Array<{ name: string; reason: string }>;
  remainingOutdated: string[];
  warnings: string[];
}

// Enhanced Dependency State Management Types
export interface DependencyState {
  packageName: string; // e.g., "lodash"
  version: string; // e.g., "4.17.21" (without semver sign)
  semverSign: '^' | '~' | 'exact';
  dependencyType:
    | 'dependencies'
    | 'devDependencies'
    | 'optionalDependencies';
}

export interface ScriptConfig {
  type: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'shell';
  command: string; // Command to execute
  timeout?: number; // Optional timeout in milliseconds (default: 300000)
}

export interface UpgradeOptions {
  // Existing options
  workingDir?: string;
  dryRun?: boolean;
  verbose?: boolean;
  admin?: boolean;

  // Required user-provided scripts (3 mandatory)
  testScript: ScriptConfig;
  buildScript: ScriptConfig;
  lintScript: ScriptConfig;

  // Auto-generated script (user cannot override)
  installScript?: ScriptConfig; // Generated from packageManager type

  // Package manager configuration
  packageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';

  // Optional additional scripts (for integration testing)
  additionalScripts?: ScriptConfig[];
  rollbackOnFailure?: boolean; // Default: true
}

export interface PackageUpgrade {
  packageName: string;
  oldVersion: string;
  newVersion: string;
  rollbackAvailable: boolean; // New field
}

export interface UpgradeResult {
  // Existing fields
  upgraded: PackageUpgrade[];
  warnings: string[];
  errors: string[];

  // New fields for this feature
  rollbackPerformed?: boolean;
  initialState?: DependencyState[];
  rollbackErrors?: string[];
}

export interface ExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface UpgradeError {
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

// Package Manager Adapter Interface
export interface PackageManagerAdapter {
  type: 'npm' | 'yarn' | 'pnpm' | 'bun';
  installCommand: string;
  runCommand: string;
}

export interface PackageManagerCommands {
  install: string;
  run: string;
}
