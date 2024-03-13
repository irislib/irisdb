import { nip19 } from 'nostr-tools';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Canvas from '@/pages/canvas/Canvas.tsx';
import { FileList } from '@/shared/components/FileList.tsx';
import Header from '@/shared/components/Header.tsx';
import LoginDialog from '@/shared/components/LoginDialog.tsx';
import Show from '@/shared/components/Show.tsx';
import { useLocalState } from '@/state/useNodeState.ts';

export default function CanvasPage() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const { user, file } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (pubKey && !user) {
      navigate(`./${nip19.npubEncode(pubKey)}`, { replace: true });
    }
  }, [pubKey, user]);

  return (
    <div className="flex flex-col h-full">
      <Header />
      <Show when={!pubKey && !user}>
        <div className="flex flex-col items-center justify-center h-full my-4">
          <LoginDialog />
        </div>
      </Show>
      <Show when={!!user && !file}>
        <FileList />
      </Show>
      <Show when={!!(user && file)}>
        <Canvas />
      </Show>
    </div>
  );
}
