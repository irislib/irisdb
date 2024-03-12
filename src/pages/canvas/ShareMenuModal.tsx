import classNames from 'classnames';
import { FormEvent, RefObject, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import CopyButton from '@/shared/components/CopyButton.tsx';
import Show from '@/shared/components/Show.tsx';
import { UserRow } from '@/shared/components/UserRow.tsx';
import publicState from '@/state/PublicState.ts';
import { useLocalState } from '@/state/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export function ShareMenuModal({ modalRef }: { modalRef: RefObject<HTMLDialogElement> }) {
  const { file, user } = useParams();
  const [userToAdd, setUserToAdd] = useState('');
  const [myPubKey] = useLocalState('user/publicKey', '');
  const userPublicKey = useMemo(() => user && new PublicKey(user), [user]);
  const [writers, setWriters] = useState<Set<string>>(new Set());

  const userToAddValid = useMemo(() => {
    if (userToAdd === myPubKey) return false;
    try {
      new PublicKey(userToAdd);
      return true;
    } catch {
      return false;
    }
  }, [userToAdd]);

  const isMine = useMemo(() => myPubKey === userPublicKey?.toString(), [myPubKey, userPublicKey]);

  useEffect(() => {
    // get writers
    if (userPublicKey && file) {
      return publicState([userPublicKey])
        .get(`apps/canvas/documents/${file}/writers`)
        .map((value, path) => {
          console.log(value, path);
          const key = path.split('/').pop();
          if (!key) return;
          try {
            new PublicKey(key);
            // remove or add depending on value true or false
            if (value) {
              setWriters((writers) => new Set(writers.add(key)));
            } else {
              writers.delete(key);
              setWriters((writers) => new Set(writers));
            }
          } catch {
            /* empty */
          }
        });
    }
  }, [file, userPublicKey]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (userToAddValid) {
      publicState([myPubKey])
        .get(`apps/canvas/documents/${file}/writers/${new PublicKey(userToAdd).toString()}`)
        .put(true);
      setUserToAdd('');
    }
  };

  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box flex flex-col gap-4">
        <h2 className="text-2xl">Share with others</h2>
        <Show when={isMine}>
          <form className="flex flex-col gap-4" onSubmit={onSubmit}>
            <input
              type="text"
              className={classNames('input input-bordered', {
                'input-error': userToAdd && !userToAddValid,
                'text-xs': !!userToAdd,
                'input-primary': userToAddValid,
              })}
              placeholder="Add people (paste public key)"
              value={userToAdd}
              onChange={(e) => setUserToAdd(e.target.value)}
            />
            {userToAdd && userToAddValid && (
              <UserRow pubKey={userToAdd} description="Write access" />
            )}
            <button
              className={classNames('btn btn-primary', { hidden: !userToAddValid })}
              type="submit"
            >
              Add collaborator
            </button>
          </form>
        </Show>
        <h3 className="text-xl">People with write access</h3>
        <UserRow pubKey={user!} description="Owner" />
        {Array.from(writers).map((pubKey) => (
          <UserRow key={pubKey} pubKey={pubKey} description="Write access" />
        ))}
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
