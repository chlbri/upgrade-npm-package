import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { DependencyState, UpgradeError } from '../models/types.js';

/**
 * DependencyStateManager handles capturing and restoring dependency states
 * with semver sign preservation for atomic upgrade operations with rollback capability
 */
export class DependencyStateManager {
  private projectPath: string;
  private packageJsonPath: string;

  constructor(projectPath: string) {
    if (!existsSync(projectPath)) {
      throw new Error(`Project path does not exist: ${projectPath}`);
    }

    this.projectPath = projectPath;
    this.packageJsonPath = join(projectPath, 'package.json');
  }

  /**
   * Captures the current dependency state from package.json
   * Preserves semver signs (^, ~, exact) for accurate rollback
   */
  async captureInitialState(): Promise<DependencyState[]> {
    try {
      if (!existsSync(this.packageJsonPath)) {
        throw new Error(
          `package.json not found at ${this.packageJsonPath}`,
        );
      }

      const packageJsonContent = readFileSync(
        this.packageJsonPath,
        'utf8',
      );
      let packageJson: any;

      try {
        packageJson = JSON.parse(packageJsonContent);
      } catch (parseError) {
        throw new Error(
          `Invalid JSON in package.json: ${(parseError as Error).message}`,
        );
      }

      const dependencies: DependencyState[] = [];

      // Process dependencies
      if (packageJson.dependencies) {
        for (const [packageName, version] of Object.entries(
          packageJson.dependencies,
        )) {
          dependencies.push(
            this.parseDependency(
              packageName,
              version as string,
              'dependencies',
            ),
          );
        }
      }

      // Process devDependencies
      if (packageJson.devDependencies) {
        for (const [packageName, version] of Object.entries(
          packageJson.devDependencies,
        )) {
          dependencies.push(
            this.parseDependency(
              packageName,
              version as string,
              'devDependencies',
            ),
          );
        }
      }

      // Process optionalDependencies
      if (packageJson.optionalDependencies) {
        for (const [packageName, version] of Object.entries(
          packageJson.optionalDependencies,
        )) {
          dependencies.push(
            this.parseDependency(
              packageName,
              version as string,
              'optionalDependencies',
            ),
          );
        }
      }

      return dependencies;
    } catch (error) {
      const upgradeError: UpgradeError = {
        type: 'STATE_CAPTURE_FAILED',
        message: `Failed to capture initial state: ${(error as Error).message}`,
        rollbackAvailable: false,
      };
      throw upgradeError;
    }
  }

  /**
   * Restores dependencies to the specified state
   * Rebuilds package.json with exact semver signs and versions
   */
  async rollbackToState(targetState: DependencyState[]): Promise<void> {
    try {
      if (!existsSync(this.packageJsonPath)) {
        throw new Error(
          `package.json not found for rollback at ${this.packageJsonPath}`,
        );
      }

      const packageJsonContent = readFileSync(
        this.packageJsonPath,
        'utf8',
      );
      const packageJson = JSON.parse(packageJsonContent);

      // Clear existing dependency sections
      packageJson.dependencies = {};
      packageJson.devDependencies = {};
      packageJson.optionalDependencies = {};

      // Rebuild dependency sections from target state
      for (const dep of targetState) {
        const versionString = this.buildVersionString(
          dep.version,
          dep.semverSign,
        );

        switch (dep.dependencyType) {
          case 'dependencies':
            packageJson.dependencies[dep.packageName] = versionString;
            break;
          case 'devDependencies':
            packageJson.devDependencies[dep.packageName] = versionString;
            break;
          case 'optionalDependencies':
            packageJson.optionalDependencies[dep.packageName] =
              versionString;
            break;
        }
      }

      // Clean up empty sections
      if (Object.keys(packageJson.dependencies).length === 0) {
        delete packageJson.dependencies;
      }
      if (Object.keys(packageJson.devDependencies).length === 0) {
        delete packageJson.devDependencies;
      }
      if (Object.keys(packageJson.optionalDependencies).length === 0) {
        delete packageJson.optionalDependencies;
      }

      // Write back to file with proper formatting
      writeFileSync(
        this.packageJsonPath,
        JSON.stringify(packageJson, null, 2) + '\n',
      );
    } catch (error) {
      const upgradeError: UpgradeError = {
        type: 'ROLLBACK_FAILED',
        message: `Failed to rollback to target state: ${(error as Error).message}`,
        rollbackAvailable: false,
        details: {
          targetStateCount: targetState.length,
          filePath: this.packageJsonPath,
        },
      };
      throw upgradeError;
    }
  }

  /**
   * Parses a package dependency to extract semver sign and clean version
   */
  private parseDependency(
    packageName: string,
    versionString: string,
    dependencyType: DependencyState['dependencyType'],
  ): DependencyState {
    let semverSign: DependencyState['semverSign'] = 'exact';
    let version = versionString;

    // Parse semver signs
    if (versionString.startsWith('^')) {
      semverSign = '^';
      version = versionString.substring(1);
    } else if (versionString.startsWith('~')) {
      semverSign = '~';
      version = versionString.substring(1);
    } else if (this.isComplexRange(versionString)) {
      // For complex ranges like ">=1.2.3 <2.0.0", "latest", etc., treat as exact
      semverSign = 'exact';
      version = versionString;
    }

    return {
      packageName,
      version,
      semverSign,
      dependencyType,
    };
  }

  /**
   * Builds version string with semver sign
   */
  private buildVersionString(
    version: string,
    semverSign: DependencyState['semverSign'],
  ): string {
    if (semverSign === 'exact') {
      return version;
    }
    return `${semverSign}${version}`;
  }

  /**
   * Checks if version string is a complex range that should be treated as exact
   */
  private isComplexRange(versionString: string): boolean {
    // Detect complex ranges like ">=1.2.3 <2.0.0", "latest", "next", etc.
    return (
      versionString.includes(' ') ||
      versionString.includes('>=') ||
      versionString.includes('<=') ||
      versionString.includes('>') ||
      versionString.includes('<') ||
      versionString === 'latest' ||
      versionString === 'next' ||
      versionString.includes('*')
    );
  }

  /**
   * Getter for project path (used in tests)
   */
  getProjectPath(): string {
    return this.projectPath;
  }
}
