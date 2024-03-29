import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { useAuthors, useLocalState } from 'irisdb-hooks';
import { PublicKey, publicState } from 'irisdb-nostr';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { useParams } from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';

import useSearchParam from '@/shared/hooks/useSearchParam';

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
  const owner = useSearchParam('owner', 'follows');
  const { file } = useParams();
  const docName = useMemo(() => `apps/docs/documents/${file}`, [file]);
  const authors = useAuthors(
    owner || 'follows',
    owner !== 'follows' ? `${docName}/writers` : undefined,
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

  useEffect(() => {
    const unsubscribe = publicState(authors)
      .get(docName)
      .get('edits')
      .forEach((update) => {
        if (typeof update === 'string') {
          const decodedUpdate = hexToBytes(update);
          Y.applyUpdate(docRef.current, decodedUpdate);
        }
      });

    // saving the file to our own recently opened list
    let ownerHex = owner;
    try {
      ownerHex = new PublicKey(owner as string).toString();
    } catch (e) {
      // ignore
    }
    myPubKey && publicState(authors).get(docName).get('owner').put(ownerHex);

    return () => unsubscribe();
  }, [authors, docName, owner, myPubKey]);

  const sendUpdate = useCallback(
    debounce(() => {
      const update = Y.encodeStateAsUpdate(docRef.current);
      const hexUpdate = bytesToHex(update);
      publicState(authors).get(`${docName}/edits`).get(uuidv4()).put(hexUpdate);
    }, 1000),
    [docRef.current, authors, docName],
  );

  const onContentChange = useCallback(
    (evt: ContentEditableEvent) => {
      const newContent = sanitize(evt.currentTarget.innerHTML);

      if (newContent === htmlContent) {
        return;
      }

      setHtmlContent(newContent);

      const yText = docRef.current.getText('content');
      docRef.current.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, newContent);
      });

      sendUpdate();
    },
    [htmlContent, sendUpdate],
  );

  return (
    <div className="flex flex-1 flex-col items-center">
      <ContentEditable
        disabled={!editable}
        onChange={onContentChange}
        html={htmlContent}
        className="flex flex-1 max-w-[768px] flex-col p-4 outline-none whitespace-pre-wrap"
      />
    </div>
  );
}
