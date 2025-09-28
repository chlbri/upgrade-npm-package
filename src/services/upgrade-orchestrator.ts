import { gt } from 'semver';
import {
  preserveOperatorAndBumpVersion,
  sortVersionsNewestToOldest,
} from '../libs/semver-utils.js';
import {
  Dependency,
  DependencyState,
  SummaryReport,
  UpgradeOptions,
  UpgradeResult,
} from '../models/types.js';
import { CiRunnerService } from './ci-runner.js';
import { DependencyStateManager } from './dependency-state-manager.js';
import { PackageJsonService } from './package-json.js';
import {
  detectCustomRegistry,
  fetchPackageVersions,
  filterStableVersions,
} from './registry.js';
import { ScriptExecutionService } from './script-execution.js';

/**
 * Main orchestrator for the safe dependency upgrade process with enhanced rollback capabilities
 */
export class UpgradeOrchestrator {
  private packageJsonService: PackageJsonService;
  private ciRunner: CiRunnerService;
  private workingDir: string;
  private stateManager: DependencyStateManager;
  private scriptExecutionService: ScriptExecutionService;

  constructor(workingDir: string = process.cwd()) {
    this.workingDir = workingDir;
    this.packageJsonService = new PackageJsonService(
      `${this.workingDir}/package.json`,
    );
    this.ciRunner = new CiRunnerService(this.workingDir);
    this.stateManager = new DependencyStateManager(
      `${this.workingDir}/package.json`,
    );
    this.scriptExecutionService = new ScriptExecutionService();
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
   * Enhanced upgrade flow with rollback capabilities and configurable scripts
   */
  async upgradeWithRollback(
    options?: UpgradeOptions,
  ): Promise<UpgradeResult> {
    const warnings = detectCustomRegistry();
    const errors: string[] = [];
    let initialState: DependencyState[] | undefined;
    let rollbackPerformed = false;
    const rollbackErrors: string[] = [];

    try {
      // Capture initial state for rollback
      initialState = await this.stateManager.captureInitialState();

      // Execute additional scripts if provided (e.g., pre-upgrade setup)
      if (
        options?.additionalScripts &&
        options.additionalScripts.length > 0
      ) {
        for (const script of options.additionalScripts) {
          const result = await this.scriptExecutionService.executeScript(
            script,
            this.workingDir,
          );
          if (!result.success) {
            throw new Error(
              `Additional script execution failed: ${result.stderr}`,
            );
          }
        }
      }

      // Fast-path: try the required scripts sequence first
      if (
        options?.testScript &&
        options?.buildScript &&
        options?.installScript
      ) {
        const scriptsResult =
          await this.executeRequiredScriptsSequence(options);
        if (scriptsResult.success) {
          return {
            upgraded: [],
            warnings: [
              ...warnings,
              'Fast-path successful: required scripts passed, no dependency upgrades needed',
            ],
            errors: [],
            rollbackPerformed: false,
            initialState,
            rollbackErrors: [],
          };
        }
      }

      // Iterative upgrade process with rollback support
      const upgradeResult = await this.iterativeUpgradeWithRollback(
        warnings,
        options,
        initialState,
      );

      return upgradeResult;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));

      // Attempt rollback if enabled and initial state was captured
      if (
        options?.rollbackOnFailure !== false && // Default is true
        initialState
      ) {
        try {
          await this.stateManager.rollbackToState(initialState);
          rollbackPerformed = true;
        } catch (rollbackError) {
          rollbackErrors.push(
            rollbackError instanceof Error
              ? rollbackError.message
              : String(rollbackError),
          );
        }
      }

      return {
        upgraded: [],
        warnings,
        errors,
        rollbackPerformed,
        initialState,
        rollbackErrors,
      };
    }
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

  /**
   * Execute the required scripts sequence (install -> test -> build)
   */
  private async executeRequiredScriptsSequence(
    options: UpgradeOptions,
  ): Promise<{ success: boolean }> {
    try {
      // Execute scripts in sequence: install -> test -> build
      const scripts = [
        options.installScript,
        options.testScript,
        options.buildScript,
      ];

      for (const script of scripts) {
        const result = await this.scriptExecutionService.executeScript(
          script,
          this.workingDir,
        );
        if (!result.success) {
          return { success: false };
        }
      }

      return { success: true };
    } catch {
      return { success: false };
    }
  }

  /**
   * Enhanced iterative upgrade process with rollback support
   */
  private async iterativeUpgradeWithRollback(
    warnings: string[],
    options?: UpgradeOptions,
    initialState?: DependencyState[],
  ): Promise<UpgradeResult> {
    const dependencies = await this.getAllOutdatedDependencies();
    const upgraded: Array<{
      packageName: string;
      oldVersion: string;
      newVersion: string;
      rollbackAvailable: boolean;
    }> = [];
    const skipped: Array<{ name: string; reason: string }> = [];
    const remainingOutdated: string[] = [];
    const errors: string[] = [];

    for (const dep of dependencies) {
      try {
        const result = await this.upgradeDependencyWithRollback(
          dep,
          options,
        );

        if (result.success) {
          upgraded.push({
            packageName: dep.name,
            oldVersion: dep.currentVersion,
            newVersion: result.newVersion!,
            rollbackAvailable: !!initialState,
          });
        } else {
          skipped.push({
            name: dep.name,
            reason: result.reason || 'No suitable version found',
          });
          remainingOutdated.push(dep.name);
        }
      } catch (error) {
        errors.push(
          `Failed to upgrade ${dep.name}: ${error instanceof Error ? error.message : String(error)}`,
        );
        remainingOutdated.push(dep.name);
      }
    }

    return {
      upgraded,
      warnings,
      errors,
      rollbackPerformed: false,
      initialState,
      rollbackErrors: [],
    };
  }

  /**
   * Enhanced dependency upgrade with rollback support
   */
  private async upgradeDependencyWithRollback(
    dep: Dependency,
    options?: UpgradeOptions,
  ): Promise<{
    success: boolean;
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

        // Sync lockfile
        const syncResult = await this.ciRunner.syncLockfile();
        if (!syncResult.success) {
          this.packageJsonService.restore(backup);
          continue;
        }

        // Execute required scripts if provided
        if (
          options?.testScript &&
          options?.buildScript &&
          options?.installScript
        ) {
          const scriptsResult =
            await this.executeRequiredScriptsSequence(options);
          if (!scriptsResult.success) {
            this.packageJsonService.restore(backup);
            continue;
          }
        } else {
          // Fallback to traditional CI approach
          const ciResult = await this.ciRunner.runCi();
          if (!ciResult.success) {
            this.packageJsonService.restore(backup);

            // Check if it's a peer dependency conflict
            if (
              ciResult.stderr.includes('ERESOLVE') ||
              ciResult.stderr.includes('peer dep')
            ) {
              continue; // Skip to next version
            }
          }
        }

        // Success! Keep this version
        return { success: true, newVersion: newVersionString };
      } catch (error) {
        // Restore on any error and continue
        console.warn(`Unexpected error during upgrade attempt: ${error}`);
        this.packageJsonService.restore(backup);
        continue;
      }
    }

    return { success: false, reason: 'All newer versions failed' };
  }
}
