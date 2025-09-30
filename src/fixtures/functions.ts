import { execa } from 'execa';
import { TEST_CONFIG, TIMER } from './constants';
import type { StateValue } from '@bemedev/app-ts/lib/states/types.js';
import { vi, expect, test, afterAll } from 'vitest';

export const resetTest = (index = 1) => {
  const testName = `#${String(index).padStart(2, '0')} => Reset first`;
  return [
    testName,
    async () => {
      await execa({
        stdout: ['pipe', 'inherit'],
        stderr: ['pipe', 'inherit'],
      })`pnpm add @typescript-eslint/eslint-plugin@8.44.1 @typescript-eslint/parser@8.44.1`;
    },
    // Long timeout for CI : 5 minutes
    TIMER / 2,
  ] as const;
};

export const waitFor = (index = 1) => {
  const testName = `#${String(index).padStart(2, '0')} => await for completion`;
  return [
    testName,
    () => {
      return vi.waitFor(
        () => {
          const check =
            TEST_CONFIG.state === 'success' ||
            TEST_CONFIG.state === 'errors';
          expect(check).toBe(true);
          TEST_CONFIG.state = undefined;
        },
        {
          timeout: TIMER / 1.3,
        },
      );
    },
    // Long timeout for CI : 10 minutes
    TIMER,
  ] as const;
};

export const insideS = (state: StateValue, index = 1) => {
  const testName = `#${String(index).padStart(2, '0')} => The state is ${state}`;
  test(testName, () => {
    return expect(TEST_CONFIG.state).toBe(state);
  });
};

export const checkStates = (index: number, ...states: StateValue[]) => {
  states.forEach((state, index2) => {
    const testName = `#${String(index + index2).padStart(2, '0')} => The state was iterated`;
    test(testName, () => {
      return expect(TEST_CONFIG.states).toContainEqual(state);
    });
  });

  afterAll(() => {
    TEST_CONFIG.state = undefined;
    TEST_CONFIG.states = [];
  });
};
