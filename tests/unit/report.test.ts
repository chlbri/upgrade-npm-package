import { describe, expect, it } from 'vitest';
import {
  formatSummaryReport,
  logPeerConflict,
  logRegistryWarning,
  logUpgradeAttempt,
} from '../../src/libs/report';
import { SummaryReport } from '../../src/models/types';

describe('SummaryReport Shape and Content', () => {
  it('should have all required fields populated correctly', () => {
    const mockReport: SummaryReport = {
      upgraded: [
        { name: 'lodash', from: '^4.17.20', to: '^4.17.21' },
        { name: 'semver', from: '^7.3.0', to: '^7.5.4' },
      ],
      skipped: [
        { name: 'react', reason: 'peer dependency conflict' },
        { name: 'typescript', reason: 'all newer versions failed CI' },
      ],
      remainingOutdated: ['eslint', 'prettier'],
      warnings: ['custom registry detected in .npmrc'],
    };

    const formatted = formatSummaryReport(mockReport);
    expect(formatted).toContain('🔄 Upgrade Summary Report');
    expect(formatted).toContain('✅ Successfully Upgraded:');
    expect(formatted).toContain('⚠️  Skipped:');
    expect(formatted).toContain('📋 Remaining Outdated:');
    expect(formatted).toContain('⚠️  Warnings:');
    expect(formatted).toContain('📊 Summary: 2 upgraded, 2 skipped');
  });

  it('should format upgrade entries with from/to versions', () => {
    const mockReport: SummaryReport = {
      upgraded: [{ name: 'lodash', from: '^4.17.20', to: '^4.17.21' }],
      skipped: [],
      remainingOutdated: [],
      warnings: [],
    };

    const formatted = formatSummaryReport(mockReport);
    expect(formatted).toContain('lodash: ^4.17.20 → ^4.17.21');
  });

  it('should format skip entries with reasons', () => {
    const mockReport: SummaryReport = {
      upgraded: [],
      skipped: [
        {
          name: 'react',
          reason: 'peer dependency conflict with react-dom',
        },
      ],
      remainingOutdated: [],
      warnings: [],
    };

    const formatted = formatSummaryReport(mockReport);
    expect(formatted).toContain(
      'react: peer dependency conflict with react-dom',
    );
  });

  it('should include registry warnings when custom registry detected', () => {
    const mockReport: SummaryReport = {
      upgraded: [],
      skipped: [],
      remainingOutdated: [],
      warnings: [
        'custom registry https://npm.company.com detected, using npmjs.org instead',
      ],
    };

    const formatted = formatSummaryReport(mockReport);
    expect(formatted).toContain(
      'custom registry https://npm.company.com detected',
    );
  });

  it('should list remaining outdated packages that had no newer versions', () => {
    const mockReport: SummaryReport = {
      upgraded: [],
      skipped: [],
      remainingOutdated: [
        'package-already-latest',
        'package-no-registry-info',
      ],
      warnings: [],
    };

    const formatted = formatSummaryReport(mockReport);
    expect(formatted).toContain('package-already-latest');
    expect(formatted).toContain('package-no-registry-info');
  });

  it('should log upgrade attempts', () => {
    // Test successful upgrade
    expect(() =>
      logUpgradeAttempt('lodash', '4.17.21', true),
    ).not.toThrow();

    // Test failed upgrade
    expect(() =>
      logUpgradeAttempt('react', '18.0.0', false, 'peer conflict'),
    ).not.toThrow();
  });

  it('should log peer conflicts', () => {
    expect(() =>
      logPeerConflict('react-router', '6.8.0', 'requires react@^18.0.0'),
    ).not.toThrow();
  });

  it('should log registry warnings', () => {
    expect(() =>
      logRegistryWarning('https://npm.company.com'),
    ).not.toThrow();
  });
});
