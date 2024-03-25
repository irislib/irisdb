import { DIRECTORY_VALUE, Node } from 'irisdb';
import { ChangeEvent, FormEvent, useState } from 'react';

type EditRowProps = {
  level: number;
  parent: Node;
};

export const ExplorerNodeEditRow = ({ level, parent }: EditRowProps) => {
  const [showDirForm, setShowDirForm] = useState(false);
  const [showValueForm, setShowValueForm] = useState(false);
  const [dirName, setDirName] = useState('');
  const [key, setKey] = useState('');
  const [val, setVal] = useState('');

  const toggleDirForm = () => {
    setShowDirForm(!showDirForm);
    setShowValueForm(false);
  };

  const toggleValueForm = () => {
    setShowValueForm(!showValueForm);
    setShowDirForm(false);
  };

  const handleDirSubmit = (e: FormEvent) => {
    e.preventDefault();
    parent.get(dirName).put(DIRECTORY_VALUE);
    setDirName('');
    setShowDirForm(false);
  };

  const handleValueSubmit = (e: FormEvent) => {
    e.preventDefault();
    parent.get(key).put(val);
    setKey('');
    setVal('');
    setShowValueForm(false);
  };

  return (
    <div className="pb-1" style={{ paddingLeft: `${level * 15 + 9}px` }}>
      <div className="flex flex-row items-center gap-4">
        <a
          className={`cursor-pointer text-accent hover:underline text-sm ${showDirForm ? 'underline' : ''}`}
          onClick={toggleDirForm}
        >
          New Directory
        </a>
        <a
          className={`cursor-pointer text-accent hover:underline text-sm ${showValueForm ? 'underline' : ''}`}
          onClick={toggleValueForm}
        >
          New Value
        </a>
      </div>

      {showDirForm && (
        <form onSubmit={handleDirSubmit} className="py-2 flex gap-2">
          <input
            className="input input-sm input-primary"
            type="text"
            placeholder="Directory Name"
            value={dirName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setDirName(e.target.value)}
          />
          <button type="submit" className="btn btn-sm btn-primary">
            Create
          </button>
          <button className="btn btn-sm btn-outline" onClick={() => setShowDirForm(false)}>
            Cancel
          </button>
        </form>
      )}

      {showValueForm && (
        <form onSubmit={handleValueSubmit} className="py-2 flex gap-2">
          <input
            className="input input-sm input-primary"
            type="text"
            placeholder="Key"
            value={key}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setKey(e.target.value)}
          />
          <input
            className="input input-sm input-primary"
            type="text"
            placeholder="Value"
            value={val}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setVal(e.target.value)}
          />
          <button className="btn btn-sm btn-primary" type="submit">
            Create
          </button>
          <button className="btn btn-sm btn-outline" onClick={() => setShowValueForm(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
};
