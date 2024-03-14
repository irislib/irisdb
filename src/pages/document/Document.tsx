import { ChangeEventHandler, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import useAuthors from '@/irisdb/useAuthors.ts';
import { useLocalState, usePublicState } from '@/irisdb/useNodeState.ts';

export default function Document() {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const { user, file } = useParams();
  const docName = useMemo(() => `apps/docs/documents/${file || 'public'}`, [file]);
  const authors = useAuthors(
    user || 'public',
    user !== 'follows' ? `${docName}/writers` : undefined,
  );
  const editable = authors.includes(myPubKey);
  const [text, setText] = usePublicState(authors, `${docName}/text`, '');

  const moveCursorToEnd = (element: HTMLDivElement) => {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(element);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);
  };

  const onInput: ChangeEventHandler<HTMLDivElement> = (e) => {
    setText(e.currentTarget.textContent || '');
    moveCursorToEnd(e.currentTarget);
  };

  return (
    <div
      className="flex flex-1 flex-col p-4 outline-none"
      contentEditable={editable}
      suppressContentEditableWarning
      onInput={onInput}
    >
      {text}
    </div>
  );
}
