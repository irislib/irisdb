import { PlusIcon } from '@heroicons/react/24/solid';
import { throttle } from 'lodash';
import { nanoid } from 'nanoid';
import {
  DragEventHandler,
  FormEvent,
  useCallback,
  useEffect,
  useState,
  WheelEventHandler,
} from 'react';

import { AddItemDialog } from '@/pages/canvas/AddItemDialog.tsx';
import { ItemComponent } from '@/pages/canvas/ItemComponent.tsx';
import { Item } from '@/pages/canvas/types.ts';
import LoginDialog from '@/shared/components/LoginDialog';
import Show from '@/shared/components/Show';
import { uploadFile } from '@/shared/upload.ts';
import publicState from '@/state/PublicState';
import useLocalState from '@/state/useLocalState';

const DOC_NAME = 'apps/canvas/documents/public';

const getUrl = (url: string) => {
  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
};

export default function Canvas() {
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [pubKey] = useLocalState('user/publicKey', '');
  const [newItemValue, setNewItemValue] = useState('');
  const [items, setItems] = useState(new Map<string, Item>());
  const [movingInterval, setMovingInterval] = useState<number | null>(null);
  const [canvasPosition, setCanvasPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [scale, setScale] = useState(1);

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
    const unsubscribe = publicState([pubKey])
      .get(DOC_NAME)
      .get('items')
      .map((value, key) => {
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
    return () => unsubscribe();
  }, [pubKey]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addItemToCanvas({
      x: 0,
      y: 0,
      data: newItemValue,
    });
    setShowNewItemDialog(false);
  }

  function addItemToCanvas(item: Item) {
    const id = nanoid();
    const value = JSON.stringify(item);
    publicState([pubKey]).get(DOC_NAME).get('items').get(id).put(value);
  }

  const handleDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
  };

  const handleDrop: DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();

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
    throttle((key, updatedItem) => {
      publicState([pubKey]).get(DOC_NAME).get('items').get(key).put(JSON.stringify(updatedItem));
    }, 200),
    [pubKey],
  );

  const moveItem = (key: string, newX: number, newY: number) => {
    setItems((prevItems) => {
      const item = prevItems.get(key);
      if (item) {
        const updatedItem = {
          ...item,
          x: newX - canvasPosition.x,
          y: newY - canvasPosition.y,
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
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onWheel={handleWheel}
      className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden"
    >
      <div className="fixed top-2 right-2 bg-base-100 z-20">
        <LoginDialog />
      </div>
      <div className="fixed bottom-8 right-8 z-20">
        <Show when={showNewItemDialog}>
          <AddItemDialog
            onSubmit={onSubmit}
            newItemValue={newItemValue}
            setNewItemValue={setNewItemValue}
          />
        </Show>
        <Show when={!showNewItemDialog}>
          <button
            className="btn btn-primary btn-circle bg-primary"
            onClick={() => setShowNewItemDialog(true)}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </Show>
      </div>
      <div
        style={{
          transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${scale})`,
        }}
      >
        {Array.from(items).map(([key, item]) => (
          <ItemComponent
            key={key}
            item={item}
            onMove={(mouseX, mouseY) => moveItem(key, mouseX, mouseY)}
          />
        ))}
      </div>
    </div>
  );
}
