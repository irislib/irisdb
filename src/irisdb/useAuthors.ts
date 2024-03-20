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
          const newAuthors = new Set(authors);
          let updated = false;
          event.tags.forEach((tag: NDKTag) => {
            if (tag[0] === 'p') {
              try {
                new Hex(tag[1], 64);
                if (!newAuthors.has(tag[1])) {
                  newAuthors.add(tag[1]);
                  updated = true;
                }
              } catch (e) {
                console.error('Invalid public key', tag[1]);
              }
            }
          });
          if (updated) setAuthors(newAuthors);
        }
      });
      return () => sub.stop();
    }
  }, [ownerOrGroup, myPubKey]);

  useEffect(() => {
    const initialSet = new Set(initialAuthors);
    if (
      !authors ||
      Array.from(authors).sort().toString() !== Array.from(initialSet).sort().toString()
    ) {
      setAuthors(initialSet);
    }

    if (!ownerOrGroup || ownerOrGroup === 'follows') return;
    if (groupPath) {
      return publicState([new PublicKey(ownerOrGroup)])
        .get(groupPath)
        .map((value, path) => {
          setAuthors((prev) => {
            const key = path.split('/').pop()!;
            const newAuthors = new Set(prev);
            const hasKey = newAuthors.has(key);
            if (!!value && !hasKey) {
              newAuthors.add(key);
              return newAuthors;
            } else if (!value && hasKey) {
              newAuthors.delete(key);
              return newAuthors;
            }
            return prev;
          });
        });
    }
  }, [ownerOrGroup, groupPath, initialAuthors]);

  const arr = useMemo(() => Array.from(authors), [authors]);

  return arr;
}
