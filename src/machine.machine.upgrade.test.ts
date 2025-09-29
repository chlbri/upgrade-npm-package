import { service } from './machine.machine.service';

describe('Upgrade this !', () => {
  const TIMER = 300_000;

  beforeAll(() => {
    console.time('service');
  });

  afterAll(() => {
    console.timeEnd('service');
  });

  const instance = service();

  test('#01 => Start the service', instance.start);

  test('#02 => Send START event', () => {
    instance.send({
      type: 'START',
      payload: {
        workingDir: process.cwd(),
        packageManager: 'pnpm',
        verbose: true,
      },
    });
  });

  test(
    '#03 => Wait for the service to reach the end',
    () =>
      setTimeout(() => {
        instance.stop();
      }, TIMER / 1.5),
    TIMER,
  );
});
