import { nip19 } from 'nostr-tools';
import { RefObject, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useLocalState } from '@/irisdb/useNodeState.ts';
import CopyButton from '@/shared/components/CopyButton.tsx';
import { AddUserForm } from '@/shared/components/share/AddUserForm.tsx';
import { WriteAccessUsers } from '@/shared/components/share/WriteAccessUsers.tsx';
import Show from '@/shared/components/Show.tsx';
import useSearchParam from '@/shared/hooks/useSearchParam.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export function ShareMenuModal({
  modalRef,
  filePath,
}: {
  modalRef: RefObject<HTMLDialogElement>;
  filePath: string;
}) {
  const user = useSearchParam('user', 'follows');
  const [myPubKey] = useLocalState('user/publicKey', '');
  const myNpub = useMemo(() => nip19.npubEncode(myPubKey), [myPubKey]);
  const userPublicKey = useMemo(() => {
    if (!user || user === 'follows') return;
    return new PublicKey(user);
  }, [user]);
  const fileName = useMemo(() => filePath.split('/').pop(), [filePath]);

  const isMine = useMemo(() => myPubKey === userPublicKey?.toString(), [myPubKey, userPublicKey]);

  if (!filePath) {
    throw new Error('Filename not present');
  }

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box flex flex-col gap-4">
        <h2 className="text-2xl">Share with others</h2>
        <Show when={isMine}>
          <AddUserForm file={filePath} />
        </Show>
        <h3 className="text-xl">People with write access</h3>
        <WriteAccessUsers user={user || 'follows'} isMine={isMine} file={filePath} />
        <h3 className="text-xl">
          Read access: <span className="text-primary">public</span>
        </h3>
        <div className="flex flex-row gap-4 justify-between">
          <CopyButton copyStr={window.location.href} text="Copy link" className="btn btn-outline" />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => modalRef.current?.close()}
          >
            Done
          </button>
        </div>
        <Show when={myPubKey}>
          <hr />
          <h3 className="text-xl">Other versions</h3>
          <ul className="list-disc list-inside">
            <Show when={!isMine}>
              <li>
                <Link
                  to={`/${window.location.pathname.split('/')[1]}/${fileName}?user=${myNpub}`}
                  className="link link-accent"
                >
                  Owned by you
                </Link>
              </li>
            </Show>
            <Show when={user !== 'follows'}>
              <li>
                <Link
                  to={`/${window.location.pathname.split('/')[1]}/${fileName}?user=follows`}
                  className="link link-accent"
                >
                  Editable by your followed users
                </Link>
              </li>
            </Show>
          </ul>
        </Show>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={() => modalRef.current?.close()}>
          close
        </button>
      </form>
    </dialog>
  );
}
