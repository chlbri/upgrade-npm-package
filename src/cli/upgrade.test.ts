import { runSafely } from 'cmd-ts';
import {
  CAN_TEST,
  insideS,
  parameterize,
  resetTest,
  rinitTests,
  waitFor,
} from 'src/fixtures';
import { DESCRIPTION, NAME } from './constants';
import { upgradeCommand } from './upgrade';

describe.skipIf(CAN_TEST)('Upgrade Command', () => {
  parameterize();

  test('#01 => should show help', async () => {
    const value = await runSafely(upgradeCommand, ['--help']);
    if (value._tag === 'error') {
      const config = value.error.config;
      expect(config).toBeDefined();
      expect(config.exitCode).toBe(0);
      expect(config.message).toBeDefined();
      expect(config.message).toContain(NAME);
      expect(config.message).toContain(DESCRIPTION);
    }
  });

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
      test(...insideS('idle', 3));
      test(...insideS('success', 4));
      afterAll(rinitTests);
    });

    describe('#02 => Reset at first', () => {
      test(...resetTest(0));

      test('#01 =>should run with default options', async () => {
        return runSafely(upgradeCommand, []);
      });

      test(...waitFor(2));
      test(...insideS('idle', 3));
      test(...insideS('success', 4));
      afterAll(rinitTests);
    });
  });
});
