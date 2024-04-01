import { RiLoginBoxLine } from '@remixicon/react';
import { useLocalState } from 'irisdb-hooks';
import { useCallback, useEffect, useRef } from 'react';

import LoginDialog from '@/shared/components/LoginDialog';
import Show from '@/shared/components/Show';
import { Avatar } from '@/shared/components/user/Avatar';

export default function UserButton() {
  const [pubKey] = useLocalState('user/publicKey', '', String);
  const userModal = useRef<HTMLDialogElement>(null);

  const showModal = useCallback(() => {
    userModal.current?.showModal();
  }, []);

  useEffect(() => {
    userModal.current?.close();
  }, [pubKey]);

  return (
    <>
      <Show when={!!pubKey}>
        <div className="rounded-full cursor-pointer" onClick={showModal}>
          <Avatar pubKey={pubKey} />
        </div>
      </Show>
      <Show when={!pubKey}>
        <div>
          <button className="btn btn-primary" onClick={showModal}>
            <RiLoginBoxLine className="w-6 h-6" />
            <span className="hidden sm:inline-block">Sign in</span>
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
