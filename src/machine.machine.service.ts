import { interpret } from '@bemedev/app-ts';
import { deepEqual } from '@bemedev/app-ts/lib/utils';
import { provider } from './machine.machine.provider';

export const service = () =>
  interpret(provider, {
    context: {
      errors: {},
      upgradeds: [],
      warnings: {},
    },
    pContext: {
      files: {
        packageJson: {},
      },
      dependencies: {
        initials: [],
        upgradables: [],
      },
    },
  });

const instance = service();

instance.start();

instance.subscribe(
  ({ value, context }) => {
    console.log('State changed:', value);
    console.log('context', context);
  },
  { equals: (a, b) => deepEqual(a.value, b.value) },
);

instance.send({
  type: 'START',
  payload: {
    workingDir: process.cwd(),
    packageManager: 'pnpm',
    verbose: true,
  },
});

setTimeout(() => {
  instance.stop();
}, 25_000);
