import { useEffect, useState } from 'react';

import { Item } from '@/pages/canvas/types.ts';

type ItemComponentProps = {
  item: Item;
  onMove: (mouseX: number, mouseY: number) => void;
};

export function ItemComponent({ item, onMove }: ItemComponentProps) {
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
