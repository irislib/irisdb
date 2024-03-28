import classNames from 'classnames';
import { useLocalState } from 'irisdb-hooks';
import { ndk, PublicKey } from 'irisdb-nostr';
import { FormEvent, useMemo, useState } from 'react';

import { UserRow } from '@/shared/components/user/UserRow';

export const FollowUserForm = () => {
  const [myPubKey] = useLocalState('user/publicKey', '');
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
      const me = ndk().getUser({ pubkey: String(myPubKey) });
      const userToFollow = ndk().getUser({ pubkey: new PublicKey(userToAdd).toString() });
      me.follow(userToFollow);
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
        placeholder="Follow someone (paste public key)"
        value={userToAdd}
        onChange={(e) => setUserToAdd(e.target.value)}
      />
      {userToAdd && userToAddValid && <UserRow pubKey={userToAdd} description="User to follow" />}
      <button className={classNames('btn btn-primary', { hidden: !userToAddValid })} type="submit">
        Follow
      </button>
    </form>
  );
};
