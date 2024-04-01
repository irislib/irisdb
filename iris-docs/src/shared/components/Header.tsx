import { RiBrushLine, RiFileLine, RiFolderOpenLine, RiMenuLine } from '@remixicon/react';
import { useAuthors } from 'irisdb-hooks';
import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { NavSideBar } from '@/shared/components/NavSideBar.tsx';
import NodeValue from '@/shared/components/NodeValue';
import ShareButton from '@/shared/components/share/ShareButton';
import Show from '@/shared/components/Show';
import UserButton from '@/shared/components/UserButton';
import { ViewingUsers } from '@/shared/components/ViewingUsers';
import useSearchParam from '@/shared/hooks/useSearchParam';

export default function Header() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
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

  return (
    <>
      <NavSideBar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <header className="flex sticky top-0 items-center justify-between bg-base-100 text-base-content p-2 z-30 select-none border-b border-base-300">
        <div className="flex items-center gap-2">
          <Show when={!file}>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent click from propagating to document
                setSidebarOpen(!isSidebarOpen);
              }}
              className="btn btn-ghost btn-circle"
            >
              <RiMenuLine className="w-6 h-6" />
            </button>
          </Show>
          <Show when={!!file}>
            <div className="mr-2"></div>
          </Show>
          <Link to={`/${appName}`} className="flex items-center gap-2">
            <Show when={['', 'document'].includes(appName)}>
              <RiFileLine className="w-8 h-8 mr-2" />
            </Show>
            <Show when={appName === 'canvas'}>
              <RiBrushLine className="w-8 h-8 mr-2" />
            </Show>
            <Show when={appName === 'explorer'}>
              <RiFolderOpenLine className="w-8 h-8 mr-2" />
            </Show>
            <Show when={!file}>
              <h1 className="text-2xl text-base-content capitalize">{appName || 'docs'}</h1>
            </Show>
          </Link>
          <Show when={!!file}>
            <span className="text-xl">
              <NodeValue editable={true} authors={authors} path={`${filePath}/name`} />
            </span>
          </Show>
        </div>
        <div className="flex items-center gap-4 mr-2">
          {file && <ViewingUsers file={filePath} authors={all} />}
          {file && <ShareButton file={filePath} />}
          <UserButton />
        </div>
      </header>
    </>
  );
}
