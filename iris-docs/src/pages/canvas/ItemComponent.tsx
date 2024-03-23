import { ReactNode, useEffect, useMemo, useState } from 'react';

import { Item } from '@/pages/canvas/types';

type ItemComponentProps = {
  item: Item;
  onMove: (mouseX: number, mouseY: number) => void;
  editable: boolean;
};

const IMG_REGEX = /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i;
const VIDEO_REGEX = /\.(mp4|webm|ogg|mov)$/i;

export function ItemComponent({ item, onMove, editable }: ItemComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const url = useMemo(() => {
    try {
      const u = new URL(item.data);
      return u.href;
    } catch (e) {
      return null;
    }
  }, [item.data]);
  const isImage = useMemo(() => IMG_REGEX.test(item.data), [item.data]);
  const isVideo = useMemo(() => VIDEO_REGEX.test(item.data), [item.data]);

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

  let content: ReactNode | null = null;

  if (url) {
    if (isImage) {
      content = <img draggable={false} src={url} alt={item.data} className="w-52 z-0" />;
    } else if (isVideo) {
      content = <video draggable={false} src={url} controls className="w-52 z-0" loop />;
    } else {
      content = (
        <a
          draggable={false}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="link link-accent z-10"
        >
          {item.data}
        </a>
      );
    }
  } else {
    content = <div className="w-52 z-10">{item.data}</div>;
  }

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 select-none ${editable && 'cursor-move'}`}
      style={{ left: item.x, top: item.y }}
      onMouseDown={onMouseDown}
    >
      {content}
    </div>
  );
}
