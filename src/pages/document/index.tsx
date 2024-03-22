import { useParams } from 'react-router-dom';

import { useLocalState } from '@/irisdb/useNodeState.ts';
import Document from '@/pages/document/Document.tsx';
import { FileList } from '@/shared/components/FileList.tsx';
import LoginDialog from '@/shared/components/LoginDialog.tsx';
import Show from '@/shared/components/Show.tsx';
import useSearchParam from '@/shared/hooks/useSearchParam.ts';

export default function DocsPage() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const { file } = useParams();
  const user = useSearchParam('user', 'follows');

  return (
    <div className="flex flex-1 flex-col h-full">
      <Show when={!pubKey && user === 'follows'}>
        <div className="flex flex-col items-center justify-center h-full my-4">
          <LoginDialog />
        </div>
      </Show>
      <Show when={(pubKey || user !== 'follows') && !file}>
        <FileList directory="apps/docs/documents" baseUrl="/document" />
      </Show>
      <Show when={(pubKey || user !== 'follows') && !!file}>
        <Document />
      </Show>
    </div>
  );
}
