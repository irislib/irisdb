import { nanoid } from 'nanoid';
import { nip19 } from 'nostr-tools';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Canvas from '@/pages/canvas/Canvas.tsx';
import Header from '@/pages/canvas/Header.tsx';
import LoginDialog from '@/shared/components/LoginDialog.tsx';
import Show from '@/shared/components/Show.tsx';
import publicState from '@/state/PublicState.ts';
import { useLocalState } from '@/state/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

function FileList({ npub, pubKeyHex }: { npub: string; pubKeyHex: string }) {
  const [files, setFiles] = useState(new Set<string>());
  const navigate = useNavigate();
  const [myPubKey] = useLocalState('user/publicKey', '');

  useEffect(() => {
    if (pubKeyHex) {
      return publicState([new PublicKey(pubKeyHex)])
        .get('apps/canvas/documents')
        .map((_, path) => {
          setFiles((files) => new Set(files.add(path)));
        });
    }
  }, [pubKeyHex]);

  const createNew = (e: React.FormEvent) => {
    e.preventDefault();
    const uid = nanoid();
    navigate(`/canvas/${npub}/${uid}`);
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      {myPubKey === pubKeyHex && (
        <button className="btn btn-neutral" onClick={createNew}>
          Create new
        </button>
      )}
      {Array.from(files).map((file) => (
        <a
          href={`/canvas/${npub}/${file.split('/').pop()}`}
          key={file}
          className="link link-accent"
        >
          {file.split('/').pop()}
        </a>
      ))}
    </div>
  );
}

export default function CanvasPage() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const { user, file } = useParams();
  const navigate = useNavigate();
  const userHex = useMemo(() => user && nip19.decode(user).data, [user]);

  useEffect(() => {
    if (pubKey && !user) {
      navigate(`./${nip19.npubEncode(pubKey)}`, { replace: true });
    }
  }, [pubKey, user]);

  return (
    <div className="flex flex-col h-full">
      <Header />
      <Show when={!pubKey && !user}>
        <LoginDialog />
      </Show>
      <Show when={!!user && !file}>
        <FileList pubKeyHex={userHex as string} npub={user as string} />
      </Show>
      <Show when={!!(user && file)}>
        <Canvas />
      </Show>
    </div>
  );
}
