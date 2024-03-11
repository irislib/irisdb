import { useCallback, useEffect, useMemo, useState } from 'react';

import localState from '@/state/LocalState.ts';
import Node from '@/state/Node.ts';
import publicState from '@/state/PublicState.ts';
import { JsonValue } from '@/state/types.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

function useNodeState(node: Node, key: string, initialValue: any = undefined, once = false) {
  useEffect(() => {
    if (!initialValue) {
      node.get(key).once((val) => {
        initialValue = val;
      });
    }
  }, [node, key, initialValue]);
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    console.log('subscribing to', key, 'with once', once);
    const unsub = node.get(key).on((new_value, _key, _updatedAt, unsubscribe) => {
      console.log('new value for', key, 'is', new_value, 'with once', once);
      setValue(new_value);
      if (once) {
        unsubscribe();
      }
    });
    return unsub;
  }, [node, key, once]);
  const setter = useCallback(
    (new_value: JsonValue) => {
      node.get(key).put(new_value);
    },
    [node, key],
  );
  return [value, setter];
}

export function useLocalState(key: string, initialValue: any = undefined) {
  return useNodeState(localState, key, initialValue);
}

export function usePublicState(authors: string[], key: string, initialValue: any = undefined) {
  const node = useMemo(() => publicState(authors.map((a) => new PublicKey(a))), [authors]);
  console.log('authors', authors, 'node', node, 'key', key, 'initialValue', initialValue);
  return useNodeState(node, key, initialValue);
}
