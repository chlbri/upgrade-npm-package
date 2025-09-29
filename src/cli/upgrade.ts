import { boolean, command, flag, option, string } from 'cmd-ts';
import {
  formatEnhancedUpgradeResult,
  formatSummaryReport,
} from '../libs/report.js';
import { ScriptConfig, UpgradeOptions } from '../models/types.js';
import { UpgradeOrchestrator } from '../services/upgrade-orchestrator.js';
import {
  DEFAULT_PACKAGE_MANAGER,
  DEFAULT_SCRIPT_TIMEOUT,
  INSTALL_COMMANDS,
  VALID_PACKAGE_MANAGERS,
} from './constants.js';

export const upgradeCommand = command({
  name: 'upgrade-npm-package',
  description:
    'Safe dependency upgrader with fallback - lists newer versions and performs iterative upgrades with CI gating',
  version: '0.1.0',
  args: {
    admin: flag({
      type: boolean,
      long: 'admin',
      description:
        'Run admin fast-path mode (ci:admin only, no iterative upgrades)',
      defaultValue: () => false,
      env: 'UPGRADE_ADMIN_MODE',
    }),

    verbose: flag({
      type: boolean,
      long: 'verbose',
      short: 'e',
      description: 'Enable detailed logging and progress information',
      defaultValue: () => false,
      env: 'UPGRADE_VERBOSE',
    }),

    workingDir: option({
      type: string,
      long: 'working-dir',
      short: 'd',
      description:
        'Target directory containing package.json (default: current directory)',
      defaultValue: () => process.cwd(),
    }),

    // Enhanced options for rollback mechanism
    rollback: flag({
      type: boolean,
      long: 'rollback',
      description: 'Enable rollback on failure (default: true)',
      defaultValue: () => true,
      env: 'UPGRADE_ROLLBACK',
    }),

    // Required script configurations
    testScript: option({
      type: string,
      long: 'test-script',
      description: 'Test script command (required for enhanced mode)',
      env: 'UPGRADE_TEST_SCRIPT',
      defaultValue: () => 'npm test',
    }),

    buildScript: option({
      type: string,
      long: 'build-script',
      description: 'Build script command (required for enhanced mode)',
      env: 'UPGRADE_BUILD_SCRIPT',
      defaultValue: () => 'npm run build',
    }),

    lintScript: option({
      type: string,
      long: 'lint-script',
      description: 'Lint script command (required for enhanced mode)',
      env: 'UPGRADE_LINT_SCRIPT',
      defaultValue: () => 'npm run lint',
    }),

    // Package manager configuration
    packageManager: option({
      type: string,
      long: 'package-manager',
      short: 'pm',
      description: 'Package manager to use (npm, yarn, pnpm, bun)',
      defaultValue: () => DEFAULT_PACKAGE_MANAGER,
      env: 'UPGRADE_PACKAGE_MANAGER',
    }),

    // Script timeout configuration
    scriptTimeout: option({
      type: string,
      long: 'script-timeout',
      description: `Script execution timeout in milliseconds (default: ${DEFAULT_SCRIPT_TIMEOUT})`,
      defaultValue: () => DEFAULT_SCRIPT_TIMEOUT.toString(),
      env: 'UPGRADE_SCRIPT_TIMEOUT',
    }),
  },
  handler: async (args): Promise<void> => {
    try {
      // Validate package manager type
      if (!VALID_PACKAGE_MANAGERS.includes(args.packageManager as any)) {
        console.error(
          `❌ Invalid package manager: ${args.packageManager}`,
        );
        console.error(
          `Valid options: ${VALID_PACKAGE_MANAGERS.join(', ')}`,
        );
        process.exit(1);
      }

      const packageManagerType = args.packageManager as
        | 'npm'
        | 'yarn'
        | 'pnpm'
        | 'bun';
      const scriptTimeout = parseInt(args.scriptTimeout, 10);

      if (isNaN(scriptTimeout) || scriptTimeout <= 0) {
        console.error(`❌ Invalid script timeout: ${args.scriptTimeout}`);
        process.exit(1);
      }

      // Determine if we should use enhanced mode (with rollback)
      const useEnhancedMode = args.testScript && args.buildScript && args.lintScript;

      if (args.verbose) {
        console.log('🔧 Upgrade options:', {
          mode: args.admin
            ? 'admin-fastpath'
            : useEnhancedMode
              ? 'enhanced-iterative'
              : 'legacy-iterative',
          workingDir: args.workingDir,
          packageManager: packageManagerType,
          rollbackEnabled: args.rollback,
          scriptTimeout,
        });
      }

      // Change to target directory if specified
      if (args.workingDir !== process.cwd()) {
        process.chdir(args.workingDir);
        if (args.verbose) {
          console.log(`📁 Changed to directory: ${args.workingDir}`);
        }
      }

      const orchestrator = new UpgradeOrchestrator(args.workingDir);

      if (useEnhancedMode) {
        // Use enhanced mode with rollback capabilities
        const testScript: ScriptConfig = {
          type: packageManagerType,
          command: args.testScript!,
          timeout: scriptTimeout,
        };

        const buildScript: ScriptConfig = {
          type: packageManagerType,
          command: args.buildScript!,
          timeout: scriptTimeout,
        };

        const lintScript: ScriptConfig = {
          type: packageManagerType,
          command: args.lintScript!,
          timeout: scriptTimeout,
        };

        const installScript: ScriptConfig = {
          type: packageManagerType,
          command: INSTALL_COMMANDS[packageManagerType],
          timeout: scriptTimeout,
        };

        const upgradeOptions: UpgradeOptions = {
          workingDir: args.workingDir,
          verbose: args.verbose,
          admin: args.admin,
          testScript,
          buildScript,
          lintScript,
          installScript,
          packageManager: packageManagerType,
          rollbackOnFailure: args.rollback,
        };

        if (args.verbose) {
          console.log(
            '🚀 Running enhanced upgrade with rollback support...',
          );
        }

        const result =
          await orchestrator.upgradeWithRollback(upgradeOptions);

        // Enhanced reporting for rollback result
        console.log(formatEnhancedUpgradeResult(result));

        // Exit codes: 0 = success, 1 = some upgrades failed but process completed
        const hasFailures =
          result.errors.length > 0 ||
          (result.rollbackErrors && result.rollbackErrors.length > 0);
        process.exit(hasFailures ? 1 : 0);
      } else {
        // Use legacy mode
        if (args.verbose) {
          console.log('🔄 Running legacy upgrade mode...');
          if (!args.testScript || !args.buildScript) {
            console.log(
              '💡 Tip: Provide --test-script and --build-script for enhanced rollback capabilities',
            );
          }
        }

        const report = await orchestrator.upgrade();

        console.log(formatSummaryReport(report));

        // Exit codes: 0 = success, 1 = some upgrades failed but process completed
        const hasFailures =
          report.skipped.length > 0 || report.warnings.length > 0;
        process.exit(hasFailures ? 1 : 0);
      }
    } catch (error) {
      console.error('❌ Upgrade failed:', error);
      process.exit(1);
    }
  },
});
