import { nanoid } from 'nanoid';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

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
        }, 1);
    }
  }, [pubKeyHex]);

  const createNew = (e: React.FormEvent) => {
    e.preventDefault();
    const uid = nanoid();
    navigate(`/canvas/${user}/${uid}`);
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      {myPubKey === pubKeyHex && (
        <button className="btn btn-neutral" onClick={createNew}>
          Create new
        </button>
      )}
      {Array.from(files.entries()).map((file) => (
        <Link
          to={`/canvas/${user}/${file[0].split('/').pop()}`}
          key={file[0]}
          className="link link-accent"
        >
          {file[1] || 'Untitled canvas'}
        </Link>
      ))}
    </div>
  );
}
