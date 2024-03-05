import {getUser} from "@/shared/ndk.ts";
import useLocalState from "@/state/useLocalState.ts";
import AvatarAndName from "@/shared/components/AvatarAndName.tsx";

export default function LoginButton() {
  const [publicKey, setPublicKey] = useLocalState('publicKey','');

  function login() {
    getUser().then((user) => {
      setPublicKey(user.pubkey);
    });
  }

  function logout() {
    setPublicKey('');
  }

  return (
    <div className="mb-4 flex flex-row items-center gap-2 justify-between">
      {!publicKey && (
        <button className="btn btn-sm btn-accent mb-4" onClick={() => login()}>Nostr Extension Login</button>
      )}
      {publicKey && (
        <>
          <AvatarAndName pubKey={publicKey} />
          <button className="btn btn-sm btn-accent" onClick={() => logout()}>Log out</button>
        </>
      )}
    </div>
  )
}