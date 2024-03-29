import { RiAddLine } from '@remixicon/react';
import { useAuthors, useLocalState } from 'irisdb-hooks';
import { PublicKey, publicState } from 'irisdb-nostr';
import { throttle } from 'lodash';
import {
  DragEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
  WheelEventHandler,
} from 'react';
import { useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { AddItemDialog } from '@/pages/canvas/AddItemDialog';
import { ItemComponent } from '@/pages/canvas/ItemComponent';
import { Item } from '@/pages/canvas/types';
import Show from '@/shared/components/Show';
import useSearchParam from '@/shared/hooks/useSearchParam';
import { uploadFile } from '@/shared/upload';

const getUrl = (url: string) => {
  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
};

export default function Canvas() {
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [myPubKey] = useLocalState('user/publicKey', '');
  const [items, setItems] = useState(new Map<string, Item>());
  const [movingInterval, setMovingInterval] = useState<number | null>(null);
  const [canvasPosition, setCanvasPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const owner = useSearchParam('owner', 'follows');
  const { file } = useParams();
  const [scale, setScale] = useState(1);
  const docName = useMemo(() => `apps/canvas/documents/${file || 'public'}`, [file]);
  const authors = useAuthors(
    owner || 'public',
    owner !== 'follows' ? `${docName}/writers` : undefined,
  );
  const editable = authors.includes(myPubKey);

  const moveCanvas = (direction: string) => {
    const moveAmount = 10; // Adjust the movement speed as necessary
    setCanvasPosition((currentPosition) => {
      switch (direction) {
        case 'ArrowUp':
          return { ...currentPosition, y: currentPosition.y + moveAmount };
        case 'ArrowDown':
          return { ...currentPosition, y: currentPosition.y - moveAmount };
        case 'ArrowLeft':
          return { ...currentPosition, x: currentPosition.x + moveAmount };
        case 'ArrowRight':
          return { ...currentPosition, x: currentPosition.x - moveAmount };
        default:
          return currentPosition;
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // if input is focused, don't move canvas
      if (document.activeElement?.tagName === 'INPUT') return;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
        movingInterval === null
      ) {
        moveCanvas(e.key);
        const interval = setInterval(() => moveCanvas(e.key), 100); // Adjust interval timing as necessary
        setMovingInterval(interval as unknown as number);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (movingInterval !== null) {
          clearInterval(movingInterval);
        }
        setMovingInterval(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (movingInterval !== null) {
        clearInterval(movingInterval);
      }
    };
  }, [movingInterval]);

  useEffect(() => {
    setItems(new Map());
    const doc = publicState(authors).get(docName);
    const unsubscribe = doc.get('items').forEach((value, key) => {
      if (typeof key !== 'string') return;
      const id = key.split('/').pop()!;
      try {
        const obj = JSON.parse(value as string);
        // check it has the correct fields
        if (
          typeof obj.x === 'number' &&
          typeof obj.y === 'number' &&
          typeof obj.data === 'string'
        ) {
          setItems((prev) => new Map(prev).set(id, obj));
        }
      } catch (e) {
        console.error(e);
      }
    });
    let ownerHex = owner;
    try {
      ownerHex = new PublicKey(owner as string).toString();
    } catch (e) {
      // ignore
    }
    myPubKey && publicState(authors).get(docName).get('owner').put(ownerHex);
    return () => unsubscribe();
  }, [authors, docName]);

  function addItemToCanvas(item: Item) {
    if (!editable) return;
    const id = uuidv4();
    const value = JSON.stringify(item);
    publicState(myPubKey).get(docName).get('items').get(id).put(value);
  }

  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    if (!editable) return;

    // Calculate drop position relative to the canvas
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const dropX = (e.clientX - canvasRect.left - canvasPosition.x) / scale;
    const dropY = (e.clientY - canvasRect.top - canvasPosition.y) / scale;

    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          const url = await uploadFile(file!);
          addItemToCanvas({
            x: dropX,
            y: dropY,
            data: url,
          });
        } else if (item.kind === 'string' && item.type === 'text/plain') {
          item.getAsString((url) => {
            if (getUrl(url)) {
              addItemToCanvas({
                x: dropX,
                y: dropY,
                data: url,
              });
            }
          });
        }
      }
    }

    // Clear the drag data cache (for all formats/types)
    e.dataTransfer.clearData();
  };

  const throttledSave = useCallback(
    throttle(
      (key, updatedItem) => {
        publicState(myPubKey).get(docName).get('items').get(key).put(JSON.stringify(updatedItem));
      },
      200,
      { leading: false, trailing: true },
    ),
    [myPubKey],
  );

  const moveItem = (key: string, newX: number, newY: number) => {
    if (!editable) return;
    setItems((prevItems) => {
      const item = prevItems.get(key);
      if (item) {
        const updatedItem = {
          ...item,
          x: Math.round((newX - canvasPosition.x) / scale),
          y: Math.round((newY - canvasPosition.y) / scale),
        };
        throttledSave(key, updatedItem);
        return new Map(prevItems).set(key, updatedItem);
      }
      return prevItems;
    });
  };

  const handleWheel: WheelEventHandler<HTMLDivElement> = (e) => {
    const zoomSpeed = 0.1; // Determines how fast to zoom in or out
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      const newScale = e.deltaY > 0 ? scale * (1 - zoomSpeed) : scale * (1 + zoomSpeed);
      setScale(newScale);
    } else {
      setCanvasPosition((currentPosition) => ({
        x: currentPosition.x - e.deltaX,
        y: currentPosition.y - e.deltaY,
      }));
    }
  };

  return (
    <div className="flex flex-col">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onWheel={handleWheel}
        className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden bg-base-100"
      >
        <Show when={!!myPubKey}>
          <div className="fixed bottom-8 right-8 z-20">
            <Show when={showNewItemDialog}>
              <AddItemDialog
                addItem={(url) => addItemToCanvas({ x: 0, y: 0, data: url })}
                onClose={() => {
                  setShowNewItemDialog(false);
                }}
              />
            </Show>
            <Show when={!showNewItemDialog}>
              <button
                className="btn btn-primary btn-circle bg-primary"
                onClick={() => setShowNewItemDialog(true)}
              >
                <RiAddLine className="w-6 h-6" />
              </button>
            </Show>
          </div>
        </Show>
        <div
          style={{
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${scale})`,
            transformOrigin: 'center',
          }}
        >
          {Array.from(items).map(([key, item]) => (
            <ItemComponent
              editable={editable}
              key={key}
              item={item}
              onMove={(mouseX, mouseY) => moveItem(key, mouseX, mouseY)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
