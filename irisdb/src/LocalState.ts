import { BroadcastChannelAdapter } from './adapters/BroadcastChannelAdapter.ts';
import { LocalStorageMemoryAdapter } from './adapters/LocalStorageMemoryAdapter.ts';
import { Node } from './Node';

const NAME = 'localState';
const localState = new Node({
  id: NAME,
  adapters: [new LocalStorageMemoryAdapter(), new BroadcastChannelAdapter(NAME)],
});

export { localState };
