import { PlusIcon } from '@heroicons/react/24/solid';
import { debounce } from 'lodash';
import { nanoid } from 'nanoid';
import { FormEvent, useCallback, useEffect, useState } from 'react';

import LoginDialog from '@/shared/components/LoginDialog';
import Show from '@/shared/components/Show';
import publicState from '@/state/PublicState';
import useLocalState from '@/state/useLocalState';

const DOC_NAME = 'apps/canvas/documents/public';

type AddItemDialogProps = {
  onSubmit: (e: FormEvent) => void;
  newItemValue: string;
  setNewItemValue: (value: string) => void;
};

function AddItemDialog({ onSubmit, newItemValue, setNewItemValue }: AddItemDialogProps) {
  return (
    <form className="flex flex-row gap-2" onSubmit={onSubmit}>
      <input
        type="text"
        className="input input-primary"
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
      />
      <button className="btn btn-primary bg-primary">Add</button>
    </form>
  );
}

type ItemComponentProps = {
  item: Item;
  onMove: (mouseX: number, mouseY: number) => void;
};

function ItemComponent({ item, onMove }: ItemComponentProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const onMoveEvent = (event: MouseEvent) => {
      if (isDragging) {
        onMove(event.clientX, event.clientY);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', onMoveEvent);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMoveEvent);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, onMove]);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 select-none cursor-move"
      style={{ left: item.x, top: item.y }}
      onMouseDown={onMouseDown}
    >
      {item.data}
    </div>
  );
}

type Item = {
  x: number;
  y: number;
  data: string;
};

export default function Canvas() {
  const [showNewItemDialog, setShowNewItemDialog] = useState(false);
  const [pubKey] = useLocalState('user/publicKey', '');
  const [newItemValue, setNewItemValue] = useState('');
  const [items, setItems] = useState(new Map<string, Item>());
  const [canvasPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

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
    const id = nanoid();
    const value = JSON.stringify({
      x: 0,
      y: 0,
      data: newItemValue,
    });
    publicState([pubKey]).get(DOC_NAME).get('items').get(id).put(value);
    setShowNewItemDialog(false);
  }

  const debouncedSave = useCallback(
    debounce((key, updatedItem) => {
      publicState([pubKey]).get(DOC_NAME).get('items').get(key).put(JSON.stringify(updatedItem));
    }, 250), // Adjust debounce time as needed
    [pubKey], // Add other dependencies if necessary
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
        debouncedSave(key, updatedItem);
        return new Map(prevItems).set(key, updatedItem);
      }
      return prevItems;
    });
  };

  return (
    <>
      <div className="fixed top-2 right-2 bg-base-100">
        <LoginDialog />
      </div>
      <div className="fixed bottom-8 right-8">
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
        className="w-full h-full"
        style={{ transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)` }}
      >
        {Array.from(items).map(([key, item]) => (
          <ItemComponent
            key={key}
            item={item}
            onMove={(mouseX, mouseY) => moveItem(key, mouseX, mouseY)}
          />
        ))}
      </div>
    </>
  );
}
