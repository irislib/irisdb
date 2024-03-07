import BroadcastChannelAdapter from '@/state/BroadcastChannelAdapter.ts';
import LocalStorageMemoryAdapter from '@/state/LocalStorageMemoryAdapter.ts';

import Node from './Node';

const NAME = 'localState';
const localState = new Node({
  id: NAME,
  adapters: [new LocalStorageMemoryAdapter(), new BroadcastChannelAdapter(NAME)],
});

export default localState;
