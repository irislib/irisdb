import { JsonValue } from 'irisdb';
import { publicState } from 'irisdb-nostr';
import { useMemo } from 'react';

import { useGroupNodeState, useNodeState } from './useNodeState.ts';

/**
 * React hook to get a public state node with the given authors. A bit similar to React's useState.
 *
 * irisdb-nostr peer dependency is required for this hook to work.
 *
 * @param authors
 * @param path
 * @param initialValue
 */
export function usePublicState<T = JsonValue>(
  authors: string[],
  path: string,
  initialValue: T,
  typeGuard?: (value: JsonValue) => T,
  recursion = 1,
) {
  const node = useMemo(() => publicState(authors), [authors]);
  return useNodeState<T>(node, path, initialValue, typeGuard, false, recursion);
}

export function usePublicGroupState<T = JsonValue>(
  authors: string[],
  path: string,
  typeGuard?: (value: JsonValue) => T,
  recursion = 1,
) {
  const node = useMemo(() => publicState(authors), [authors]);
  return useGroupNodeState<T>(node, path, typeGuard, false, recursion);
}
