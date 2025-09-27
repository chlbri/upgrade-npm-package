import { describe, expect, it } from 'vitest';
import {
  AttemptResult,
  Dependency,
  SummaryReport,
} from '../../src/models/types';

describe('Data Models', () => {
  describe('Dependency', () => {
    it('should validate required fields', () => {
      const dep: Dependency = {
        name: 'lodash',
        section: 'dependencies',
        currentVersion: '^4.17.21',
        availableNewer: ['4.17.22', '4.17.23'],
      };

      expect(dep.name).toBe('lodash');
      expect(dep.section).toBe('dependencies');
      expect(dep.currentVersion).toBe('^4.17.21');
      expect(dep.availableNewer).toHaveLength(2);
    });

    it('should enforce valid section enum', () => {
      const validSections: Array<
        'dependencies' | 'devDependencies' | 'optionalDependencies'
      > = ['dependencies', 'devDependencies', 'optionalDependencies'];
      validSections.forEach(section => {
        const dep: Dependency = {
          name: 'test',
          section: section,
          currentVersion: '1.0.0',
          availableNewer: [],
        };
        expect(validSections).toContain(dep.section);
      });
    });
  });

  describe('AttemptResult', () => {
    it('should validate pass/accept correlation', () => {
      const passResult: AttemptResult = {
        packageName: 'lodash',
        candidateVersion: '4.17.22',
        ciStatus: 'pass',
        action: 'accept',
        timestamp: new Date().toISOString(),
      };

      expect(passResult.ciStatus).toBe('pass');
      expect(passResult.action).toBe('accept');
    });

    it('should validate fail/revert correlation', () => {
      const failResult: AttemptResult = {
        packageName: 'lodash',
        candidateVersion: '4.17.22',
        ciStatus: 'fail',
        reason: 'peer conflict',
        action: 'revert',
        timestamp: new Date().toISOString(),
      };

      expect(failResult.ciStatus).toBe('fail');
      expect(failResult.action).toBe('revert');
      expect(failResult.reason).toBeDefined();
    });
  });

  describe('SummaryReport', () => {
    it('should have all required arrays', () => {
      const report: SummaryReport = {
        upgraded: [{ name: 'lodash', from: '4.17.21', to: '4.17.22' }],
        skipped: [{ name: 'react', reason: 'peer conflict' }],
        remainingOutdated: ['typescript'],
        warnings: ['custom registry detected'],
      };

      expect(Array.isArray(report.upgraded)).toBe(true);
      expect(Array.isArray(report.skipped)).toBe(true);
      expect(Array.isArray(report.remainingOutdated)).toBe(true);
      expect(Array.isArray(report.warnings)).toBe(true);
    });
  });
});
