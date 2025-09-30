import type { EventsMapFrom } from '@bemedev/app-ts';
import type { EventArg } from '@bemedev/app-ts/lib/events';
import type { machine } from './machine.machine';
import { service } from './machine.machine.service';
import { deepEqual } from '@bemedev/app-ts/lib/utils/index.js';
import { TEST_CONFIG } from './fixtures';

type Payload = Extract<
  EventArg<EventsMapFrom<typeof machine>>,
  { type: 'START' }
>['payload'];

export const upgrade = async (payload: Payload) => {
  const instance = service();

  instance.subscribe(state => {
    TEST_CONFIG.state = state.value;
    const last = TEST_CONFIG.states.at(-1);
    const check = deepEqual(last, TEST_CONFIG.state);
    if (check) return;
    TEST_CONFIG.states.push(TEST_CONFIG.state);
  });

  instance.subscribe(state => {
    console.log('STATE_VALUE', state.value);
  });

  await instance.start();

  return instance.send({ type: 'START', payload });
};
