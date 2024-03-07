import { PlusIcon } from '@heroicons/react/24/solid';
import { DragEvent, DragEventHandler, FormEvent, useEffect, useState } from 'react';

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
  onDragStart: DragEventHandler<HTMLDivElement>;
};

function ItemComponent({ item, onDragStart }: ItemComponentProps) {
  return (
    <div
      draggable={true}
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: item.x, top: item.y }}
      onDragStart={onDragStart}
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
        try {
          const obj = JSON.parse(value as string);
          // check it has the correct fields
          if (
            typeof obj.x === 'number' &&
            typeof obj.y === 'number' &&
            typeof obj.data === 'string'
          ) {
            setItems((prev) => new Map(prev).set(key, obj));
          }
        } catch (e) {
          console.error(e);
        }
      });
    return () => unsubscribe();
  }, [pubKey]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const id = Math.random().toString(36).substring(7);
    const value = JSON.stringify({
      x: 0,
      y: 0,
      data: newItemValue,
    });
    publicState([pubKey]).get(DOC_NAME).get('items').get(id).put(value);
    setShowNewItemDialog(false);
  }

  const onDragStart = (e: DragEvent<HTMLDivElement>, key: string) => {
    console.log(`Dragging item with key: ${key}`);
    e.dataTransfer.setData('text/plain', key);
  };

  const onDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const key = e.dataTransfer?.getData('text/plain');
    console.log(`Dropping item with key: ${key} at position: ${e.clientX}, ${e.clientY}`);
    const canvasRect = e.currentTarget.getBoundingClientRect(); // Get canvas position and dimensions
    const offsetX = e.clientX - canvasRect.left; // Adjust for canvas position
    const offsetY = e.clientY - canvasRect.top; // Adjust for canvas position

    const newPosition = {
      x: offsetX,
      y: offsetY,
      data: items.get(key)?.data || '',
    };

    if (key) {
      publicState([pubKey]).get(DOC_NAME).get('items').get(key).put(JSON.stringify(newPosition));
      setItems((prev) => new Map(prev).set(key, newPosition));
    }
  };

  const onDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault(); // Necessary to allow dropping
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
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{ transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px)` }}
      >
        {Array.from(items).map(([key, item]) => (
          <ItemComponent key={key} item={item} onDragStart={(e) => onDragStart(e, key)} />
        ))}
      </div>
    </>
  );
}
