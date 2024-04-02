import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { Collaboration } from '@tiptap/extension-collaboration';
import Highlight from '@tiptap/extension-highlight';
import LinkExtension from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import debug from 'debug';
import { useAuthors, useLocalState } from 'irisdb-hooks';
import { PublicKey, publicState } from 'irisdb-nostr';
import { debounce } from 'lodash';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import * as Y from 'yjs';

import MenuBar from '@/pages/document/MenuBar.tsx';
import useSearchParam from '@/shared/hooks/useSearchParam';

const log = debug('iris-docs:Document');

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

  const docRef = useRef(new Y.Doc());
  const lastStateVectorRef = useRef<Uint8Array | null>(null);
  const firstUpdated = useRef(false);

  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          // Collaboration has its own history management
          history: false,
        }),
        Collaboration.configure({
          document: docRef.current,
        }),
        Highlight,
        TaskList,
        TaskItem,
        LinkExtension.configure({
          HTMLAttributes: {
            class: 'link link-primary',
          },
        }),
      ],
      onUpdate: () => {
        sendUpdate();
      },
      editable,
      editorProps: {
        attributes: {
          class: 'outline-none prose prose-sm md:prose-base',
        },
      },
    },
    [editable],
  );

  useEffect(() => {
    let val = owner;
    try {
      val = new PublicKey(owner).toString();
    } catch (e) {
      // ignore
    }
    publicState(authors).get(docName).get('owner').put(val);
  }, [docName, owner]);

  useEffect(() => {
    const doc = publicState(authors).get(docName);
    const unsubscribe = doc.get('edits').forEach((update) => {
      if (typeof update === 'string') {
        const decodedUpdate = hexToBytes(update);
        // Apply the update without creating a Snapshot.
        Y.applyUpdate(docRef.current, decodedUpdate);
        // After applying the update, we update the state vector.
        lastStateVectorRef.current = Y.encodeStateVector(docRef.current);
      }
    });

    return () => unsubscribe();
  }, [authors, docName]);

  const sendUpdate = useCallback(
    debounce(() => {
      if (!firstUpdated.current) {
        // onUpdate is called on the first render? so we skip the first update
        firstUpdated.current = true;
        return;
      }

      if (lastStateVectorRef.current) {
        const currentStateVector = Y.encodeStateVector(docRef.current);
        const update = Y.encodeStateAsUpdate(docRef.current, lastStateVectorRef.current);
        lastStateVectorRef.current = currentStateVector;

        const hexUpdate = bytesToHex(update);
        log('sending delta update size', hexUpdate.length);
        publicState(authors).get(docName).get('edits').get(uuidv4()).put(hexUpdate);
      } else {
        // This is for the initial update, where there's no last state vector
        const initialStateVector = Y.encodeStateVector(docRef.current);
        const initialUpdate = Y.encodeStateAsUpdate(docRef.current);
        lastStateVectorRef.current = initialStateVector;

        const hexInitialUpdate = bytesToHex(initialUpdate);
        log('sending initial full update size', hexInitialUpdate.length);
        publicState(authors).get(docName).get('edits').get(uuidv4()).put(hexInitialUpdate);
      }
    }, 1000),
    [docRef.current, authors, docName],
  );

  return (
    <div className="flex flex-1 flex-col items-center bg-base-100">
      {editable && editor && <MenuBar editor={editor} />}
      <EditorContent
        editor={editor}
        className="flex flex-1 w-full max-w-[768px] flex-col p-4 md:p-8"
      />
    </div>
  );
}
