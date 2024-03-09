import { FormEvent, useRef } from 'react';

import { uploadFile } from '@/shared/upload.ts';

type AddItemDialogProps = {
  onSubmit: (e?: FormEvent) => void;
  newItemValue: string;
  setNewItemValue: (value: string) => void;
  onClose: () => void;
};

export function AddItemDialog({
  onSubmit,
  newItemValue,
  setNewItemValue,
  onClose,
}: AddItemDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async () => {
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      const url = await uploadFile(file);
      setNewItemValue(url);
      setTimeout(() => {
        onSubmit();
      });
    }
  };

  return (
    <form className="flex flex-row gap-2" onSubmit={onSubmit}>
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
        accept={'.png,.jpg,.jpeg,.gif,.webp,.svg'}
      />
      <button
        className={`btn btn-primary bg-primary`}
        type="button"
        onClick={() => {
          console.log('Upload');
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
      <button className="btn btn-neutral" type="button" onClick={onClose}>
        Cancel
      </button>
    </form>
  );
}
