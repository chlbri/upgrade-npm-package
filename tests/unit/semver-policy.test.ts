import { describe, expect, it } from 'vitest';
import {
  filterStableVersions,
  preserveOperatorAndBumpVersion,
  sortVersionsNewestToOldest,
} from '../../src/libs/semver-utils';

describe('Semver Policy', () => {
  it('should preserve ^ operator while bumping min version', () => {
    const currentVersion = '^4.17.21';
    const newMinVersion = '4.17.22';
    const expectedResult = '^4.17.22';

    const result = preserveOperatorAndBumpVersion(
      currentVersion,
      newMinVersion,
    );
    expect(result).toBe(expectedResult);
  });

  it('should preserve ~ operator while bumping min version', () => {
    const currentVersion = '~4.17.21';
    const newMinVersion = '4.17.22';
    const expectedResult = '~4.17.22';

    const result = preserveOperatorAndBumpVersion(
      currentVersion,
      newMinVersion,
    );
    expect(result).toBe(expectedResult);
  });

  it('should handle exact versions', () => {
    const currentVersion = '4.17.21';
    const newMinVersion = '4.17.22';
    const expectedResult = '4.17.22';

    const result = preserveOperatorAndBumpVersion(
      currentVersion,
      newMinVersion,
    );
    expect(result).toBe(expectedResult);
  });

  it('should sort available versions newest to oldest', () => {
    const unsortedVersions = ['4.17.21', '4.17.23', '4.17.22', '5.0.0'];
    const expectedSorted = ['5.0.0', '4.17.23', '4.17.22', '4.17.21'];

    const result = sortVersionsNewestToOldest(unsortedVersions);
    expect(result).toEqual(expectedSorted);
  });

  it('should filter out prerelease versions', () => {
    const versionsWithPrereleases = [
      '1.0.0',
      '1.0.1-beta',
      '1.0.2',
      '2.0.0-alpha',
    ];
    const expectedStable = ['1.0.0', '1.0.2'];

    const result = filterStableVersions(versionsWithPrereleases);
    expect(result).toEqual(expectedStable);
  });
});
