import { useLocalState } from 'irisdb-hooks';
import { useParams } from 'react-router-dom';

import Document from '@/pages/document/Document';
import { FileList } from '@/shared/components/FileList';
import LoginDialog from '@/shared/components/LoginDialog';
import Show from '@/shared/components/Show';
import useSearchParam from '@/shared/hooks/useSearchParam';

export default function DocsPage() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const { file } = useParams();
  const owner = useSearchParam('owner', 'follows');

  return (
    <div className="flex flex-1 flex-col h-full">
      <Show when={!pubKey && owner === 'follows'}>
        <div className="flex flex-col items-center justify-center h-full my-4">
          <LoginDialog />
        </div>
      </Show>
      <Show when={(!!pubKey || owner !== 'follows') && !file}>
        <FileList directory="apps/docs/documents" baseUrl="/document" />
      </Show>
      <Show when={(!!pubKey || owner !== 'follows') && !!file}>
        <Document />
      </Show>
    </div>
  );
}
