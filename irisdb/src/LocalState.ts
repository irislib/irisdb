import BroadcastChannelAdapter from './adapters/BroadcastChannelAdapter';
import LocalStorageMemoryAdapter from './adapters/LocalStorageMemoryAdapter';
import Node from './Node';

const NAME = 'localState';
const localState = new Node({
  id: NAME,
  adapters: [new LocalStorageMemoryAdapter(), new BroadcastChannelAdapter(NAME)],
});

export { localState };
