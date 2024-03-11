import { nip19 } from 'nostr-tools';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLocalState } from '@/state/useNodeState.ts';

export default function MenuButton() {
  return (
    <>
      <button
        className="btn btn-neutral btn-circle"
        onClick={() => document.getElementById('my_modal_1').showModal()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <MenuModal />
    </>
  );
}

function MenuModal() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const [newFileName, setNewFileName] = useState('');
  const navigate = useNavigate();

  const createNew = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/canvas/${nip19.npubEncode(pubKey)}/${newFileName}`);
    setNewFileName('');
    document.getElementById('my_modal_1').close();
  };

  return (
    <dialog id="my_modal_1" className="modal">
      <div className="modal-box">
        <form className="flex flex-col gap-2">
          <input type="text" className="input input-primary" placeholder="Public key" />
          <button
            className="btn btn-neutral"
            onClick={() => document.getElementById('my_modal_1').close()}
          >
            Add collaborator
          </button>
        </form>
        <h3 className="font-bold text-lg">Files</h3>
        <form className="flex flex-col gap-2" onSubmit={createNew}>
          <input
            type="text"
            className="input input-primary"
            placeholder="Filename"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
          <button className="btn btn-neutral">Create new</button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
