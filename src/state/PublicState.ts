import ndk from '@/shared/ndk.ts';
import MemoryAdapter from '@/state/MemoryAdapter.ts';
import NDKAdapter from '@/state/NDKAdapter.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

import Node from './Node';

const publicState = (authors: PublicKey[]) =>
  new Node({
    adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
  });

export default publicState;
