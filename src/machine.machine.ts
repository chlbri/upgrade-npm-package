import { createMachine, typings } from '@bemedev/app-ts';

export const machine = createMachine(
  {
    states: {
      idle: {},
    },
    initial: 'idle',
  },
  typings({}),
);
