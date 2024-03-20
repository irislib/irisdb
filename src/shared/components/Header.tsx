import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import publicState from '@/irisdb/PublicState.ts';
import useAuthors from '@/irisdb/useAuthors.ts';
import { useLocalState } from '@/irisdb/useNodeState.ts';
import NodeValue from '@/shared/components/NodeValue.tsx';
import ShareButton from '@/shared/components/share/ShareButton.tsx';
import Show from '@/shared/components/Show.tsx';
import { Avatar } from '@/shared/components/user/Avatar.tsx';
import UserButton from '@/shared/components/UserButton.tsx';
import { PublicKey } from '@/utils/Hex/Hex.ts';

interface ViewingUsersProps {
  file: string;
  authors: string[];
}

function ViewingUsers({ file, authors }: ViewingUsersProps) {
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
      console.log('isViewing', isViewing, 'user', user, 'updatedAt', updatedAt, 'elapsed', elapsed);
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
      console.log('setViewing', isViewing, 'file', file, 'myPubKey', myPubKey);
      publicState(authors.map((k) => new PublicKey(k)))
        .get(file)
        .get('viewing')
        .get(myPubKey)
        .put(isViewing, undefined, expiresAt);
    };
    setViewing();
    const updateInterval = setInterval(setViewing, 5000);
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

export default function Header({ file }: { file?: string }) {
  const { user } = useParams();
  const authors = useAuthors(user || '', file ? `${file}/writers` : undefined);

  if (!user && file) return null;

  return (
    <header className="flex items-center justify-between bg-base-100 text-base-content p-2 z-30 select-none">
      <div className="flex items-center gap-4">
        <Link to="./../../" className="flex items-center gap-2">
          <h1 className="text-2xl text-base-content">Iris Docs</h1>
        </Link>
        <Show when={!!file}>
          <span className="text-xl">
            <NodeValue editable={true} authors={authors} path={`${file}/name`} />
          </span>
        </Show>
      </div>
      <div className="flex items-center gap-4">
        {file && <ViewingUsers file={file} authors={authors} />}
        {file && <ShareButton file={file} />}
        <UserButton />
      </div>
    </header>
  );
}
