import { UserPlusIcon } from '@heroicons/react/24/outline';
import { RefObject, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { Avatar } from '@/shared/components/Avatar.tsx';
import CopyButton from '@/shared/components/CopyButton.tsx';
import { Name } from '@/shared/components/Name.tsx';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export default function ShareButton() {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="btn btn-accent"
        type="button"
        onClick={() => modalRef.current?.showModal()}
      >
        <UserPlusIcon className="w-6 h-6" />
        Share
      </button>
      <MenuModal modalRef={modalRef} />
    </>
  );
}

function MenuModal({ modalRef }: { modalRef: RefObject<HTMLDialogElement> }) {
  const { user } = useParams();
  const pubKeyHex = useMemo(() => (user ? new PublicKey(user).toString() : ''), [user]);

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box flex flex-col gap-2">
        <h2 className="text-2xl">Share with others</h2>
        <form className="flex flex-col gap-2">
          <input
            type="text"
            className="input input-primary"
            placeholder="Add people (public key)"
          />
          <button
            className="btn btn-neutral hidden"
            type="button"
            onClick={() => modalRef.current?.close()}
          >
            Add collaborator
          </button>
        </form>
        <h3 className="text-xl">People with write access</h3>
        <div className="flex flex-row items-center gap-2 justify-between">
          <div className="flex items-center gap-2 flex-row">
            <Avatar pubKey={pubKeyHex} />
            <Name pubKey={pubKeyHex} />
          </div>
          <span className="text-neutral-content">Owner</span>
        </div>
        <div className="flex flex-row gap-2 justify-between">
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
        <button type="button">close</button>
      </form>
    </dialog>
  );
}
