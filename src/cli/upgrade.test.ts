import { runSafely } from 'cmd-ts';
import { upgradeCommand } from './upgrade';
import { DESCRIPTION, NAME } from './constants';
import {
  waitFor,
  checkStates,
  TEST_CONFIG,
  resetTest,
} from 'src/fixtures';

describe.skipIf(process.env.NO_ENTER1 === 'true')(
  'Upgrade Command',
  () => {
    beforeAll(() => (process.env.NO_ENTER1 = 'true'));
    afterAll(() => (process.env.NO_ENTER1 = 'false'));

    test.skipIf(process.env.NO_ENTER1 === 'true')(
      '#01 => should show help',
      async () => {
        const value = await runSafely(upgradeCommand, ['--help']);
        if (value._tag === 'error') {
          const config = value.error.config;
          expect(config).toBeDefined();
          expect(config.exitCode).toBe(0);
          expect(config.message).toBeDefined();
          expect(config.message).toContain(NAME);
          expect(config.message).toContain(DESCRIPTION);
        }
      },
    );

    test('#02 => should show help', async () => {
      const value = await runSafely(upgradeCommand, ['-h']);
      if (value._tag === 'error') {
        const config = value.error.config;
        expect(config).toBeDefined();
        expect(config.exitCode).toBe(0);
        expect(config.message).toBeDefined();
        expect(config.message).toContain(NAME);
        expect(config.message).toContain(DESCRIPTION);
      }
    });

    describe('#03 => Working', () => {
      describe('#01 => Not reset at first', () => {
        test('#01 =>should run with default options', async () => {
          return runSafely(upgradeCommand, []);
        });

        test(...waitFor(2));
        checkStates(3, 'success', 'idle');

        afterAll(() => {
          console.log(JSON.stringify(TEST_CONFIG, null, 2));
        });
      });

      describe('#01 => Not reset at first', () => {
        test(...resetTest(0));

        test('#01 =>should run with default options', async () => {
          return runSafely(upgradeCommand, []);
        });

        test(...waitFor(2));
        checkStates(3, 'success', 'idle');

        afterAll(() => {
          console.log(JSON.stringify(TEST_CONFIG, null, 2));
        });
      });
    });
  },
);
