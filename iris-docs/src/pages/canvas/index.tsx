import { useParams } from 'react-router-dom';

import { useLocalState } from 'irisdb/useNodeState.ts';
import Canvas from '@/pages/canvas/Canvas.tsx';
import { FileList } from '@/shared/components/FileList.tsx';
import LoginDialog from '@/shared/components/LoginDialog.tsx';
import Show from '@/shared/components/Show.tsx';
import useSearchParam from '@/shared/hooks/useSearchParam.ts';

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
