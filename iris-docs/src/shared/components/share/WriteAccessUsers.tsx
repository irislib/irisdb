import { RiDeleteBinLine } from '@remixicon/react';
import { useLocalState } from 'irisdb-hooks';
import { useAuthors } from 'irisdb-hooks';
import { PublicKey, publicState } from 'irisdb-nostr';
import { nip19 } from 'nostr-tools';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import CopyButton from '@/shared/components/CopyButton';
import { FollowUserForm } from '@/shared/components/share/FollowUserForm';
import Show from '@/shared/components/Show';
import { UserRow } from '@/shared/components/user/UserRow';

type WriteAccessUsersProps = {
  owner: string;
  isMine: boolean;
  file: string;
};

export const WriteAccessUsers = ({ owner, isMine, file }: WriteAccessUsersProps) => {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const authors = useAuthors(
    owner || 'public',
    owner !== 'follows' ? `${file}/writers` : undefined,
  );
  const userHex = useMemo(
    () => (owner === 'follows' ? '' : new PublicKey(owner).toString()),
    [owner, myPubKey],
  );
  const location = useLocation();
  const basePath = location.pathname.split('/')[1];

  if (owner === 'follows') {
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
      <Link to={`/${basePath}?user=${owner}`}>
        <UserRow pubKey={owner!} description="Owner" />
      </Link>
      <Show when={!!myPubKey && !isMine}>
        <span className="text-sm">
          Request write access by giving your public key to the owner:
        </span>
        <CopyButton
          copyStr={nip19.npubEncode(myPubKey)}
          text="Copy public key"
          className="btn btn-outline"
        />
      </Show>
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
                  publicState(myPubKey).get(`${file}/writers/${pubKey}`).put(false);
                }}
              >
                <RiDeleteBinLine className="w-4 h-4" />
              </button>
            </Show>
          </div>
        ))}
    </>
  );
};
