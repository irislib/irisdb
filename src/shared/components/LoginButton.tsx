import {requestPermission} from "@/shared/ndk.ts";
import useLocalState from "@/state/useLocalState.ts";

export default function LoginButton() {
  const [publicKey, setPublicKey] = useLocalState('publicKey','');

  function login() {
    requestPermission().then((user) => {
      setPublicKey(user.npub);
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
          <div className="text-sm">Your public key: {publicKey}</div>
          <button className="btn btn-sm btn-accent" onClick={() => logout()}>Log out</button>
        </>
      )}
    </div>
  )
}