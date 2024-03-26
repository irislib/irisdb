import useAuthors from 'irisdb-nostr/src/useAuthors';
import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import NodeValue from '@/shared/components/NodeValue';
import ShareButton from '@/shared/components/share/ShareButton';
import Show from '@/shared/components/Show';
import UserButton from '@/shared/components/UserButton';
import { ViewingUsers } from '@/shared/components/ViewingUsers';
import useSearchParam from '@/shared/hooks/useSearchParam';

export default function Header() {
  const user = useSearchParam('user', 'follows');
  const { file } = useParams();
  const authors = useAuthors(user || '', file ? `${file}/writers` : undefined);
  const followedUsers = useAuthors('follows');
  const all = useMemo(
    () => Array.from(new Set([...authors, ...followedUsers])),
    [authors, followedUsers],
  );
  const location = useLocation();
  const appName = location.pathname.split('/')[1];
  const filePath = `apps/${appName === 'document' ? 'docs' : appName}/documents/${file}`;
  const link = file ? `/${appName}` : '/';

  if (!user && file) return null;

  return (
    <header className="flex items-center justify-between bg-base-100 text-base-content p-2 z-30 select-none">
      <div className="flex items-center gap-4">
        <Link to={link} className="flex items-center gap-2">
          <h1 className="text-2xl text-base-content">Iris Docs</h1>
        </Link>
        <Show when={!!file}>
          <span className="text-xl">
            <NodeValue editable={true} authors={authors} path={`${filePath}/name`} />
          </span>
        </Show>
      </div>
      <div className="flex items-center gap-4">
        {file && <ViewingUsers file={filePath} authors={all} />}
        {file && <ShareButton file={filePath} />}
        <UserButton />
      </div>
    </header>
  );
}
