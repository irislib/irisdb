import { FormEvent } from 'react';

type AddItemDialogProps = {
  onSubmit: (e: FormEvent) => void;
  newItemValue: string;
  setNewItemValue: (value: string) => void;
};

export function AddItemDialog({ onSubmit, newItemValue, setNewItemValue }: AddItemDialogProps) {
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
