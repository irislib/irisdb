import {useEffect, useState} from "react";
import {NDKUserProfile} from "@nostr-dev-kit/ndk";
import ndk from "@/shared/ndk.ts";

export default function AvatarAndName({ pubKey }: { pubKey: string }) {
  const [profile, setProfile] = useState<NDKUserProfile | null>(null);
  useEffect(() => {
    const user = ndk.getUser({ pubkey: pubKey });
    user.fetchProfile().then((profile) => {
      setProfile(profile);
    });
  }, [pubKey]);

  return (
    <div className="flex flex-row items-center gap-2">
      <div className={`w-10 h-10 rounded-full bg-base-300 flex items-center justify-center overflow-hidden`}>
        {profile?.image && (
          <img src={profile.image} alt={profile.name || pubKey} />
        )}
      </div>
      <div className="text-base font-bold">
        {!profile?.name && `${pubKey.slice(0, 6)}...${pubKey.slice(-6)}`}
        {profile?.name}
      </div>
    </div>
  );
}