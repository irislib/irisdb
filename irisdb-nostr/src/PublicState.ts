import { MemoryAdapter, Node } from 'irisdb/src';

import { PublicKey } from './Hex/PublicKey.ts';
import ndk from './ndk';
import NDKAdapter from './NDKAdapter';

const publicState = (authors: string | Array<string | PublicKey>) => {
  let pks;
  if (typeof authors === 'string') {
    pks = [new PublicKey(authors)];
  } else {
    pks = authors.map((a) => {
      if (a instanceof PublicKey) {
        return a;
      } else {
        return new PublicKey(a);
      }
    });
  }
  return new Node({
    adapters: [new MemoryAdapter(), new NDKAdapter(ndk, pks)],
  });
};

export default publicState;
