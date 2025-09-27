import editJsonFile from 'edit-json-file';

export interface PackageJsonData {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

/**
 * Service for editing package.json safely using edit-json-file
 */
export class PackageJsonService {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Update a dependency version in the specified section
   */
  updateDependency(
    packageName: string,
    newVersion: string,
    section: 'dependencies' | 'devDependencies' | 'optionalDependencies',
  ): void {
    const file = editJsonFile(this.filePath);
    file.set(`${section}.${packageName}`, newVersion);
    file.save();
  }

  /**
   * Get current version of a package from package.json
   */
  getCurrentVersion(
    packageName: string,
    section: 'dependencies' | 'devDependencies' | 'optionalDependencies',
  ): string | null {
    const file = editJsonFile(this.filePath);
    return file.get(`${section}.${packageName}`) || null;
  }

  /**
   * Get all dependencies from all sections
   */
  getAllDependencies(): PackageJsonData {
    const file = editJsonFile(this.filePath);
    return {
      dependencies: file.get('dependencies') || {},
      devDependencies: file.get('devDependencies') || {},
      optionalDependencies: file.get('optionalDependencies') || {},
    };
  }

  /**
   * Backup current state (for rollback)
   */
  backup(): PackageJsonData {
    return this.getAllDependencies();
  }

  /**
   * Restore from backup
   */
  restore(backup: PackageJsonData): void {
    const file = editJsonFile(this.filePath);

    if (backup.dependencies) {
      file.set('dependencies', backup.dependencies);
    }
    if (backup.devDependencies) {
      file.set('devDependencies', backup.devDependencies);
    }
    if (backup.optionalDependencies) {
      file.set('optionalDependencies', backup.optionalDependencies);
    }

    file.save();
  }
}
