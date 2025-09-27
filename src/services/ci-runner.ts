import { exec } from 'shelljs';

export interface CiResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Service for running CI commands using shelljs
 */
export class CiRunnerService {
  private workingDir: string;

  constructor(workingDir: string = process.cwd()) {
    this.workingDir = workingDir;
  }

  /**
   * Run pnpm run ci:admin command
   */
  runCiAdmin(): CiResult {
    const result = exec('pnpm run ci:admin', {
      cwd: this.workingDir,
      silent: true,
    });

    return {
      success: result.code === 0,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }

  /**
   * Run pnpm run ci command
   */
  runCi(): CiResult {
    const result = exec('pnpm run ci', {
      cwd: this.workingDir,
      silent: true,
    });

    return {
      success: result.code === 0,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }

  /**
   * Run pnpm install to sync lockfile
   */
  syncLockfile(): CiResult {
    const result = exec('pnpm install', {
      cwd: this.workingDir,
      silent: true,
    });

    return {
      success: result.code === 0,
      exitCode: result.code,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  }
}
