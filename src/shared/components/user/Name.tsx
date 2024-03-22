import { useEffect, useMemo, useState } from 'react';

import ndk from '@/shared/ndk.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export function Name({ pubKey }: { pubKey: string }) {
  const [name, setName] = useState('');
  const pubKeyHex = useMemo(() => {
    if (!pubKey || pubKey === 'follows') {
      return '';
    }
    return new PublicKey(pubKey).toString();
  }, [pubKey]);

  useEffect(() => {
    if (!pubKeyHex) {
      setName(pubKey);
    }
    const user = ndk.getUser({ pubkey: pubKeyHex });
    user.fetchProfile().then((profile) => {
      if (profile) {
        setName(profile.name || '');
      }
    });
  }, [pubKeyHex]);

  return (
    <div className="text-base">
      {!name && `${pubKey.slice(0, 6)}...${pubKey.slice(-6)}`}
      {name}
    </div>
  );
}
