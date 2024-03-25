import { useLocalState } from 'irisdb';
import { useParams } from 'react-router-dom';

import Canvas from '@/pages/canvas/Canvas';
import { FileList } from '@/shared/components/FileList';
import LoginDialog from '@/shared/components/LoginDialog';
import Show from '@/shared/components/Show';
import useSearchParam from '@/shared/hooks/useSearchParam';

export default function CanvasPage() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const { file } = useParams();
  const user = useSearchParam('user', 'follows');

  return (
    <div className="flex flex-col h-full">
      <Show when={!pubKey && !user}>
        <div className="flex flex-col items-center justify-center h-full my-4">
          <LoginDialog />
        </div>
      </Show>
      <Show when={!!user && !file}>
        <FileList directory="apps/canvas/documents" baseUrl="/canvas" />
      </Show>
      <Show when={!!(user && file)}>
        <Canvas />
      </Show>
    </div>
  );
}
