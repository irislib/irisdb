import { RiBrushLine, RiFileLine } from '@remixicon/react';
import { useAuthors } from 'irisdb-hooks';
import { useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import NodeValue from '@/shared/components/NodeValue';
import ShareButton from '@/shared/components/share/ShareButton';
import Show from '@/shared/components/Show';
import UserButton from '@/shared/components/UserButton';
import { ViewingUsers } from '@/shared/components/ViewingUsers';
import useSearchParam from '@/shared/hooks/useSearchParam';

export default function Header() {
  const owner = useSearchParam('owner', 'follows');
  const { file } = useParams();
  const authors = useAuthors(owner || '', file ? `${file}/writers` : undefined);
  const followedUsers = useAuthors('follows');
  const all = useMemo(
    () => Array.from(new Set([...authors, ...followedUsers])),
    [authors, followedUsers],
  );
  const location = useLocation();
  const appName = location.pathname.split('/')[1];
  const filePath = `apps/${appName === 'document' ? 'docs' : appName}/documents/${file}`;
  const link = file ? `/${appName}` : '/';

  return (
    <header className="flex sticky top-0 items-center justify-between bg-base-100 text-base-content p-2 z-30 select-none border-b border-base-300">
      <div className="flex items-center gap-2">
        <Link to={link} className="flex items-center gap-2">
          <Show when={appName === 'document'}>
            <RiFileLine className="w-8 h-8 m-2" />
          </Show>
          <Show when={appName === 'canvas'}>
            <RiBrushLine className="w-8 h-8 m-2" />
          </Show>
          <Show when={!file}>
            <h1 className="text-2xl text-base-content">Iris Docs</h1>
          </Show>
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
