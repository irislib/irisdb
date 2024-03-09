import { useEffect, useState } from 'react';

import ndk from '@/shared/ndk.ts';

export function Name({ pubKey }: { pubKey: string }) {
  const [name, setName] = useState('');

  useEffect(() => {
    const user = ndk.getUser({ pubkey: pubKey });
    user.fetchProfile().then((profile) => {
      if (profile) {
        setName(profile.name || '');
      }
    });
  }, [pubKey]);

  return (
    <div className="text-base font-bold">
      {!name && `${pubKey.slice(0, 6)}...${pubKey.slice(-6)}`}
      {name}
    </div>
  );
}
