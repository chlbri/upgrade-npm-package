export const NPM_REGISTRY_URL = 'https://registry.npmjs.org';

/**
 * Fetch package versions from npm registry
 */
export async function fetchPackageVersions(
  packageName: string,
): Promise<string[]> {
  try {
    const response = await fetch(`${NPM_REGISTRY_URL}/${packageName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch package info: ${response.status}`);
    }

    const data = await response.json();
    const versions = Object.entries(data.versions || {})
      .filter(([, obj]) => {
        return (obj as any).deprecated === undefined;
      })
      .map(([version]) => version);
    return versions;
  } catch (error) {
    throw new Error(`Registry error for ${packageName}: ${error}`);
  }
}

/**
 * Validate registry URL - ensure using npmjs.org
 */
export function validateRegistry(): {
  isNpmJs: boolean;
  warning?: string;
} {
  // For now, always use npmjs.org - could be extended to check .npmrc
  return { isNpmJs: true };
}

/**
 * Detect custom registry and generate warning
 */
export function detectCustomRegistry(): string[] {
  // Placeholder - would check .npmrc for registry config
  // For now, return empty warnings
  return [];
}

/**
 * Filter stable versions (exclude prereleases)
 */
export function filterStableVersions(versions: string[]): string[] {
  return versions.filter(version => !version.includes('-'));
}
