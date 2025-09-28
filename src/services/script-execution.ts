import type {
  ExecutionResult,
  ScriptConfig,
  UpgradeError,
} from '../models/types.js';
import { PackageManagerAdapter } from './package-manager-adapter.js';

/**
 * Configuration options for ScriptExecutionService
 */
export interface ScriptExecutionOptions {
  defaultTimeout?: number;
  maxBufferSize?: number;
}

/**
 * ScriptExecutionService provides high-level script execution with timeout handling,
 * package manager integration, and detailed ExecutionResult reporting
 */
export class ScriptExecutionService {
  private packageManagerAdapter: PackageManagerAdapter;
  private defaultTimeout: number;
  private maxBufferSize: number;

  constructor(options?: ScriptExecutionOptions) {
    this.defaultTimeout = options?.defaultTimeout || 300000; // 5 minutes
    this.maxBufferSize = options?.maxBufferSize || 1024 * 1024; // 1MB

    this.packageManagerAdapter = new PackageManagerAdapter({
      defaultTimeout: this.defaultTimeout,
    });
  }

  /**
   * Executes a script configuration and returns detailed ExecutionResult
   */
  async executeScript(
    config: ScriptConfig,
    workingDirectory: string,
  ): Promise<ExecutionResult> {
    // Validate inputs
    this.validateInputs(config, workingDirectory);

    try {
      // Use package manager adapter for execution
      const result = await this.packageManagerAdapter.executeScript(
        config,
        workingDirectory,
      );

      // Enhance result with additional validation
      return this.enhanceExecutionResult(result);
    } catch (error) {
      // Handle service-level errors
      return this.handleExecutionError(error);
    }
  }

  /**
   * Validates script configuration and working directory
   */
  private validateInputs(
    config: ScriptConfig,
    workingDirectory: string,
  ): void {
    if (!config) {
      const error: UpgradeError = {
        type: 'VALIDATION_FAILED',
        message: 'Script configuration is required',
        rollbackAvailable: false,
      };
      throw error;
    }

    if (!config.command || config.command.trim() === '') {
      const error: UpgradeError = {
        type: 'VALIDATION_FAILED',
        message: 'Script command cannot be empty',
        rollbackAvailable: false,
      };
      throw error;
    }

    if (config.timeout !== undefined && config.timeout <= 0) {
      const error: UpgradeError = {
        type: 'VALIDATION_FAILED',
        message: 'Script timeout must be positive',
        rollbackAvailable: false,
      };
      throw error;
    }

    if (!workingDirectory || workingDirectory.trim() === '') {
      const error: UpgradeError = {
        type: 'VALIDATION_FAILED',
        message: 'Working directory is required',
        rollbackAvailable: false,
      };
      throw error;
    }

    // Validate script type
    const validTypes: ScriptConfig['type'][] = [
      'npm',
      'yarn',
      'pnpm',
      'bun',
      'shell',
    ];
    if (!validTypes.includes(config.type)) {
      const error: UpgradeError = {
        type: 'VALIDATION_FAILED',
        message: `Invalid script type: ${config.type}. Must be one of: ${validTypes.join(', ')}`,
        rollbackAvailable: false,
      };
      throw error;
    }
  }

  /**
   * Enhances ExecutionResult with additional metadata and validation
   */
  private enhanceExecutionResult(
    result: ExecutionResult,
  ): ExecutionResult {
    // Ensure all required properties are present
    const enhancedResult: ExecutionResult = {
      success: result.success,
      exitCode: result.exitCode,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      duration: result.duration || 0,
    };

    // Validate duration is reasonable
    if (enhancedResult.duration < 0) {
      enhancedResult.duration = 0;
    }

    // Truncate output if it exceeds buffer size
    if (enhancedResult.stdout.length > this.maxBufferSize) {
      const truncated = enhancedResult.stdout.substring(
        0,
        this.maxBufferSize,
      );
      enhancedResult.stdout = `${truncated}\n\n[Output truncated - exceeded ${this.maxBufferSize} bytes]`;
    }

    if (enhancedResult.stderr.length > this.maxBufferSize) {
      const truncated = enhancedResult.stderr.substring(
        0,
        this.maxBufferSize,
      );
      enhancedResult.stderr = `${truncated}\n\n[Output truncated - exceeded ${this.maxBufferSize} bytes]`;
    }

    return enhancedResult;
  }

  /**
   * Handles execution errors and converts them to ExecutionResult
   */
  private handleExecutionError(error: unknown): ExecutionResult {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown execution error';

    return {
      success: false,
      exitCode: 1,
      stdout: '',
      stderr: `Script execution failed: ${errorMessage}`,
      duration: 0,
    };
  }

  /**
   * Checks if a package manager is available for the given script type
   */
  async isPackageManagerAvailable(
    type: ScriptConfig['type'],
  ): Promise<boolean> {
    return this.packageManagerAdapter.isPackageManagerAvailable(type);
  }

  /**
   * Gets the version of a package manager
   */
  async getPackageManagerVersion(
    type: ScriptConfig['type'],
  ): Promise<string | null> {
    return this.packageManagerAdapter.getPackageManagerVersion(type);
  }

  /**
   * Executes multiple scripts sequentially
   */
  async executeScriptsSequentially(
    scripts: ScriptConfig[],
    workingDirectory: string,
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (const script of scripts) {
      const result = await this.executeScript(script, workingDirectory);
      results.push(result);

      // Stop on first failure if needed
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  /**
   * Executes the three required scripts (install, test, build) in order
   */
  async executeRequiredScripts(
    installScript: ScriptConfig,
    testScript: ScriptConfig,
    buildScript: ScriptConfig,
    workingDirectory: string,
  ): Promise<{
    install: ExecutionResult;
    test: ExecutionResult;
    build: ExecutionResult;
    allSuccessful: boolean;
  }> {
    // Execute in order: install -> test -> build
    const installResult = await this.executeScript(
      installScript,
      workingDirectory,
    );

    // Only proceed to test if install succeeded
    let testResult: ExecutionResult;
    if (installResult.success) {
      testResult = await this.executeScript(testScript, workingDirectory);
    } else {
      testResult = {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: 'Skipped due to install failure',
        duration: 0,
      };
    }

    // Only proceed to build if test succeeded
    let buildResult: ExecutionResult;
    if (testResult.success) {
      buildResult = await this.executeScript(
        buildScript,
        workingDirectory,
      );
    } else {
      buildResult = {
        success: false,
        exitCode: -1,
        stdout: '',
        stderr: 'Skipped due to test failure',
        duration: 0,
      };
    }

    const allSuccessful =
      installResult.success && testResult.success && buildResult.success;

    return {
      install: installResult,
      test: testResult,
      build: buildResult,
      allSuccessful,
    };
  }

  /**
   * Gets the default timeout value
   */
  getDefaultTimeout(): number {
    return this.defaultTimeout;
  }

  /**
   * Gets the maximum buffer size for output
   */
  getMaxBufferSize(): number {
    return this.maxBufferSize;
  }
}
