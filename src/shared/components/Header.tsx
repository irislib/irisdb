import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import useAuthors from '@/irisdb/useAuthors.ts';
import NodeValue from '@/shared/components/NodeValue.tsx';
import ShareButton from '@/shared/components/share/ShareButton.tsx';
import Show from '@/shared/components/Show.tsx';
import UserButton from '@/shared/components/UserButton.tsx';
import { ViewingUsers } from '@/shared/components/ViewingUsers.tsx';
import useSearchParam from '@/shared/hooks/useSearchParam.ts';

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
  const basePath = location.pathname.split('/')[1];
  const link = file ? `/${basePath}` : '/';

  if (!user && file) return null;

  return (
    <header className="flex items-center justify-between bg-base-100 text-base-content p-2 z-30 select-none">
      <div className="flex items-center gap-4">
        <Link to={link} className="flex items-center gap-2">
          <h1 className="text-2xl text-base-content">Iris Docs</h1>
        </Link>
        <Show when={!!file}>
          <span className="text-xl">
            <NodeValue editable={true} authors={authors} path={`${file}/name`} />
          </span>
        </Show>
      </div>
      <div className="flex items-center gap-4">
        {file && <ViewingUsers file={file} authors={all} />}
        {file && <ShareButton file={file} />}
        <UserButton />
      </div>
    </header>
  );
}
