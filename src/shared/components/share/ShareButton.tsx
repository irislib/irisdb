import { UserPlusIcon } from '@heroicons/react/24/outline';
import { useRef } from 'react';

import { ShareMenuModal } from '@/shared/components/share/ShareMenuModal.tsx';

export default function ShareButton({ file }: { file: string }) {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="btn btn-accent"
        type="button"
        onClick={() => modalRef.current?.showModal()}
      >
        <UserPlusIcon className="w-6 h-6" />
        Share
      </button>
      <ShareMenuModal modalRef={modalRef} file={file} />
    </>
  );
}
