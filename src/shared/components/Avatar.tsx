import { useEffect, useMemo, useState } from 'react';

import MinidenticonImg from '@/shared/components/MinidenticonImg.tsx';
import ndk from '@/shared/ndk.ts';
import { PublicKey } from '@/utils/Hex/Hex.ts';

export const Avatar = ({ pubKey }: { pubKey: string }) => {
  const [image, setImage] = useState('');
  const pubKeyHex = useMemo(() => pubKey && new PublicKey(pubKey).toString(), [pubKey]);

  useEffect(() => {
    const fetchImage = async () => {
      const user = ndk.getUser({ pubkey: pubKeyHex });
      const profile = await user.fetchProfile();
      if (profile && profile.image) {
        setImage(profile.image);
      }
    };

    fetchImage();
  }, [pubKeyHex]);

  const handleImageError = () => {
    setImage('');
  };

  return (
    <div className="w-12 h-12 rounded-full bg-neutral flex items-center justify-center overflow-hidden border-neutral-content border-2">
      {image ? (
        <img
          src={image}
          alt="User Avatar"
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        <MinidenticonImg username={pubKeyHex} alt="User Avatar" />
      )}
    </div>
  );
};
