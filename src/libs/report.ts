import { SummaryReport } from '../models/types.js';

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
