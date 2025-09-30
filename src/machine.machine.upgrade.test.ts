import { upgrade } from './upgrade';
import { resetTest, waitFor } from './fixtures';

describe.skipIf(process.env.NO_ENTER1 === 'true')('Upgrade', () => {
  beforeAll(() => (process.env.NO_ENTER1 = 'true'));
  afterAll(() => (process.env.NO_ENTER1 = 'false'));

  test(...resetTest(1));

  test('#02 => Upgrade', () => {
    return upgrade({
      workingDir: process.cwd(),
      packageManager: 'pnpm',
      verbose: true,
    });
  });

  test(...waitFor(3));
});
