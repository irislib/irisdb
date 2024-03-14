import { debounce } from 'lodash';
import { useMemo, useState } from 'react';

import { usePublicState } from '@/irisdb/useNodeState.ts';
import Show from '@/shared/components/Show.tsx';

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

  const debouncedSetValue = useMemo(() => debounce(setValue, 500), [setValue]);

  if (editing) {
    return (
      <input
        autoFocus={true}
        className="input input-bordered input-sm"
        placeholder="Description"
        value={newValue}
        onChange={(e) => {
          setNewValue(e.target.value);
          debouncedSetValue(e.target.value);
        }}
        onBlur={save}
        onKeyDown={(e) => e.key === 'Enter' && save()}
      />
    );
  }

  return (
    <span onClick={() => editable && setEditing(true)} className="cursor-pointer">
      <Show when={value}>{value}</Show>
      <Show when={!value}>
        <span className="italic text-neutral-content">Untitled</span>
      </Show>
    </span>
  );
}
