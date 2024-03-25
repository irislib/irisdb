import { useRef, useState } from 'react';

import { uploadFile } from '@/shared/upload';

type AddItemDialogProps = {
  addItem: (item: string) => void;
  onClose: () => void;
};

export function AddItemDialog({ addItem, onClose }: AddItemDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newItemValue, setNewItemValue] = useState('');

  const onFileChange = async () => {
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      const url = await uploadFile(file);
      setNewItemValue('');
      addItem(url);
      onClose();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemValue) {
      addItem(newItemValue);
      setNewItemValue('');
      onClose();
    }
  };

  return (
    <form className="flex flex-row gap-2" onSubmit={onSubmit}>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
        accept={'.png,.jpg,.jpeg,.gif,.webp,.svg,.avif,.mp4'}
      />
      <button
        className={`btn btn-primary bg-primary`}
        type="button"
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        Upload
      </button>
      <input
        type="text"
        className="input input-primary"
        value={newItemValue}
        onChange={(e) => setNewItemValue(e.target.value)}
        placeholder="Text or url"
      />
      <button className="btn btn-primary bg-primary" type="submit">
        Add
      </button>
      <button className="btn btn-outline" type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
