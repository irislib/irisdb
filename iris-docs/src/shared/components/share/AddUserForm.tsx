import classNames from 'classnames';
import { useLocalState } from 'irisdb-hooks';
import { PublicKey, publicState } from 'irisdb-nostr';
import { FormEvent, useMemo, useState } from 'react';

import { UserRow } from '@/shared/components/user/UserRow';

export const AddUserForm = ({ file }: { file: string }) => {
  const [myPubKey] = useLocalState('user/publicKey', '', String);
  const [userToAdd, setUserToAdd] = useState('');
  const userToAddValid = useMemo(() => {
    if (userToAdd === myPubKey) return false;
    try {
      new PublicKey(userToAdd);
      return true;
    } catch {
      return false;
    }
  }, [userToAdd]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (userToAddValid) {
      publicState(myPubKey)
        .get(`${file}/writers/${new PublicKey(userToAdd).toString()}`)
        .put(true);
      setUserToAdd('');
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <input
        type="text"
        className={classNames('input input-bordered', {
          'input-error': userToAdd && !userToAddValid,
          'text-xs': !!userToAdd,
          'input-primary': userToAddValid,
        })}
        placeholder="Add people (paste public key)"
        value={userToAdd}
        onChange={(e) => setUserToAdd(e.target.value)}
      />
      {userToAdd && userToAddValid && <UserRow pubKey={userToAdd} description="Write access" />}
      <button className={classNames('btn btn-primary', { hidden: !userToAddValid })} type="submit">
        Add write access
      </button>
    </form>
  );
};
