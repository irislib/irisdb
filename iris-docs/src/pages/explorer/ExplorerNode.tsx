import { RiArrowRightSLine } from '@remixicon/react';
import { DIRECTORY_VALUE, isDirectory, JsonValue, Node } from 'irisdb';
import { useEffect, useState } from 'react';

import Show from '@/shared/components/Show';
import { SortedMap } from '@/utils/SortedMap/SortedMap';

import { ExplorerNodeEditRow } from './ExplorerNodeEditRow';
import ExplorerNodeValue from './ExplorerNodeValue';

type Props = {
  node: Node;
  value?: JsonValue;
  level?: number;
  expanded?: boolean;
  name?: string;
  parentCounter?: number;
};

type Child = { node: Node; value: JsonValue };
type ChildMap = SortedMap<string, Child>;

export default function ExplorerNode({
  node,
  value = DIRECTORY_VALUE,
  level = 0,
  expanded = false,
  name,
  parentCounter = 0,
}: Props) {
  const [children, setChildren] = useState<ChildMap>(new SortedMap());
  const [isOpen, setIsOpen] = useState(expanded);

  const isDir = isDirectory(value);

  useEffect(() => {
    if (!isDir) return;
    return node.forEach((value, key) => {
      if (!children.has(key)) {
        const childName = key.split('/').pop()!;
        setChildren((prev: ChildMap) => {
          const newChildren = new SortedMap(prev);
          newChildren.set(childName, { node: node.get(childName), value });
          return newChildren;
        });
      }
    });
  }, [node.id, value]);

  const toggleOpen = () => setIsOpen(!isOpen);
  const rowColor = parentCounter % 2 === 0 ? 'bg-base-300' : 'bg-base-100';
  const displayName = name || node.id.split('/').pop()!;

  const paddingLeft = `${level * 15 + (isDir ? 0 : 16)}px`;

  return (
    <div className={`relative w-full ${rowColor}`}>
      <div
        className={`flex items-center ${isDir ? 'cursor-pointer' : ''}`}
        onClick={toggleOpen}
        style={{ paddingLeft }}
      >
        <Show when={isDir}>
          <RiArrowRightSLine
            className={`w-4 h-4 transition ${isOpen ? 'transform rotate-90' : ''}`}
          />
        </Show>
        <span className="ml-1 w-1/3 truncate">{displayName}</span>
        <Show when={!isDir}>
          <div className="ml-auto w-1/2">
            <ExplorerNodeValue
              displayName={displayName}
              value={value}
              setValue={(v) => node.put(v)}
            />
          </div>
        </Show>
      </div>
      {isDir && isOpen ? (
        <div>
          <ExplorerNodeEditRow level={level + 1} parent={node} />
          {Array.from(children.values()).map((child, index) => (
            <ExplorerNode
              key={node.id + child.node.id}
              node={child.node}
              level={level + 1}
              expanded={false}
              value={child.value}
              parentCounter={parentCounter + index + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
