import { JsonValue, useNodeState } from 'irisdb/src';
import { useMemo } from 'react';

import publicState from './publicState';

/**
 * React hook to get a public state node with the given authors. A bit similar to React's useState.
 * @param authors
 * @param path
 * @param initialValue
 */
export function usePublicState<T = JsonValue>(authors: string[], path: string, initialValue: T) {
  const node = useMemo(() => publicState(authors), [authors]);
  return useNodeState<T>(node, path, initialValue);
}
