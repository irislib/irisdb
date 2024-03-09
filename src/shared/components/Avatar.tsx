// Avatar.js
import React, { useEffect, useState } from 'react';

import MinidenticonImg from '@/shared/components/MinidenticonImg.tsx';
import ndk from '@/shared/ndk.ts';

export const Avatar = ({ pubKey }: { pubKey: string }) => {
  const [image, setImage] = useState('');

  useEffect(() => {
    const fetchImage = async () => {
      const user = ndk.getUser({ pubkey: pubKey });
      const profile = await user.fetchProfile();
      if (profile && profile.image) {
        setImage(profile.image);
      }
    };

    fetchImage();
  }, [pubKey, setImage]);

  return (
    <div className="w-12 h-12 rounded-full bg-neutral flex items-center justify-center overflow-hidden border-neutral-content border-2">
      {image ? (
        <img src={image} alt="User Avatar" className="w-full h-full object-cover" />
      ) : (
        <MinidenticonImg username={pubKey} alt="User Avatar" />
      )}
    </div>
  );
};
