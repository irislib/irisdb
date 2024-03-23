import MemoryAdapter from 'irisdbadapters/MemoryAdapter.ts';
import NDKAdapter from 'irisdbadapters/NDKAdapter.ts';
import ndk from '@/shared/ndk.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

import Node from '../irisdb/Node.ts';

const publicState = (authors: PublicKey[]) =>
  new Node({
    adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
  });

export default publicState;
