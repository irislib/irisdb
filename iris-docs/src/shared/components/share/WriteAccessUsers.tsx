import { TrashIcon } from '@heroicons/react/24/solid';
import { useLocalState } from 'irisdb';
import { PublicKey } from 'irisdb-ndk/Hex/PublicKey';
import publicState from 'irisdb-ndk/PublicState';
import useAuthors from 'irisdb-ndk/useAuthors';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { FollowUserForm } from '@/shared/components/share/FollowUserForm';
import Show from '@/shared/components/Show';
import { UserRow } from '@/shared/components/user/UserRow';

type WriteAccessUsersProps = {
  user: string;
  isMine: boolean;
  file: string;
};

export const WriteAccessUsers = ({ user, isMine, file }: WriteAccessUsersProps) => {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const authors = useAuthors(user || 'public', user !== 'follows' ? `${file}/writers` : undefined);
  const userHex = useMemo(
    () => (user === 'follows' ? '' : new PublicKey(user).toString()),
    [user, myPubKey],
  );
  const location = useLocation();
  const basePath = location.pathname.split('/')[1];

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
      <Link to={`/${basePath}?user=${user}`}>
        <UserRow pubKey={user!} description="Owner" />
      </Link>
      {authors
        .filter((pubKey) => pubKey !== userHex)
        .map((pubKey) => (
          <div className="flex flex-row gap-2 items-center" key={pubKey}>
            <div className="flex-1">
              <Link to={{ pathname: `/${basePath}}`, search: `?user=${pubKey}` }}>
                <UserRow pubKey={pubKey} description="Write access" />
              </Link>
            </div>
            <Show when={isMine}>
              <button
                className="btn btn-circle btn-sm btn-outline"
                type="button"
                onClick={() => {
                  publicState([new PublicKey(String(myPubKey))])
                    .get(`${file}/writers/${pubKey}`)
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
