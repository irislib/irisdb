import { PublicKey } from 'irisdb-nostr';
import { ndk } from 'irisdb-nostr';
import { useEffect, useMemo, useState } from 'react';

import MinidenticonImg from '@/shared/components/user/MinidenticonImg';

export const Avatar = ({ pubKey, className }: { pubKey: string; className?: string }) => {
  const [image, setImage] = useState('');
  const pubKeyHex = useMemo(() => {
    if (!pubKey || pubKey === 'follows') {
      return '';
    }
    return new PublicKey(pubKey).toString();
  }, [pubKey]);

  useEffect(() => {
    setImage('');
    const fetchImage = async () => {
      const user = ndk().getUser({ pubkey: pubKeyHex });
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
    <div
      className={`${className || 'w-12 h-12'} rounded-full bg-base-100 flex items-center justify-center overflow-hidden border-base-content border-2`}
    >
      <div className="w-full">
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
    </div>
  );
};
