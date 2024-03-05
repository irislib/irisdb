import MemoryAdapter from '@/state/MemoryAdapter.ts';
import ndk from '@/shared/ndk.ts';

import Node from './Node';
import NDKAdapter from "@/state/NDKAdapter.ts";

const publicState = (authors: string[]) => new Node({
  adapters: [new MemoryAdapter(), new NDKAdapter(ndk, authors)],
});

export default publicState;
