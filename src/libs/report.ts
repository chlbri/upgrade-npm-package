import { SummaryReport, UpgradeResult } from '../models/types.js';

/**
 * Format and display summary report
 */
export function formatSummaryReport(report: SummaryReport): string {
  const lines: string[] = [];

  lines.push('🔄 Upgrade Summary Report');
  lines.push('========================');

  if (report.upgraded.length > 0) {
    lines.push('\n✅ Successfully Upgraded:');
    report.upgraded.forEach(({ name, from, to }) => {
      lines.push(`  ${name}: ${from} → ${to}`);
    });
  }

  if (report.skipped.length > 0) {
    lines.push('\n⚠️  Skipped:');
    report.skipped.forEach(({ name, reason }) => {
      lines.push(`  ${name}: ${reason}`);
    });
  }

  if (report.remainingOutdated.length > 0) {
    lines.push('\n📋 Remaining Outdated:');
    report.remainingOutdated.forEach(name => {
      lines.push(`  ${name}`);
    });
  }

  if (report.warnings.length > 0) {
    lines.push('\n⚠️  Warnings:');
    report.warnings.forEach(warning => {
      lines.push(`  ${warning}`);
    });
  }

  const stats = `\n📊 Summary: ${report.upgraded.length} upgraded, ${report.skipped.length} skipped, ${report.remainingOutdated.length} remaining outdated, ${report.warnings.length} warnings`;
  lines.push(stats);

  return lines.join('\n');
}

/**
 * Log upgrade attempt
 */
export function logUpgradeAttempt(
  packageName: string,
  version: string,
  success: boolean,
  reason?: string,
): void {
  if (success) {
    console.log(`✅ Successfully upgraded ${packageName} to ${version}`);
  } else {
    console.log(
      `❌ Failed to upgrade ${packageName} to ${version}: ${reason || 'CI failed'}`,
    );
  }
}

/**
 * Log peer conflict
 */
export function logPeerConflict(
  packageName: string,
  version: string,
  conflictDetails: string,
): void {
  console.log(
    `⚠️  Skipping ${packageName}@${version}: peer dependency conflict (${conflictDetails})`,
  );
}

/**
 * Log fast-path success
 */
export function logFastPathSuccess(): void {
  console.log(
    '🚀 Fast-path successful: ci:admin passed, no iterative upgrades needed',
  );
}

/**
 * Log registry warning
 */
export function logRegistryWarning(detectedUrl: string): void {
  console.log(
    `⚠️  Warning: Custom registry ${detectedUrl} detected, using https://registry.npmjs.org/ instead`,
  );
}

/**
 * Format and display enhanced upgrade result with rollback information
 */
export function formatEnhancedUpgradeResult(
  result: UpgradeResult,
): string {
  const lines: string[] = [];

  lines.push('📊 Enhanced Upgrade Report');
  lines.push('==========================');

  // Upgraded packages
  if (result.upgraded.length > 0) {
    lines.push('\n✅ Successfully Upgraded:');
    result.upgraded.forEach(pkg => {
      const rollbackStatus = pkg.rollbackAvailable
        ? ' (rollback available)'
        : '';
      lines.push(
        `  ${pkg.packageName}: ${pkg.oldVersion} → ${pkg.newVersion}${rollbackStatus}`,
      );
    });
  } else {
    lines.push('\n✅ No packages upgraded');
  }

  // Warnings
  if (result.warnings.length > 0) {
    lines.push('\n⚠️  Warnings:');
    result.warnings.forEach(warning => {
      lines.push(`  • ${warning}`);
    });
  }

  // Errors
  if (result.errors.length > 0) {
    lines.push('\n❌ Errors:');
    result.errors.forEach(error => {
      lines.push(`  • ${error}`);
    });
  }

  // Rollback information
  if (result.rollbackPerformed) {
    lines.push('\n🔄 Rollback performed due to errors');
    if (result.initialState && result.initialState.length > 0) {
      lines.push(
        `   Restored ${result.initialState.length} dependency states`,
      );
    }
  }

  // Rollback errors
  if (result.rollbackErrors && result.rollbackErrors.length > 0) {
    lines.push('\n🚨 Rollback Errors:');
    result.rollbackErrors.forEach(error => {
      lines.push(`  • ${error}`);
    });
  }

  // Summary stats
  const stats = `\n📊 Summary: ${result.upgraded.length} upgraded, ${result.errors.length} errors, ${result.warnings.length} warnings`;
  lines.push(stats);

  if (
    result.rollbackPerformed ||
    (result.rollbackErrors && result.rollbackErrors.length > 0)
  ) {
    lines.push(
      `🔄 Rollback: ${result.rollbackPerformed ? 'performed' : 'failed'}`,
    );
  }

  return lines.join('\n');
}

/**
 * Log rollback operation
 */
export function logRollbackOperation(
  success: boolean,
  dependencyCount: number,
  error?: string,
): void {
  if (success) {
    console.log(
      `🔄 Rollback successful: restored ${dependencyCount} dependencies`,
    );
  } else {
    console.log(`🚨 Rollback failed: ${error || 'unknown error'}`);
  }
}

/**
 * Log state capture operation
 */
export function logStateCaptureOperation(dependencyCount: number): void {
  console.log(
    `📸 Captured initial state: ${dependencyCount} dependencies`,
  );
}

/**
 * Log script execution
 */
export function logScriptExecution(
  scriptType: string,
  command: string,
  success: boolean,
  duration?: number,
): void {
  const durationText = duration ? ` (${duration}ms)` : '';
  if (success) {
    console.log(
      `✅ ${scriptType} script executed successfully: ${command}${durationText}`,
    );
  } else {
    console.log(
      `❌ ${scriptType} script failed: ${command}${durationText}`,
    );
  }
}
