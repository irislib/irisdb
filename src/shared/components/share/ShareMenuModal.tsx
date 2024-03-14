import { RefObject, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import CopyButton from '@/shared/components/CopyButton.tsx';
import { AddUserForm } from '@/shared/components/share/AddUserForm.tsx';
import { WriteAccessUsers } from '@/shared/components/share/WriteAccessUsers.tsx';
import Show from '@/shared/components/Show.tsx';
import { useLocalState } from '@/state/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export function ShareMenuModal({ modalRef }: { modalRef: RefObject<HTMLDialogElement> }) {
  const { file, user } = useParams();
  const [myPubKey] = useLocalState('user/publicKey', '');
  const userPublicKey = useMemo(() => {
    if (!user || user === 'follows') return;
    return new PublicKey(user);
  }, [user]);

  const isMine = useMemo(() => myPubKey === userPublicKey?.toString(), [myPubKey, userPublicKey]);

  if (!file) {
    throw new Error('Filename not present');
  }

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box flex flex-col gap-4">
        <h2 className="text-2xl">Share with others</h2>
        <Show when={isMine}>
          <AddUserForm file={file} />
        </Show>
        <h3 className="text-xl">People with write access</h3>
        <WriteAccessUsers user={user || 'follows'} isMine={isMine} file={file} />
        <h3 className="text-xl">Read access: public</h3>
        <div className="flex flex-row gap-4 justify-between">
          <CopyButton copyStr={window.location.href} text="Copy link" className="btn btn-neutral" />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => modalRef.current?.close()}
          >
            Done
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={() => modalRef.current?.close()}>
          close
        </button>
      </form>
    </dialog>
  );
}