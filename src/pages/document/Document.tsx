import { ChangeEventHandler, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import useAuthors from '@/state/useAuthors.ts';
import { useLocalState, usePublicState } from '@/state/useNodeState.ts';

export default function Document() {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const { user, file } = useParams();
  const docName = useMemo(() => `apps/docs/documents/${file || 'public'}`, [file]);
  const authors = useAuthors(
    user || 'public',
    user !== 'follows' ? `${docName}/writers` : undefined,
  );
  const editable = authors.includes(myPubKey);
  const [text, setText] = usePublicState(authors, docName, '');

  console.log('text', text);

  const moveCursorToEnd = (element: HTMLDivElement) => {
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(element); // Select the entire content of the element
    range.collapse(false); // Collapse the range to the end point, false means end of the content
    selection?.removeAllRanges(); // Remove any existing selections
    selection?.addRange(range); // Add the new range
  };

  const onInput: ChangeEventHandler<HTMLDivElement> = (e) => {
    // Update text as before
    setText(e.currentTarget.textContent || '');

    // Optionally, move cursor to end
    // You might want to do this conditionally, depending on your app's logic
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
