import {useEffect} from "react";
import ndk from "@/shared/ndk.ts";
import useLocalState from "@/state/useLocalState.ts";

export default function AvatarAndName({ pubKey }: { pubKey: string }) {
  const [name, setName] = useLocalState('user/name', '');
  const [image, setImage] = useLocalState('user/image', '');

  useEffect(() => {
    const user = ndk.getUser({ pubkey: pubKey });
    user.fetchProfile().then((profile) => {
      if (profile) {
        setName(profile.name || '');
        setImage(profile.image || '');
      }
    });
  }, [pubKey]);

  return (
    <div className="flex flex-row items-center gap-2">
      <div className={`w-12 h-12 rounded-full bg-neutral flex items-center justify-center overflow-hidden border-neutral-content border-2`}>
        {image && (
          <img src={image} alt={name || pubKey} />
        )}
      </div>
      <div className="text-base font-bold">
        {!name && `${pubKey.slice(0, 6)}...${pubKey.slice(-6)}`}
        {name}
      </div>
    </div>
  );
}