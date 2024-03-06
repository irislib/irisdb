import {newUserLogin, privateKeyLogin} from "@/shared/ndk.ts";
import useLocalState from "@/state/useLocalState.ts";
import AvatarAndName from "@/shared/components/AvatarAndName.tsx";
import Show from "@/shared/components/Show.tsx";
import {ChangeEvent, FormEvent, useEffect, useState} from "react";

export default function LoginDialog() {
  const [, setNip07Login] = useLocalState('user/nip07Login', false);
  const [publicKey, setPublicKey] = useLocalState('user/publicKey','');
  const [privateKey, setPrivateKey] = useLocalState('user/publicKey','');
  const [newUserName, setNewUserName] = useState('');
  const [inputPrivateKey, setInputPrivateKey] = useState('');

  function extensionLogin() {
    setNip07Login(true);
  }

  useEffect(() => {
    if (inputPrivateKey && inputPrivateKey.length > 60) {
      privateKeyLogin(inputPrivateKey);
    }
  }, [inputPrivateKey]);

  function logout() {
    setPublicKey('');
    setPrivateKey('');
    setNip07Login(false);
  }

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    setNewUserName(e.target.value);
  }

  function onPrivateKeyChange(e: ChangeEvent<HTMLInputElement>) {
    setInputPrivateKey(e.target.value);
  }

  function onNewUserLogin(e: FormEvent) {
    e.preventDefault();
    newUserLogin(newUserName);
  }

  function copyPrivateKey() {
    navigator.clipboard.writeText(privateKey);
  }

  return (
    <div className="flex flex-row items-center gap-2 justify-between card card-compact bg-neutral">
      <div className="card-body">
        <Show when={!publicKey}>
          <div className="flex flex-col gap-2">
            <form className="flex flex-row items-center gap-2" onSubmit={e => onNewUserLogin(e)}>
              <input className="input input-sm input-bordered" type="text" placeholder="What's your name?" onChange={e => onNameChange(e)} />
              <button className="btn btn-sm btn-primary" type="submit">Go</button>
            </form>
            <p>Already have a Nostr account?</p>
            <div className="flex flex-row items-center gap-2">
              <input type="password" className="input input-sm input-bordered" placeholder="Paste private key" onChange={e => onPrivateKeyChange(e)} />
              or
              <button className="btn btn-sm btn-accent" onClick={() => extensionLogin()}>Nostr Extension Login</button>
            </div>
          </div>
        </Show>
        <Show when={publicKey}>
          <div className="flex flex-row gap-2 items-center justify-between">
            <AvatarAndName pubKey={publicKey} />
            <div className="flex flex-row gap-2">
              <Show when={privateKey}>
                <button className="btn btn-sm btn-accent" onClick={() => copyPrivateKey()}>Copy private key</button>
              </Show>
              <button className="btn btn-sm btn-secondary" onClick={() => logout()}>Log out</button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}