import { gt } from 'semver';
import {
  preserveOperatorAndBumpVersion,
  sortVersionsNewestToOldest,
} from '../lib/semver-utils.js';
import { Dependency, SummaryReport } from '../models/types.js';
import { CiRunnerService } from './ci-runner.js';
import { PackageJsonService } from './package-json.js';
import {
  detectCustomRegistry,
  fetchPackageVersions,
  filterStableVersions,
} from './registry.js';

/**
 * Main orchestrator for the safe dependency upgrade process
 */
export class UpgradeOrchestrator {
  private packageJsonService: PackageJsonService;
  private ciRunner: CiRunnerService;
  private workingDir: string;

  constructor(workingDir: string = process.cwd()) {
    this.workingDir = workingDir;
    this.packageJsonService = new PackageJsonService(
      `${this.workingDir}/package.json`,
    );
    this.ciRunner = new CiRunnerService(this.workingDir);
  }

  /**
   * Main upgrade flow - fast-path or iterative
   */
  async upgrade(): Promise<SummaryReport> {
    const warnings = detectCustomRegistry();

    // Fast-path: try ci:admin first
    const adminResult = await this.ciRunner.runCiAdmin();
    if (adminResult.success) {
      return {
        upgraded: [],
        skipped: [],
        remainingOutdated: [],
        warnings: [
          ...warnings,
          'Fast-path successful: ci:admin passed, no iterative upgrades needed',
        ],
      };
    }

    // Iterative upgrade process
    return await this.iterativeUpgrade(warnings);
  }

  /**
   * Iterative upgrade process for each dependency
   */
  private async iterativeUpgrade(
    warnings: string[],
  ): Promise<SummaryReport> {
    const dependencies = await this.getAllOutdatedDependencies();
    const upgraded: Array<{ name: string; from: string; to: string }> = [];
    const skipped: Array<{ name: string; reason: string }> = [];
    const remainingOutdated: string[] = [];

    for (const dep of dependencies) {
      const result = await this.upgradeDependency(dep);

      if (result.upgraded) {
        upgraded.push({
          name: dep.name,
          from: dep.currentVersion,
          to: result.newVersion!,
        });
      } else {
        skipped.push({
          name: dep.name,
          reason: result.reason || 'No suitable version found',
        });
        remainingOutdated.push(dep.name);
      }
    }

    return { upgraded, skipped, remainingOutdated, warnings };
  }

  /**
   * Upgrade a single dependency through version candidates
   */
  private async upgradeDependency(dep: Dependency): Promise<{
    upgraded: boolean;
    newVersion?: string;
    reason?: string;
  }> {
    const backup = this.packageJsonService.backup();

    for (const candidateVersion of dep.availableNewers) {
      try {
        // Update package.json
        const newVersionString = preserveOperatorAndBumpVersion(
          dep.currentVersion,
          candidateVersion,
        );
        this.packageJsonService.updateDependency(
          dep.name,
          newVersionString,
          dep.section,
        );

        // Sync lockfile and run CI
        const syncResult = await this.ciRunner.syncLockfile();
        if (!syncResult.success) {
          this.packageJsonService.restore(backup);
          continue;
        }

        const ciResult = await this.ciRunner.runCi();

        if (ciResult.success) {
          // Success! Keep this version
          return { upgraded: true, newVersion: newVersionString };
        } else {
          // CI failed, restore and try next version
          this.packageJsonService.restore(backup);

          // Check if it's a peer dependency conflict
          if (
            ciResult.stderr.includes('ERESOLVE') ||
            ciResult.stderr.includes('peer dep')
          ) {
            continue; // Skip to next version
          }
        }
      } catch (error) {
        // Restore on any error and continue
        console.warn(`Unexpected error during upgrade attempt: ${error}`);
        this.packageJsonService.restore(backup);
      }
    }

    return { upgraded: false, reason: 'All newer versions failed CI' };
  }

  /**
   * Get all outdated dependencies from package.json
   */
  private async getAllOutdatedDependencies(): Promise<Dependency[]> {
    const allDeps = this.packageJsonService.getAllDependencies();
    const dependencies: Dependency[] = [];

    // Process each section
    const sections: Array<{
      deps: Record<string, string>;
      section: Dependency['section'];
    }> = [
      { deps: allDeps.dependencies || {}, section: 'dependencies' },
      { deps: allDeps.devDependencies || {}, section: 'devDependencies' },
      {
        deps: allDeps.optionalDependencies || {},
        section: 'optionalDependencies',
      },
    ];

    for (const { deps, section } of sections) {
      for (const [name, currentVersion] of Object.entries(deps)) {
        try {
          const allVersions = await fetchPackageVersions(name);
          const stableVersions = filterStableVersions(allVersions);
          const sortedVersions =
            sortVersionsNewestToOldest(stableVersions);

          // Find versions newer than current
          const availableNewers = sortedVersions.filter(version => {
            try {
              return gt(version, currentVersion.replace(/^[\^~]/, ''));
            } catch {
              return false;
            }
          });

          if (availableNewers.length > 0) {
            dependencies.push({
              name,
              section,
              currentVersion,
              availableNewers,
            });
          }
        } catch (error) {
          // Skip packages that can't be fetched
          console.warn(`Could not fetch versions for ${name}:`, error);
        }
      }
    }

    return dependencies;
  }
}
