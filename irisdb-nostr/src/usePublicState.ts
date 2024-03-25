import { JsonValue, useNodeState } from 'irisdb/src';
import { useMemo } from 'react';

import publicState from './PublicState';

export function usePublicState<T = JsonValue>(authors: string[], key: string, initialValue: T) {
  const node = useMemo(() => publicState(authors), [authors]);
  return useNodeState<T>(node, key, initialValue);
}
