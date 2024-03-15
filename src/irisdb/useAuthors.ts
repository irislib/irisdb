import { NDKTag } from '@nostr-dev-kit/ndk';
import { useEffect, useMemo, useState } from 'react';

import publicState from '@/irisdb/PublicState.ts';
import { useLocalState } from '@/irisdb/useNodeState.ts';
import ndk from '@/shared/ndk.ts';
import { Hex, PublicKey } from '@/utils/Hex/Hex.ts';

export default function useAuthors(ownerOrGroup?: string, groupPath?: string): string[] {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const initialAuthors = useMemo(() => {
    if (!ownerOrGroup) return [];
    if (ownerOrGroup === 'follows') {
      return myPubKey ? [myPubKey] : [];
    } else {
      const k = new PublicKey(ownerOrGroup);
      return [k.toString()];
    }
  }, [myPubKey, ownerOrGroup]);
  const [authors, setAuthors] = useState<Set<string>>(new Set(initialAuthors));

  useEffect(() => {
    if (ownerOrGroup === 'follows') {
      const sub = ndk.subscribe({ kinds: [3], authors: [myPubKey] });
      sub.on('event', (event) => {
        if (event.kind === 3) {
          const newAuthors = new Set([myPubKey]);
          event.tags.forEach((tag: NDKTag) => {
            if (tag[0] === 'p') {
              try {
                new Hex(tag[1], 64);
                newAuthors.add(tag[1]);
              } catch (e) {
                console.error('Invalid public key', tag[1]);
              }
            }
          });
          setAuthors(newAuthors);
        }
      });
      return () => sub.stop();
    }
  }, [ownerOrGroup, myPubKey]);

  useEffect(() => {
    if (!ownerOrGroup || ownerOrGroup === 'follows') return;
    if (groupPath) {
      return publicState([new PublicKey(ownerOrGroup)])
        .get(groupPath)
        .map((value, path) => {
          setAuthors((prev) => {
            const key = path.split('/').pop()!;
            if (!!value === prev.has(key)) return prev; // no state update if value is the same
            const newAuthors = new Set(prev);
            if (value) {
              newAuthors.add(key);
            } else {
              newAuthors.delete(key);
            }
            return newAuthors;
          });
        });
    }
  }, [ownerOrGroup, groupPath]);

  const arr = useMemo(() => Array.from(authors), [authors]);

  return arr;
}
