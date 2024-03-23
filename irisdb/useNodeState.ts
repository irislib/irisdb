import { useCallback, useEffect, useMemo, useState } from 'react';

import localState from 'irisdb/LocalState.ts';
import Node from 'irisdb/Node.ts';
import publicState from 'irisdb/PublicState.ts';
import { JsonValue } from 'irisdb/types.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

/**
 * Similar to React's useState, but for a Node's value. Lets you easily persist your application state locally or sync it over the network.
 * @param node
 * @param key
 * @param initialValue
 * @param once
 * @example const [value, setValue] = useNodeState(publicState, 'apps/canvas/documents/test/name', 'Untitled Canvas'})
 */
export function useNodeState(node: Node, key: string, initialValue: any = undefined, once = false) {
  useEffect(() => {
    if (!initialValue) {
      node.get(key).once((val) => {
        initialValue = val;
      });
    }
  }, [node, key, initialValue]);
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    const unsub = node.get(key).on((new_value, _key, _updatedAt, unsubscribe) => {
      setValue(new_value);
      if (once) {
        unsubscribe();
      }
    });
    return unsub;
  }, [node, key, once]);
  const setter = useCallback(
    (new_value: JsonValue) => {
      console.log('setting', key, new_value);
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
  return useNodeState(node, key, initialValue);
}
