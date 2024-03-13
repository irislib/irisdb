import { Link, useParams } from 'react-router-dom';

import NodeValue from '@/shared/components/NodeValue.tsx';
import ShareButton from '@/shared/components/share/ShareButton.tsx';
import Show from '@/shared/components/Show.tsx';
import UserButton from '@/shared/components/UserButton.tsx';
import useAuthors from '@/state/useAuthors.ts';
import { useLocalState } from '@/state/useNodeState.ts';

export default function Header() {
  const { user, file } = useParams();
  const [pubKey] = useLocalState('user/publicKey', '');
  const authors = useAuthors(
    user || '',
    file ? `apps/canvas/documents/${file}/writers` : undefined,
  );

  if (!user && file) return null;

  console.log('authors', authors);

  return (
    <header className="flex items-center justify-between bg-neutral text-white p-2 z-30 select-none">
      <div className="flex items-center gap-4">
        <Link to={user ? `/canvas/${user}` : '/canvas'} className="flex items-center gap-2">
          <h1 className="text-2xl text-neutral-content">Iris Canvas</h1>
        </Link>
        <Show when={!!file}>
          <span className="text-xl">
            <NodeValue
              editable={true}
              authors={authors}
              path={`apps/canvas/documents/${file}/name`}
            />
          </span>
        </Show>
      </div>
      <div className="flex items-center gap-4">
        <Show when={!!file}>
          <ShareButton />
        </Show>
        <Show when={pubKey || user}>
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
