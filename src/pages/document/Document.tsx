import * as automerge from '@automerge/automerge';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import debug from 'debug';
import { diffChars } from 'diff';
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
      const newContent = sanitizeHtml(evt.currentTarget.textContent, {
        allowedTags: [],
        allowedAttributes: {},
      });

      const diffs = diffChars(content, newContent);

      let currentDoc = automerge.clone(docRef.current);
      let cursor = 0; // Track the current position in the document

      diffs.forEach((part) => {
        log('part', part.value);
        if (part.added) {
          currentDoc = automerge.change(currentDoc, (doc) => {
            // Insert the whole string at once at the current cursor position
            for (let i = 0; i < part.value.length; i++) {
              doc.content.insertAt(cursor + i, part.value[i]);
            }
          });
          cursor += part.value.length;
        } else if (part.removed) {
          currentDoc = automerge.change(currentDoc, (doc) => {
            // Delete the range of characters
            for (let i = 0; i < (part.count || 0); i++) {
              doc.content.deleteAt(cursor);
            }
          });
        } else {
          cursor += part.count || 0; // Move cursor forward for unchanged parts
        }
      });

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
    [content, authors, docName],
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
