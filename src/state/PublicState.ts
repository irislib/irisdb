import ndk from '@/shared/ndk.ts';
import MemoryAdapter from '@/state/MemoryAdapter.ts';
import NDKAdapter from '@/state/NDKAdapter.ts';

import Node from './Node';

const publicState = (authors: string[]) =>
  new Node({
    adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
  });

export default publicState;
