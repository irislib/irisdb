import { RiUserAddLine } from '@remixicon/react';
import { useRef } from 'react';

import { ShareMenuModal } from '@/shared/components/share/ShareMenuModal';

export default function ShareButton({ file }: { file: string }) {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className="btn btn-accent"
        type="button"
        onClick={() => modalRef.current?.showModal()}
      >
        <RiUserAddLine className="w-6 h-6" />
        <span className="hidden sm:inline-block">Share</span>
      </button>
      <ShareMenuModal modalRef={modalRef} filePath={file} />
    </>
  );
}
