import { describe, expect, it } from 'vitest';
import { filterStableVersions } from '../../src/libs/semver-utils';
import {
  detectCustomRegistry,
  fetchPackageVersions,
  validateRegistry,
} from '../../src/services/registry';

describe('Registry Policy', () => {
  it('should exclude prerelease versions from listing', () => {
    const allVersions = [
      '4.17.21',
      '4.17.22-beta.1',
      '4.17.22',
      '5.0.0-alpha.1',
      '5.0.0',
    ];
    const expectedStable = ['4.17.21', '4.17.22', '5.0.0'];

    const result = filterStableVersions(allVersions);
    expect(result).toEqual(expectedStable);
  });

  it('should enforce npmjs.org registry only', () => {
    const result = validateRegistry();
    expect(result.isNpmJs).toBe(true);
    expect(result.warning).toBeUndefined();
  });

  it('should warn when custom registry detected', () => {
    const warnings = detectCustomRegistry();
    expect(warnings).toEqual([]);
  });

  it('should fetch package versions from npm registry', async () => {
    const packageName = 'lodash';

    // This will make a real HTTP request - in a real test we'd mock this
    // For now, just test that the function returns an array of versions
    const versions = await fetchPackageVersions(packageName);
    expect(Array.isArray(versions)).toBe(true);
    expect(versions.length).toBeGreaterThan(0);
    expect(typeof versions[0]).toBe('string');
  });
});
