import { useMemo } from 'react';

import { useNodeState } from '../irisdb';
import { PublicKey } from './Hex/PublicKey';
import publicState from './PublicState';

export function usePublicState(authors: string[], key: string, initialValue: any = undefined) {
  const node = useMemo(() => publicState(authors.map((a) => new PublicKey(a))), [authors]);
  return useNodeState(node, key, initialValue);
}
