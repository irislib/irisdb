import {useState} from "react";
import {requestPermission} from "@/shared/ndk.ts";

export default function LoginButton() {
  const [publicKey, setPublicKey] = useState('');

  function login() {
    requestPermission().then((user) => {
      setPublicKey(user.npub);
    });
  }
  return (
    <>
      {!publicKey && (
        <button className="btn btn-sm btn-accent mb-4" onClick={() => login()}>Nostr Extension Login</button>
      )}
      {publicKey && (
        <div className="mb-4">
          <div className="text-sm">Your public key: {publicKey}</div>
        </div>
      )}
    </>
  )
}