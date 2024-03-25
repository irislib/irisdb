import { MemoryAdapter, Node } from 'irisdb';
import { PublicKey } from 'irisdb-ndk/Hex/PublicKey';

import ndk from './ndk';
import NDKAdapter from './NDKAdapter';

const publicState = (authors: PublicKey[]) =>
  new Node({
    adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
  });

export default publicState;
