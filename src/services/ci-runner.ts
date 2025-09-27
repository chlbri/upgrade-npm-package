import { $ } from 'execa';

export interface CiResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration?: number;
}

/**
 * Service for running CI commands using execa
 * More secure and performant than shelljs
 */
export class CiRunnerService {
  private workingDir: string;

  constructor(workingDir: string = process.cwd()) {
    this.workingDir = workingDir;
  }

  /**
   * Execute a command with execa
   */
  private async executeCommand(command: string): Promise<CiResult> {
    const startTime = Date.now();

    try {
      const result = await $({
        cwd: this.workingDir,
        verbose: process.env.UPGRADE_VERBOSE === 'true' ? 'short' : 'none',
        timeout: 300000, // 5 minutes timeout
      })`${command}`;

      return {
        success: true,
        exitCode: 0,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: Date.now() - startTime,
      };
    } catch (error: any) {
      return {
        success: false,
        exitCode: error.exitCode || 1,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Run pnpm run ci:admin command
   */
  async runCiAdmin(): Promise<CiResult> {
    return this.executeCommand('pnpm run ci:admin');
  }

  /**
   * Run pnpm run ci command
   */
  async runCi(): Promise<CiResult> {
    return this.executeCommand('pnpm run ci');
  }

  /**
   * Run pnpm install to sync lockfile
   */
  async syncLockfile(): Promise<CiResult> {
    return this.executeCommand('pnpm install');
  }
}
