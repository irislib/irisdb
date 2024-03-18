import * as automerge from '@automerge/automerge';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import debug from 'debug';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { useParams } from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';
import { v4 as uuidv4 } from 'uuid';

import publicState from '@/irisdb/PublicState.ts';
import useAuthors from '@/irisdb/useAuthors.ts';
import { useLocalState } from '@/irisdb/useNodeState.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

const log = debug('iris-docs:Document');

export default function Document() {
  const [myPubKey] = useLocalState('user/publicKey', '');
  const { user, file } = useParams();
  const docName = useMemo(() => `apps/docs/documents/${file || 'public'}`, [file]);
  const authors = useAuthors(
    user || 'public',
    user !== 'follows' ? `${docName}/writers` : undefined,
  );
  const editable = authors.includes(myPubKey);
  const [content, setContent] = useState('');

  const docRef = useRef(automerge.from({ content: new automerge.Text() }));
  const syncStateRef = useRef(automerge.initSyncState());

  const authorPublicKeys = useMemo(() => authors.map((a) => new PublicKey(a)), [authors]);

  useEffect(() => {
    const unsubscribe = publicState(authorPublicKeys)
      .get(`${docName}/edits`)
      .map((syncMessage) => {
        log('got automerge msg', syncMessage);
        if (typeof syncMessage === 'string') {
          const bytes = hexToBytes(syncMessage);

          const [receivedDoc, newSyncState] = automerge.receiveSyncMessage(
            docRef.current,
            syncStateRef.current,
            bytes,
          );

          // Update to the latest document state after receiving the sync message
          const newDoc = automerge.clone(receivedDoc);

          docRef.current = newDoc;
          syncStateRef.current = newSyncState;
          log('newDoc', newDoc);
          setContent(newDoc.content.join(''));
        }
      });

    return () => unsubscribe();
  }, [authors, docName, user]);

  const onContentChange = useCallback(
    (evt: ContentEditableEvent) => {
      const sanitizeConf = {
        allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li'],
        allowedAttributes: { a: ['href'] },
      };
      const sanitizedContent = sanitizeHtml(evt.currentTarget.innerHTML, sanitizeConf);

      // Clone the current document to ensure it's up-to-date
      let currentDoc = automerge.clone(docRef.current);

      currentDoc = automerge.change(currentDoc, 'Update document content', (doc) => {
        doc.content.deleteAt(0, doc.content.length);
        sanitizedContent.split('').forEach((char) => {
          doc.content.insertAt(doc.content.length, char);
        });
      });

      // Update the reference to the current document
      docRef.current = currentDoc;

      const [newSyncState, msg] = automerge.generateSyncMessage(
        docRef.current,
        syncStateRef.current,
      );
      syncStateRef.current = newSyncState;

      if (msg) {
        const hex = bytesToHex(msg);
        log('send automerge msg', hex);
        publicState(authorPublicKeys).get(`${docName}/edits`).get(uuidv4()).put(hex);
      }
    },
    [authors, docName],
  );

  return (
    <ContentEditable
      disabled={!editable}
      onChange={onContentChange}
      html={content}
      className="flex flex-1 flex-col p-4 outline-none whitespace-pre-wrap"
    />
  );
}
