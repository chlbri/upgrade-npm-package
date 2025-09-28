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

/**
 * Parse semver sign from version string
 */
export function parseSemverSign(
  versionString: string,
): '^' | '~' | 'exact' {
  if (versionString.startsWith('^')) {
    return '^';
  }
  if (versionString.startsWith('~')) {
    return '~';
  }
  return 'exact';
}

/**
 * Extract clean version without semver sign
 */
export function extractCleanVersion(versionString: string): string {
  const cleanVer = clean(versionString.replace(/^[\^~]/, ''));
  if (!cleanVer) {
    throw new Error(`Invalid version: ${versionString}`);
  }
  return cleanVer;
}

/**
 * Reconstruct version string with semver sign
 */
export function reconstructVersionString(
  version: string,
  semverSign: '^' | '~' | 'exact',
): string {
  const cleanVer = clean(version);
  if (!cleanVer) {
    throw new Error(`Invalid version: ${version}`);
  }

  switch (semverSign) {
    case '^':
      return `^${cleanVer}`;
    case '~':
      return `~${cleanVer}`;
    case 'exact':
    default:
      return cleanVer;
  }
}

/**
 * Parse dependency string into components for state management
 */
export function parseDependencyVersion(versionString: string): {
  version: string;
  semverSign: '^' | '~' | 'exact';
} {
  const semverSign = parseSemverSign(versionString);
  const version = extractCleanVersion(versionString);

  return {
    version,
    semverSign,
  };
}

/**
 * Validate semver version string
 */
export function isValidSemverString(versionString: string): boolean {
  try {
    extractCleanVersion(versionString);
    return true;
  } catch {
    return false;
  }
}
