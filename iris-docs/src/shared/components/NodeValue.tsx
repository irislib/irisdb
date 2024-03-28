import { usePublicState } from 'irisdb-hooks';
import { useState } from 'react';

import Show from '@/shared/components/Show';

export default function NodeValue({
  authors,
  path,
  editable,
}: {
  authors: string[];
  path: string;
  editable?: boolean;
}) {
  const [value, setValue] = usePublicState(authors, path, '');
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);

  const save = () => {
    setValue(newValue);
    setEditing(false);
  };

  const onClick = () => {
    if (!editable) return;
    setNewValue(value);
    setEditing(true);
  };

  if (editing) {
    return (
      <input
        autoFocus={true}
        className="input input-bordered input-sm"
        placeholder="Description"
        value={newValue}
        onChange={(e) => {
          setNewValue(e.target.value);
        }}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />
    );
  }

  return (
    <span onClick={onClick} className="cursor-pointer">
      <Show when={!!value}>{value}</Show>
      <Show when={!value}>
        <span className="italic text-base-content">Untitled</span>
      </Show>
    </span>
  );
}
