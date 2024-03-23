import MemoryAdapter from 'irisdb/adapters/MemoryAdapter';
import { PublicKey } from 'irisdb-ndk/Hex/PublicKey';

import Node from '../irisdb/Node';
import ndk from './ndk';
import NDKAdapter from './NDKAdapter';

const publicState = (authors: PublicKey[]) =>
  new Node({
    adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
  });

export default publicState;
