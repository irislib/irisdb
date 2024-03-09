import { useParams } from 'react-router-dom';

import MenuButton from '@/pages/canvas/MenuButton.tsx';
import UserButton from '@/shared/components/UserButton.tsx';

export default function Header() {
  const { file } = useParams();
  return (
    <header className="flex items-center justify-between bg-neutral text-white fixed top-0 left-0 right-0 z-10 p-2">
      <MenuButton />
      <h1>{file || 'public'}</h1>
      <UserButton />
    </header>
  );
}
