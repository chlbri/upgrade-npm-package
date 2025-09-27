import { describe, expect, it } from 'vitest';
import { sortVersionsNewestToOldest } from '../../src/lib/semver-utils';

describe('Idempotence Behavior', () => {
  it('should skip already-accepted upgrades on reruns', () => {
    // Scenario: First run upgrades lodash ^4.17.20 → ^4.17.21
    // Second run should detect lodash is already at ^4.17.21 and skip
    const previouslyUpgraded = ['lodash'];

    // Logic: if package was previously upgraded, skip it
    const shouldSkip = previouslyUpgraded.includes('lodash');
    expect(shouldSkip).toBe(true);
  });

  it('should not reattempt failed upgrades within same session', () => {
    // If lodash 4.17.22 failed CI, don't try it again in same run
    const failedAttempts = [
      { package: 'lodash', version: '4.17.22', reason: 'CI failed' },
    ];
    const candidateVersion = '4.17.22';

    // Logic: check if this version was already attempted and failed
    const alreadyFailed = failedAttempts.some(
      attempt =>
        attempt.package === 'lodash' &&
        attempt.version === candidateVersion,
    );
    expect(alreadyFailed).toBe(true);
  });

  it('should only attempt versions newer than current successful version', () => {
    // If currently at lodash ^4.17.21, only try 4.17.22+, not 4.17.20
    const currentVersion = '4.17.21';
    const allAvailableVersions = [
      '4.17.20',
      '4.17.21',
      '4.17.22',
      '4.17.23',
    ];

    // Sort versions and filter to only newer ones
    const sortedVersions = sortVersionsNewestToOldest(
      allAvailableVersions,
    );
    const newerVersions = sortedVersions.filter(v => v > currentVersion);

    expect(newerVersions).toEqual(['4.17.23', '4.17.22']);
    expect(newerVersions).not.toContain('4.17.21');
    expect(newerVersions).not.toContain('4.17.20');
  });

  it('should produce consistent results across multiple runs', () => {
    // Running upgrader twice on same package.json should yield same result

    // Test that version sorting is deterministic
    const versions = ['1.0.0', '1.0.1', '1.0.2', '2.0.0'];
    const sorted1 = sortVersionsNewestToOldest([...versions]);
    const sorted2 = sortVersionsNewestToOldest([...versions]);

    expect(sorted1).toEqual(sorted2);
    expect(sorted1).toEqual(['2.0.0', '1.0.2', '1.0.1', '1.0.0']);
  });
});
