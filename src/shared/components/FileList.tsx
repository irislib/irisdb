import { FolderIcon } from '@heroicons/react/24/outline';
import { FolderOpenIcon, PlusIcon, TrashIcon, UserPlusIcon } from '@heroicons/react/24/solid';
import { nanoid } from 'nanoid';
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import publicState from '@/irisdb/PublicState.ts';
import useAuthors from '@/irisdb/useAuthors.ts';
import { useLocalState } from '@/irisdb/useNodeState.ts';
import Show from '@/shared/components/Show.tsx';
import { UpdatedAt } from '@/shared/components/UpdatedAt.tsx';
import { UserRow } from '@/shared/components/user/UserRow.tsx';
import { PublicKey } from '@/utils/Hex/Hex.ts';

type FileListItem = {
  name: string;
  updatedAt?: number;
};

export function FileList({ directory, baseUrl }: { directory: string; baseUrl: string }) {
  const { user } = useParams();
  const [files, setFiles] = useState(new Map<string, FileListItem>());
  const [sortBy] = useState<keyof FileListItem>('updatedAt');
  const [sortDesc] = useState(true);
  const navigate = useNavigate();
  const [myPubKey] = useLocalState('user/publicKey', '');
  const pubKeyHex = useMemo(
    () => user && user !== 'follows' && new PublicKey(user).toString(),
    [user],
  );
  const authors = useAuthors(user);

  const sortedFilePaths = useMemo(() => {
    return Array.from(files.keys()).sort((a, b) => {
      const aItem = files.get(a);
      const bItem = files.get(b);
      if (!aItem || !bItem) {
        return 0;
      }
      if (aItem[sortBy] === bItem[sortBy]) {
        return a.localeCompare(b);
      }
      // may be sorted by number or string
      const aVal = aItem[sortBy] || -1;
      const bVal = bItem[sortBy] || -1;
      return sortDesc ? (aVal > bVal ? -1 : 1) : aVal > bVal ? 1 : -1;
    });
  }, [files, sortBy]);

  useEffect(() => {
    return publicState(authors.map((author) => new PublicKey(author)))
      .get(directory)
      .map((value, path, updatedAt) => {
        // Type guard to ensure 'value' is an object with a 'name' property
        if (typeof value === 'object' && value !== null && 'name' in value) {
          setFiles((files) => {
            const item = { name: (value.name as string) || '', updatedAt };
            return new Map(files.set(path, item));
          });
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
          className="card card-compact bg-base-100 shadow-xl cursor-pointer hover:opacity-90"
          to={baseUrl}
        >
          <div className="card-body">
            <div className="flex flex-row items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-row">
                <UserRow pubKey={myPubKey} />
              </div>
              <span className="text-base-content">
                <FolderIcon className="w-6 h-6" />
              </span>
            </div>
          </div>
        </Link>
      </Show>
      <Show when={myPubKey && user !== 'follows'}>
        <Link
          className="card card-compact bg-base-100 shadow-xl cursor-pointer hover:opacity-90"
          to={`${baseUrl}/follows`}
        >
          <div className="card-body">
            <div className="flex flex-row items-center gap-2 justify-between">
              <div className="flex items-center gap-2 flex-row">
                <UserPlusIcon className="w-6 h-6" />
                <h2 className="text-xl text-base-content">Files by followed users</h2>
              </div>
              <span className="text-base-content">
                <FolderIcon className="w-6 h-6" />
              </span>
            </div>
          </div>
        </Link>
      </Show>
      <div className="card bg-base-100 shadow-xl card-compact">
        <div className="card-body">
          <div className="flex flex-row items-center gap-2 justify-between">
            <div className="flex items-center gap-2 flex-row">
              {user === 'follows' ? (
                <>
                  <UserPlusIcon className="w-6 h-6" />
                  <h2 className="text-xl text-base-content">Files by followed users</h2>
                </>
              ) : (
                <UserRow pubKey={user!} />
              )}
            </div>
            <span className="text-base-content">
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
          {sortedFilePaths.map((path) => {
            const file = files.get(path);
            if (!file) {
              return null;
            }
            return (
              <Link
                to={`${baseUrl}/${user}/${path.split('/').pop()}`}
                key={path}
                className="font-bold p-2 border-b border-base-content/10 hover:bg-base-content/10 hover:rounded-md hover:border-b-transparent justify-between flex items-center gap-2"
              >
                <div className="flex-1">{file.name || 'Untitled'}</div>
                {file.updatedAt && (
                  <span className="text-base-content">
                    <UpdatedAt updatedAt={file.updatedAt} />
                  </span>
                )}
                <Show when={isMine}>
                  <button
                    className="btn btn-circle btn-ghost btn-sm"
                    onClick={(event) => deleteFile(path, file.name || 'Untitled', event)}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </Show>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
