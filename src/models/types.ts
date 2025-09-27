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
