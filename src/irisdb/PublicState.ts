import MemoryAdapter from '@/irisdb/adapters/MemoryAdapter.ts';
import NDKAdapter from '@/irisdb/adapters/NDKAdapter.ts';
import ndk from '@/shared/ndk.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

import Node from './Node';

const publicState = (authors: PublicKey[]) =>
  new Node({
    adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
  });

export default publicState;
