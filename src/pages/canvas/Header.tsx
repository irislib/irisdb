import { useParams } from 'react-router-dom';

import MenuButton from '@/pages/canvas/MenuButton.tsx';
import { Avatar } from '@/shared/components/Avatar.tsx';
import Show from '@/shared/components/Show.tsx';
import useLocalState from '@/state/useLocalState.ts';

export default function Header() {
  const [pubKey] = useLocalState('user/publicKey', '');
  const { file } = useParams();
  return (
    <header className="flex items-center justify-between bg-neutral text-white fixed top-0 left-0 right-0 z-10 p-2">
      <MenuButton />
      <h1>{file || 'public'}</h1>
      <Show when={pubKey}>
        <div className="ml-2">
          <Avatar pubKey={pubKey} />
        </div>
      </Show>
    </header>
  );
}
