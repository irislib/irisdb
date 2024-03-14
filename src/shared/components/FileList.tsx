import { FolderIcon } from '@heroicons/react/24/outline';
import { FolderOpenIcon, PlusIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Show from '@/shared/components/Show.tsx';
import { UserRow } from '@/shared/components/user/UserRow.tsx';
import publicState from '@/state/PublicState.ts';
import useAuthors from '@/state/useAuthors.ts';
import { useLocalState } from '@/state/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export function FileList({ directory, baseUrl }: { directory: string; baseUrl: string }) {
  const { user } = useParams();
  const [files, setFiles] = useState(new Map<string, string>());
  const navigate = useNavigate();
  const [myPubKey] = useLocalState('user/publicKey', '');
  const pubKeyHex = useMemo(
    () => user && user !== 'follows' && new PublicKey(user).toString(),
    [user],
  );
  const authors = useAuthors(user);

  useEffect(() => {
    return publicState(authors.map((author) => new PublicKey(author)))
      .get(directory)
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
  }, [authors]);

  const createNew = (e: FormEvent) => {
    e.preventDefault();
    const uid = nanoid();
    navigate(`${baseUrl}/${user}/${uid}`);
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
          to={baseUrl}
        >
          <div className="card-body">
            <div className="flex flex-row items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-row">
                <UserRow pubKey={myPubKey} />
              </div>
              <span className="text-neutral-content">
                <FolderIcon className="w-6 h-6" />
              </span>
            </div>
          </div>
        </Link>
      </Show>
      <Show when={myPubKey && user !== 'follows'}>
        <Link
          className="card card-compact bg-neutral shadow-xl cursor-pointer hover:opacity-90"
          to={`${baseUrl}/follows`}
        >
          <div className="card-body">
            <div className="flex flex-row items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-row">
                <UserPlusIcon className="w-6 h-6" />
                <h2 className="text-xl text-neutral-content">Files by followed users</h2>
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
              {user === 'follows' ? (
                <>
                  <UserPlusIcon className="w-6 h-6" />
                  <h2 className="text-xl text-neutral-content">Files by followed users</h2>
                </>
              ) : (
                <UserRow pubKey={user!} />
              )}
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
              to={`${baseUrl}/${user}/${file[0].split('/').pop()}`}
              key={file[0]}
              className="font-bold p-2 border-b border-neutral-content/10 hover:bg-neutral-content/10 hover:rounded-md hover:border-b-transparent justify-between flex items-center gap-2"
            >
              {file[1] || 'Untitled'}
              <Show when={isMine}>
                <button
                  className="btn btn-circle btn-ghost btn-sm"
                  onClick={(event) => deleteFile(file[0], file[1] || 'Untitled', event)}
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
