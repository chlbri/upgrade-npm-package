import { boolean, command, flag, option, run, string } from 'cmd-ts';
import { formatSummaryReport } from '../lib/report.js';
import { UpgradeOrchestrator } from '../services/upgrade-orchestrator.js';

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
  },
  handler: async (args): Promise<void> => {
    try {
      if (args.verbose) {
        console.log('🔧 Upgrade options:', {
          mode: args.admin ? 'admin-fastpath' : 'iterative',
          workingDir: args.workingDir,
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

      const report = await orchestrator.upgrade();

      console.log(formatSummaryReport(report));

      // Exit codes: 0 = success, 1 = some upgrades failed but process completed
      const hasFailures =
        report.skipped.length > 0 || report.warnings.length > 0;
      process.exit(hasFailures ? 1 : 0);
    } catch (error) {
      console.error('❌ Upgrade failed:', error);
      process.exit(1);
    }
  },
});

export async function main() {
  await run(upgradeCommand, process.argv.slice(2));
}
