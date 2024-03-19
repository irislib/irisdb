import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { useParams } from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';

import publicState from '@/irisdb/PublicState.ts';
import useAuthors from '@/irisdb/useAuthors.ts';
import { useLocalState } from '@/irisdb/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

const sanitize = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'br',
      'div',
      'span',
    ],
    allowedAttributes: {
      a: ['href'],
    },
  });
};

export default function Document() {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const { user, file } = useParams();
  const docName = useMemo(() => `apps/docs/documents/${file || 'public'}`, [file]);
  const authors = useAuthors(
    user || 'public',
    user !== 'follows' ? `${docName}/writers` : undefined,
  );
  const editable = authors.includes(myPubKey);
  const [htmlContent, setHtmlContent] = useState('');

  const docRef = useRef(new Y.Doc());
  useEffect(() => {
    const yText = docRef.current.getText('content');
    const updateContent = () => {
      setHtmlContent(sanitize(yText.toString()));
    };
    yText.observe(updateContent);
    return () => yText.unobserve(updateContent);
  }, []);

  const authorPublicKeys = useMemo(() => authors.map((a) => new PublicKey(a)), [authors]);

  useEffect(() => {
    const unsubscribe = publicState(authorPublicKeys)
      .get(`${docName}/edits`)
      .map((update) => {
        if (typeof update === 'string') {
          const decodedUpdate = hexToBytes(update);
          Y.applyUpdate(docRef.current, decodedUpdate);
        }
      });

    return () => unsubscribe();
  }, [authors, docName, user]);

  const onContentChange = useCallback(
    (evt: ContentEditableEvent) => {
      const newContent = sanitize(evt.currentTarget.innerHTML);

      if (newContent === htmlContent) {
        return;
      }

      const yText = docRef.current.getText('content');
      docRef.current.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, newContent);
      });

      const update = Y.encodeStateAsUpdate(docRef.current);
      const hexUpdate = bytesToHex(update);
      publicState(authorPublicKeys).get(`${docName}/edits`).get(uuidv4()).put(hexUpdate);
    },
    [htmlContent, authors, docName],
  );

  return (
    <ContentEditable
      disabled={!editable}
      onChange={onContentChange}
      html={htmlContent}
      className="flex flex-1 flex-col p-4 outline-none whitespace-pre-wrap"
    />
  );
}
