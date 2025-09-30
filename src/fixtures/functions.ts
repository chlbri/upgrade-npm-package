import type { StateValue } from '@bemedev/app-ts/lib/states/types.js';
import { execa } from 'execa';
import { afterAll, expect, vi } from 'vitest';
import { TIMER } from './constants';
import { TEST_CONFIG } from '../cli/constants';

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
  const _state = JSON.stringify(state, null, 2);

  const testName = `#${String(index).padStart(2, '0')} => The state is (${_state})`;

  return [
    testName,
    () => expect(TEST_CONFIG.states).toContainEqual(state),
  ] as const;
};

export const parameterize = () => {
  beforeAll(() => (process.env.NO_ENTER = 'true'));
  afterAll(() => (process.env.NO_ENTER = 'false'));
};

export const rinitTests = () => {
  TEST_CONFIG.state = undefined;
  TEST_CONFIG.states = [];
};
