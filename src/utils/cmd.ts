import type { PackageManager } from 'src/types';

export const createCmd = (
  packageManager: PackageManager,
  name: string,
  version: string,
) => {
  let cmds: string[] = [];

  switch (packageManager) {
    case 'npm':
      cmds = [
        `npm install ${name}@${version}`,
        'npm run test',
        'npm run build',
        'npm run lint',
        'npm run test',
        'npm run lint',
      ];
      break;
    case 'yarn':
      cmds = [
        `yarn add ${name}@${version}`,
        'yarn test',
        'yarn build',
        'yarn lint',
        'yarn test',
        'yarn lint',
      ];
      break;
    case 'pnpm':
      cmds = [
        `pnpm add ${name}@${version}`,
        'pnpm run test',
        'pnpm run build',
        'pnpm run lint',
        'pnpm run test',
        'pnpm run lint',
      ];
      break;
    case 'bun':
      cmds = [
        `bun add ${name}@${version}`,
        'bun test',
        'bun run build',
        'bun run lint',
        'bun test',
        'bun run lint',
      ];
  }

  const cmd = cmds.join(' && ');

  return cmd;
};
