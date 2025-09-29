import { interpret } from '@bemedev/app-ts';
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
