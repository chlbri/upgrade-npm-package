import { service } from './machine.machine.service';

const instance = service();

instance.start();

instance.send({
  type: 'START',
  payload: {
    workingDir: process.cwd(),
    packageManager: 'pnpm',
    verbose: true,
  },
});
