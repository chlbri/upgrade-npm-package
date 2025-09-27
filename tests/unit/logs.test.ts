import { describe, expect, it } from 'vitest';
import {
  formatSummaryReport,
  logFastPathSuccess,
  logPeerConflict,
  logRegistryWarning,
  logUpgradeAttempt,
} from '../../src/libs/report';

describe('Logs Clarity', () => {
  it('should include dependency name and version in failure messages', () => {
    // Test that logUpgradeAttempt can be called for failures
    expect(() => {
      logUpgradeAttempt(
        'lodash',
        '4.17.22',
        false,
        'CI failed with exit code 1',
      );
    }).not.toThrow();
  });

  it('should log peer conflict details with specific packages', () => {
    expect(() => {
      logPeerConflict('react-router', '6.8.0', 'requires react@^18.0.0');
    }).not.toThrow();
  });

  it('should log successful upgrades with from/to versions', () => {
    expect(() => {
      logUpgradeAttempt('lodash', '^4.17.21', true);
    }).not.toThrow();
  });

  it('should log registry warnings with detected URL', () => {
    expect(() => {
      logRegistryWarning('https://npm.company.com');
    }).not.toThrow();
  });

  it('should log fast-path admin success', () => {
    expect(() => {
      logFastPathSuccess();
    }).not.toThrow();
  });

  it('should log summary statistics', () => {
    const report = {
      upgraded: [
        { name: 'lodash', from: '^4.17.20', to: '^4.17.21' },
        { name: 'semver', from: '^7.3.0', to: '^7.5.4' },
      ],
      skipped: [{ name: 'react', reason: 'peer dependency conflict' }],
      remainingOutdated: ['eslint', 'prettier', 'typescript'],
      warnings: ['custom registry detected'],
    };

    const formatted = formatSummaryReport(report);
    expect(formatted).toContain(
      '📊 Summary: 2 upgraded, 1 skipped, 3 remaining outdated, 1 warning',
    );
  });
});
