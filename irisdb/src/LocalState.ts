import { BroadcastChannelAdapter, LocalStorageMemoryAdapter } from 'irisdb';

import { Node } from './Node';

const NAME = 'localState';
const localState = new Node({
  id: NAME,
  adapters: [new LocalStorageMemoryAdapter(), new BroadcastChannelAdapter(NAME)],
});

export { localState };
