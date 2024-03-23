import BroadcastChannelAdapter from 'irisdb/adapters/BroadcastChannelAdapter';
import LocalStorageMemoryAdapter from 'irisdb/adapters/LocalStorageMemoryAdapter';

import Node from './Node';

const NAME = 'localState';
const localState = new Node({
  id: NAME,
  adapters: [new LocalStorageMemoryAdapter(), new BroadcastChannelAdapter(NAME)],
});

export default localState;
