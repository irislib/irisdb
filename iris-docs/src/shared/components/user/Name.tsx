import classNames from 'classnames';
import { ndk, PublicKey } from 'irisdb-nostr';
import { useEffect, useMemo, useState } from 'react';

import animalName from '@/utils/AnimalName';

export function Name({ pubKey }: { pubKey: string }) {
  const pubKeyHex = useMemo(() => {
    if (!pubKey || pubKey === 'follows') {
      return '';
    }
    return new PublicKey(pubKey).toString();
  }, [pubKey]);
  const initialName = useMemo(() => {
    if (!pubKey || pubKey === 'follows') {
      return 'follows';
    }
    return animalName(pubKeyHex);
  }, [pubKey, pubKeyHex]);
  const [name, setName] = useState(initialName);
  const isPlaceHolder = name === initialName;

  useEffect(() => {
    if (!pubKeyHex) {
      setName(pubKey);
    }
    const user = ndk().getUser({ pubkey: pubKeyHex });
    user.fetchProfile().then((profile) => {
      if (profile) {
        setName(profile.name || initialName);
      }
    });
  }, [pubKeyHex]);

  return (
    <div
      className={classNames({
        italic: isPlaceHolder,
      })}
    >
      {name}
    </div>
  );
}
