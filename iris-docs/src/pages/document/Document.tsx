import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { useLocalState } from 'irisdb';
import { PublicKey } from 'irisdb-ndk/Hex/PublicKey';
import publicState from 'irisdb-ndk/PublicState';
import useAuthors from 'irisdb-ndk/useAuthors';
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
  const user = useSearchParam('user', 'follows');
  const { file } = useParams();
  const docName = useMemo(() => `apps/docs/documents/${file}`, [file]);
  const authors = useAuthors(
    user || 'follows',
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
      .get(docName)
      .get('edits')
      .map((update) => {
        if (typeof update === 'string') {
          const decodedUpdate = hexToBytes(update);
          Y.applyUpdate(docRef.current, decodedUpdate);
        }
      });

    // saving the file to our own recently opened list
    let userHex = user;
    try {
      userHex = new PublicKey(user as string).toString();
    } catch (e) {
      // ignore
    }
    myPubKey && publicState(authorPublicKeys).get(docName).get('owner').put(userHex);

    return () => unsubscribe();
  }, [authorPublicKeys, docName, user, myPubKey]);

  const sendUpdate = useCallback(
    debounce(() => {
      console.log('sending update');
      const update = Y.encodeStateAsUpdate(docRef.current);
      const hexUpdate = bytesToHex(update);
      publicState(authorPublicKeys).get(`${docName}/edits`).get(uuidv4()).put(hexUpdate);
    }, 1000),
    [docRef.current, authorPublicKeys, docName],
  ); // Adjust debounce time (500ms) as needed

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

      // Call the debounced sendUpdate function instead of directly sending the update
      sendUpdate();
    },
    [htmlContent, sendUpdate],
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
