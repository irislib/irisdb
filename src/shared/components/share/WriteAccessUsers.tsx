import { TrashIcon } from '@heroicons/react/24/solid';
import { useMemo } from 'react';

import { FollowUserForm } from '@/shared/components/share/FollowUserForm.tsx';
import Show from '@/shared/components/Show.tsx';
import { UserRow } from '@/shared/components/user/UserRow.tsx';
import publicState from '@/state/PublicState.ts';
import useAuthors from '@/state/useAuthors.ts';
import { useLocalState } from '@/state/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

type WriteAccessUsersProps = {
  user: string;
  isMine: boolean;
  file: string;
};
export const WriteAccessUsers = ({ user, isMine, file }: WriteAccessUsersProps) => {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const docName = useMemo(() => `apps/canvas/documents/${file || 'public'}`, [file]);
  const authors = useAuthors(
    user || 'public',
    user !== 'follows' ? `${docName}/writers` : undefined,
  );
  const userHex = useMemo(
    () => (user === 'follows' ? '' : new PublicKey(user).toString()),
    [user, myPubKey],
  );

  if (user === 'follows') {
    // TODO people search & follow here
    return (
      <div>
        Showing writes by you and <b>{authors.length - 1}</b> users followed by you. Find and follow
        people on{' '}
        <a href="https://iris.to" className="link link-accent" target="_blank">
          Iris
        </a>
        , or add here:
        <div className="my-2">
          <FollowUserForm />
        </div>
      </div>
    );
  }

  return (
    <>
      <UserRow pubKey={user!} description="Owner" />
      {authors
        .filter((pubKey) => pubKey !== userHex)
        .map((pubKey) => (
          <div className="flex flex-row gap-2 items-center" key={pubKey}>
            <div className="flex-1">
              <UserRow pubKey={pubKey} description="Write access" />
            </div>
            <Show when={isMine}>
              <button
                className="btn btn-circle btn-sm btn-neutral"
                type="button"
                onClick={() => {
                  publicState([new PublicKey(myPubKey)])
                    .get(`apps/canvas/documents/${file}/writers/${pubKey}`)
                    .put(false);
                }}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Show>
          </div>
        ))}
    </>
  );
};
