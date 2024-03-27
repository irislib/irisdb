import { NDKTag } from '@nostr-dev-kit/ndk';
import { Hex, ndk, PublicKey, publicState } from 'irisdb-nostr/src';
import { useEffect, useMemo, useState } from 'react';

import { useLocalState } from './useLocalState';

/**
 * React hook to get an array of author public keys.
 * @param ownerOrGroup public key of the owner or 'follows' to get the authors the user follows
 * @param groupPath path to load the authors list from, e.g. 'apps/canvas/documents/myDoc1/authors'
 */
export function useAuthors(ownerOrGroup?: string, groupPath?: string): string[] {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const initialAuthors = useMemo((): string[] => {
    if (!ownerOrGroup) return [];
    if (ownerOrGroup === 'follows') {
      return myPubKey ? [String(myPubKey)] : [];
    } else {
      const k = new PublicKey(ownerOrGroup);
      return [k.toString()];
    }
  }, [myPubKey, ownerOrGroup]);
  const [authors, setAuthors] = useState<Set<string>>(new Set(initialAuthors));

  useEffect(() => {
    if (ownerOrGroup === 'follows') {
      const sub = ndk.subscribe({ kinds: [3], authors: [String(myPubKey)] });
      sub.on('event', (event) => {
        if (event.kind === 3) {
          const newAuthors = new Set([String(myPubKey)]);
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
      return publicState(ownerOrGroup)
        .get(groupPath)
        .forEach((value, path) => {
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
