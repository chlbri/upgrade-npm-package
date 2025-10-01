import { partialCall } from '#bemedev/features/functions/functions/partialCall';
import { command, flag, option, string, extendType } from 'cmd-ts';
import { upgrade as handler } from '../upgrade';
import { parseAsync } from 'valibot';
import { PackageManagerSchema } from 'src/schemas';
import { DESCRIPTION, NAME } from './constants';

const pm = extendType(string, {
  from: partialCall(parseAsync, PackageManagerSchema),
  description: 'Package manager to use (npm, yarn, pnpm or bun)',
  // defaultValue: () => 'pnpm',
  displayName: 'PackageManager',
});

export const upgradeCommand = command({
  name: NAME,
  description: DESCRIPTION,
  args: {
    // You can add arguments here if needed
    workingDir: option({
      type: string,
      long: 'cwd',
      short: 'c',
      description: 'Working directory',
      defaultValue: () => process.cwd(),
    }),
    packageManager: option({
      type: pm,
      long: 'package',
      short: 'p',
      defaultValue: () => 'pnpm' as const,
    }),
    verbose: flag({
      long: 'verbose',
      short: 'v',
      description: 'Enable verbose logging',
      defaultValue: () => false,
    }),
  },
  handler,
});
