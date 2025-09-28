import { execa } from 'execa';
import type {
  ExecutionResult,
  ScriptConfig,
  UpgradeError,
} from '../models/types.js';

/**
 * PackageManagerAdapter provides unified interface for executing commands
 * across different package managers (npm, yarn, pnpm, bun) and shell commands
 */
export class PackageManagerAdapter {
  private defaultTimeout: number;

  constructor(options?: { defaultTimeout?: number }) {
    this.defaultTimeout = options?.defaultTimeout || 300000; // 5 minutes default
  }

  /**
   * Executes a script configuration in the specified working directory
   */
  async executeScript(
    config: ScriptConfig,
    workingDirectory: string,
  ): Promise<ExecutionResult> {
    // Validate configuration
    this.validateScriptConfig(config);

    const timeout = config.timeout || this.defaultTimeout;
    const startTime = Date.now();

    try {
      const { command, args } = this.buildCommand(config);

      const result = await execa(command, args, {
        cwd: workingDirectory,
        timeout,
        stdio: 'pipe',
        encoding: 'utf8',
        reject: false, // Don't throw on non-zero exit codes
      });

      const duration = Date.now() - startTime;

      return {
        success: result.exitCode === 0,
        exitCode: result.exitCode || 0,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle timeout specifically
      if ((error as any).timedOut) {
        return {
          success: false,
          exitCode: 124, // Timeout exit code
          stdout: '',
          stderr: `Command timed out after ${timeout}ms`,
          duration,
        };
      }

      // Handle other execution errors
      return {
        success: false,
        exitCode: (error as any).exitCode || 1,
        stdout: (error as any).stdout || '',
        stderr: (error as any).stderr || (error as Error).message,
        duration,
      };
    }
  }

  /**
   * Validates script configuration before execution
   */
  private validateScriptConfig(config: ScriptConfig): void {
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
   * Builds the command and arguments based on package manager type
   */
  private buildCommand(config: ScriptConfig): {
    command: string;
    args: string[];
  } {
    switch (config.type) {
      case 'npm':
        return this.buildNpmCommand(config.command);

      case 'yarn':
        return this.buildYarnCommand(config.command);

      case 'pnpm':
        return this.buildPnpmCommand(config.command);

      case 'bun':
        return this.buildBunCommand(config.command);

      case 'shell':
        return this.buildShellCommand(config.command);

      default:
        throw new Error(
          `Unsupported package manager type: ${config.type}`,
        );
    }
  }

  /**
   * Builds npm command and arguments
   */
  private buildNpmCommand(command: string): {
    command: string;
    args: string[];
  } {
    const parts = command.split(' ');

    // Handle npm-specific commands
    if (parts[0] === 'install' || parts[0] === 'i') {
      return { command: 'npm', args: ['install', ...parts.slice(1)] };
    }

    if (parts[0] === 'test') {
      return { command: 'npm', args: ['test', ...parts.slice(1)] };
    }

    if (parts[0] === 'run') {
      return { command: 'npm', args: ['run', ...parts.slice(1)] };
    }

    // For other commands, assume they're npm scripts
    return { command: 'npm', args: ['run', ...parts] };
  }

  /**
   * Builds yarn command and arguments
   */
  private buildYarnCommand(command: string): {
    command: string;
    args: string[];
  } {
    const parts = command.split(' ');

    // Handle yarn-specific commands
    if (parts[0] === 'install' || parts[0] === 'add') {
      return { command: 'yarn', args: parts };
    }

    if (parts[0] === 'test') {
      return { command: 'yarn', args: ['test', ...parts.slice(1)] };
    }

    // For scripts, yarn doesn't need 'run' prefix for most cases
    return { command: 'yarn', args: parts };
  }

  /**
   * Builds pnpm command and arguments
   */
  private buildPnpmCommand(command: string): {
    command: string;
    args: string[];
  } {
    const parts = command.split(' ');

    // Handle pnpm-specific commands
    if (parts[0] === 'install' || parts[0] === 'i') {
      return { command: 'pnpm', args: ['install', ...parts.slice(1)] };
    }

    if (parts[0] === 'test') {
      return { command: 'pnpm', args: ['test', ...parts.slice(1)] };
    }

    if (parts[0] === 'run') {
      return { command: 'pnpm', args: ['run', ...parts.slice(1)] };
    }

    // For other commands, use pnpm run
    return { command: 'pnpm', args: ['run', ...parts] };
  }

  /**
   * Builds bun command and arguments
   */
  private buildBunCommand(command: string): {
    command: string;
    args: string[];
  } {
    const parts = command.split(' ');

    // Handle bun-specific commands
    if (parts[0] === 'install' || parts[0] === 'i') {
      return { command: 'bun', args: ['install', ...parts.slice(1)] };
    }

    if (parts[0] === 'test') {
      return { command: 'bun', args: ['test', ...parts.slice(1)] };
    }

    if (parts[0] === 'run') {
      return { command: 'bun', args: ['run', ...parts.slice(1)] };
    }

    // For other commands, use bun run
    return { command: 'bun', args: ['run', ...parts] };
  }

  /**
   * Builds shell command and arguments
   */
  private buildShellCommand(command: string): {
    command: string;
    args: string[];
  } {
    // For shell commands, use sh -c to handle complex syntax like pipes, redirects, etc.
    return { command: 'sh', args: ['-c', command] };
  }

  /**
   * Checks if a package manager is available on the system
   */
  async isPackageManagerAvailable(
    type: ScriptConfig['type'],
  ): Promise<boolean> {
    if (type === 'shell') {
      return true; // Shell is always available
    }

    try {
      const result = await execa(type, ['--version'], {
        timeout: 5000,
        reject: false,
      });
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }

  /**
   * Gets the version of a package manager
   */
  async getPackageManagerVersion(
    type: ScriptConfig['type'],
  ): Promise<string | null> {
    if (type === 'shell') {
      return 'builtin';
    }

    try {
      const result = await execa(type, ['--version'], {
        timeout: 5000,
      });
      return result.stdout.trim();
    } catch {
      return null;
    }
  }
}
