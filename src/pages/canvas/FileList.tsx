import { FolderIcon } from '@heroicons/react/24/outline';
import { FolderOpenIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Avatar } from '@/shared/components/Avatar.tsx';
import { Name } from '@/shared/components/Name.tsx';
import Show from '@/shared/components/Show.tsx';
import publicState from '@/state/PublicState.ts';
import { useLocalState } from '@/state/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export function FileList() {
  const { user } = useParams();
  const [files, setFiles] = useState(new Map<string, string>());
  const navigate = useNavigate();
  const [myPubKey] = useLocalState('user/publicKey', '');
  const pubKeyHex = useMemo(() => user && new PublicKey(user).toString(), [user]);

  useEffect(() => {
    if (pubKeyHex) {
      return publicState([new PublicKey(pubKeyHex)])
        .get('apps/canvas/documents')
        .map((value, path) => {
          // Type guard to ensure 'value' is an object with a 'name' property
          if (typeof value === 'object' && value !== null && 'name' in value) {
            setFiles((files) => new Map(files.set(path, (value.name as string) || '')));
          }
          if (value === null) {
            setFiles((files) => {
              const newFiles = new Map(files);
              newFiles.delete(path);
              return newFiles;
            });
          }
        }, 1);
    }
  }, [pubKeyHex]);

  const createNew = (e: FormEvent) => {
    e.preventDefault();
    const uid = nanoid();
    navigate(`/canvas/${user}/${uid}`);
  };

  const isMine = myPubKey === pubKeyHex;

  const deleteFile = (path: string, name: string, event: MouseEvent) => {
    event.preventDefault();
    if (confirm(`Delete file "${name}"?`)) {
      if (path[0] === '/') {
        path = path.slice(1);
      }
      myPubKey &&
        publicState([new PublicKey(myPubKey)])
          .get(path)
          .put(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <Show when={!isMine && myPubKey}>
        <Link
          className="card card-compact bg-neutral shadow-xl cursor-pointer hover:opacity-90"
          to={`/canvas`}
        >
          <div className="card-body">
            <div className="flex flex-row items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-row">
                <Avatar pubKey={myPubKey || ''} />
                <Name pubKey={myPubKey || ''} />
              </div>
              <span className="text-neutral-content">
                <FolderIcon className="w-6 h-6" />
              </span>
            </div>
          </div>
        </Link>
      </Show>
      <div className="card bg-neutral shadow-xl card-compact">
        <div className="card-body">
          <div className="flex flex-row items-center gap-2 justify-between">
            <div className="flex items-center gap-2 flex-row">
              <Avatar pubKey={pubKeyHex || ''} />
              <Name pubKey={pubKeyHex || ''} />
            </div>
            <span className="text-neutral-content">
              <FolderOpenIcon className="w-6 h-6" />
            </span>
          </div>
          <Show when={isMine}>
            <div>
              <button className="btn btn-outline" onClick={createNew}>
                <PlusIcon className="w-6 h-6" />
                Create new
              </button>
            </div>
          </Show>
          {Array.from(files.entries()).map((file) => (
            <Link
              to={`/canvas/${user}/${file[0].split('/').pop()}`}
              key={file[0]}
              className="font-bold p-2 border-b border-neutral-content/10 hover:bg-neutral-content/10 hover:rounded-md hover:border-b-transparent justify-between flex items-center gap-2"
            >
              {file[1] || 'Untitled canvas'}
              <Show when={isMine}>
                <button
                  className="btn btn-circle btn-ghost btn-sm"
                  onClick={(event) => deleteFile(file[0], file[1] || 'Untitled canvas', event)}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </Show>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
