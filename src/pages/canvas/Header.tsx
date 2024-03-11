import { debounce } from 'lodash';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import Show from '@/shared/components/Show.tsx';
import UserButton from '@/shared/components/UserButton.tsx';
import { usePublicState } from '@/state/useNodeState.ts';

function EditableValue({ authors, path }: { authors: string[]; path: string }) {
  const [value, setValue] = usePublicState(authors, path, '');
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(value);

  console.log('value:', value);

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
    <span onClick={() => setEditing(true)} className="cursor-pointer">
      <Show when={value}>{value}</Show>
      <Show when={!value}>
        <span className="italic text-neutral-content">Untitled</span>
      </Show>
    </span>
  );
}

export default function Header() {
  const { user, file } = useParams();
  const authors = useMemo(() => (user ? [user] : []), [user]);

  if (!user && file) return null;

  return (
    <header className="flex items-center justify-between bg-neutral text-white p-2 z-30">
      <div className="flex items-center gap-4">
        <a href="/canvas">
          <h1 className="text-2xl">Iris Canvas</h1>
        </a>
        <Show when={!!file}>
          <span className="text-xl">
            <EditableValue authors={authors} path={`apps/canvas/documents/${file}/name`} />
          </span>
        </Show>
      </div>
      <UserButton />
    </header>
  );
}
