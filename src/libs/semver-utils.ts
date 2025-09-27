import { clean, gt, prerelease, valid } from 'semver';

/**
 * Preserve semver operator (^, ~) and update minimal version
 */
export function preserveOperatorAndBumpVersion(
  currentVersion: string,
  newMinVersion: string,
): string {
  const operator = currentVersion.match(/^[\^~]/)?.[0] || '';
  const cleanNewVersion = clean(newMinVersion);

  if (!cleanNewVersion) {
    throw new Error(`Invalid version: ${newMinVersion}`);
  }

  return operator + cleanNewVersion;
}

/**
 * Sort versions from newest to oldest, excluding prereleases
 */
export function sortVersionsNewestToOldest(versions: string[]): string[] {
  return versions
    .filter(version => valid(version) && !prerelease(version)) // Exclude prereleases
    .sort((a, b) => (gt(b, a) ? 1 : -1)); // Newest first
}

/**
 * Filter out prerelease versions from a list
 */
export function filterStableVersions(versions: string[]): string[] {
  return versions.filter(
    version => valid(version) && !prerelease(version),
  );
}
