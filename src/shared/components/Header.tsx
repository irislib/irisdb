import { Link, useParams } from 'react-router-dom';

import NodeValue from '@/shared/components/NodeValue.tsx';
import ShareButton from '@/shared/components/share/ShareButton.tsx';
import Show from '@/shared/components/Show.tsx';
import UserButton from '@/shared/components/UserButton.tsx';
import useAuthors from '@/state/useAuthors.ts';

export default function Header({ file }: { file?: string }) {
  const { user } = useParams();
  const authors = useAuthors(user || '', file ? `${file}/writers` : undefined);

  if (!user && file) return null;

  return (
    <header className="flex items-center justify-between bg-neutral text-white p-2 z-30 select-none">
      <div className="flex items-center gap-4">
        <Link to="./../../" className="flex items-center gap-2">
          <h1 className="text-2xl text-neutral-content">Iris Docs</h1>
        </Link>
        <Show when={!!file}>
          <span className="text-xl">
            <NodeValue editable={true} authors={authors} path={`${file}/name`} />
          </span>
        </Show>
      </div>
      <div className="flex items-center gap-4">
        {file && <ShareButton file={file} />}
        <UserButton />
      </div>
    </header>
  );
}
