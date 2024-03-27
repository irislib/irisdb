import { JsonValue } from 'irisdb/src';
import { publicState } from 'irisdb-nostr/src';
import { useMemo } from 'react';

import { useNodeState } from './useNodeState.ts';

/**
 * React hook to get a public state node with the given authors. A bit similar to React's useState.
 *
 * irisdb-nostr peer dependency is required for this hook to work.
 *
 * @param authors
 * @param path
 * @param initialValue
 */
export function usePublicState<T = JsonValue>(authors: string[], path: string, initialValue: T) {
  const node = useMemo(() => publicState(authors), [authors]);
  return useNodeState<T>(node, path, initialValue);
}
