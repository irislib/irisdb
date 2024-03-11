import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import ShareButton from '@/pages/canvas/ShareButton.tsx';
import NodeValue from '@/shared/components/NodeValue.tsx';
import Show from '@/shared/components/Show.tsx';
import UserButton from '@/shared/components/UserButton.tsx';

export default function Header() {
  const { user, file } = useParams();
  const authors = useMemo(() => (user ? [user] : []), [user]);

  if (!user && file) return null;

  return (
    <header className="flex items-center justify-between bg-neutral text-white p-2 z-30">
      <div className="flex items-center gap-4">
        <Link to={user ? `/canvas/${user}` : '/canvas'} className="flex items-center gap-2">
          <h1 className="text-2xl">Iris Canvas</h1>
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
        <UserButton />
      </div>
    </header>
  );
}