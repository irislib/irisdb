import { useCallback, useMemo } from 'react';
import ContentEditable from 'react-contenteditable';
import { useParams } from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';

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
  const [content, setContent] = usePublicState(authors, `${docName}/content`, '');

  const onContentChange = useCallback((evt: { currentTarget: { innerHTML: string } }) => {
    const sanitizeConf = {
      allowedTags: ['b', 'i', 'a', 'p'],
      allowedAttributes: { a: ['href'] },
    };

    setContent(sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf));
  }, []);

  return (
    <ContentEditable
      disabled={!editable}
      onChange={onContentChange}
      onBlur={onContentChange}
      html={content}
      className="flex flex-1 flex-col p-4 outline-none"
    />
  );
}
