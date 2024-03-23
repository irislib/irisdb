import { useCallback, useEffect, useRef } from 'react';

import { useLocalState } from 'irisdb/useNodeState';
import LoginDialog from '@/shared/components/LoginDialog';
import Show from '@/shared/components/Show';
import { Avatar } from '@/shared/components/user/Avatar';

export default function UserButton() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const userModal = useRef<HTMLDialogElement>(null);

  const showModal = useCallback(() => {
    userModal.current?.showModal();
  }, []);

  useEffect(() => {
    userModal.current?.close();
  }, [pubKey]);

  return (
    <>
      <Show when={pubKey}>
        <div className="ml-2 rounded-full cursor-pointer" onClick={showModal}>
          <Avatar pubKey={pubKey} />
        </div>
      </Show>
      <Show when={!pubKey}>
        <div className="ml-2">
          <button className="btn btn-primary" onClick={showModal}>
            Sign in
          </button>
        </div>
      </Show>
      <dialog ref={userModal} className="modal">
        <div className="modal-box">
          <LoginDialog />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
