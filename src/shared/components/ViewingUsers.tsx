import { useEffect, useState } from 'react';

import publicState from '@/irisdb/PublicState.ts';
import { useLocalState } from '@/irisdb/useNodeState.ts';
import { Avatar } from '@/shared/components/user/Avatar.tsx';
import { PublicKey } from '@/utils/Hex/Hex.ts';

interface ViewingUsersProps {
  file: string;
  authors: string[];
}

export function ViewingUsers({ file, authors }: ViewingUsersProps) {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const [viewingUsers, setViewingUsers] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    const pks = authors.map((k) => new PublicKey(k));
    const state = publicState(pks);

    const node = state.get(file).get('viewing');

    return node.map((isViewing, nodePath, updatedAt) => {
      // TODO we need a way to reliably find out who wrote the value. return nostr event in the callback?
      if (typeof nodePath !== 'string' || !updatedAt) return;
      const user = nodePath.split('/').pop()!;
      if (!user) return;
      if (user === myPubKey) return;
      const existing = viewingUsers.get(user);
      if (existing && existing > updatedAt) return;
      // updatedAt must be at most 30s old. make a timer to remove the user when 30s has elapsed from updatedAt
      const now = Date.now();
      const elapsed = now - updatedAt;
      setViewingUsers((prev) => {
        const next = new Map(prev);
        if (!isViewing || elapsed > 30000) {
          next.delete(user);
        } else {
          next.set(user, updatedAt);
        }
        return next;
      });
    });
  }, [file, authors]);

  useEffect(() => {
    if (!myPubKey) return;
    const setViewing = (isViewing = true) => {
      const expiresAt = Date.now() + 30000;
      publicState(authors.map((k) => new PublicKey(k)))
        .get(file)
        .get('viewing')
        .get(myPubKey)
        .put(isViewing, undefined, expiresAt);
    };
    setViewing();
    const updateInterval = setInterval(setViewing, 10000);
    const removeInterval = setInterval(() => {
      setViewingUsers((prev) => {
        const next = new Map(prev);
        const now = Date.now();
        for (const [user, updatedAt] of prev) {
          if (now - updatedAt > 30000) {
            next.delete(user);
          }
        }
        return next;
      });
    }, 1000);
    return () => {
      clearInterval(removeInterval);
      clearInterval(updateInterval);
      setViewing(false);
    };
  }, [myPubKey]);

  return (
    <div className="flex flex-row items-center gap-2">
      {Array.from(viewingUsers.keys()).map((k) => (
        <Avatar key={k} pubKey={k} className="w-8 h-8" />
      ))}
    </div>
  );
}
