import { hexToBytes } from '@noble/hashes/utils';
import { nip19 } from 'nostr-tools';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { Avatar } from '@/shared/components/Avatar.tsx';
import { Name } from '@/shared/components/Name.tsx';
import Show from '@/shared/components/Show.tsx';
import { newUserLogin, privateKeyLogin } from '@/shared/ndk.ts';
import { useLocalState } from '@/state/useNodeState.ts';

const NSEC_NPUB_REGEX = /(nsec1|npub1)[a-zA-Z0-9]{20,65}/gi;

export default function LoginDialog() {
  const [, setNip07Login] = useLocalState('user/nip07Login', false);
  const [publicKey, setPublicKey] = useLocalState('user/publicKey', '');
  const [privateKey, setPrivateKey] = useLocalState('user/privateKey', '');
  const [newUserName, setNewUserName] = useState('');
  const [inputPrivateKey, setInputPrivateKey] = useState('');

  function extensionLogin() {
    if (window.nostr) {
      setNip07Login(true);
    } else {
      window.open('https://nostrcheck.me/register/browser-extension.php', '_blank');
    }
  }

  useEffect(() => {
    if (inputPrivateKey && inputPrivateKey.length > 60) {
      privateKeyLogin(inputPrivateKey);
    }
  }, [inputPrivateKey]);

  function logout() {
    if (!privateKey || confirm('Log out? Make sure you have a backup of your secret key.')) {
      setPublicKey('');
      setPrivateKey('');
      setNip07Login(false);
    }
  }

  function onNameChange(e: ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    if (val.match(NSEC_NPUB_REGEX)) {
      e.preventDefault();
    } else {
      setNewUserName(e.target.value);
    }
  }

  function onPrivateKeyChange(e: ChangeEvent<HTMLInputElement>) {
    setInputPrivateKey(e.target.value);
  }

  function onNewUserLogin(e: FormEvent) {
    e.preventDefault();
    if (newUserName) {
      newUserLogin(newUserName);
    }
  }

  function copyPrivateKey() {
    const nsec = nip19.nsecEncode(hexToBytes(privateKey));
    navigator.clipboard.writeText(nsec);
  }

  return (
    <div className="flex flex-row items-center gap-2 justify-between card card-compact bg-neutral">
      <div className="card-body">
        <Show when={!publicKey}>
          <div className="flex flex-col gap-2">
            <form className="flex flex-row items-center gap-2" onSubmit={(e) => onNewUserLogin(e)}>
              <input
                className="input input-sm input-bordered"
                type="text"
                placeholder="What's your name?"
                value={newUserName}
                onChange={(e) => onNameChange(e)}
              />
              <button className="btn btn-sm btn-primary" type="submit">
                Go
              </button>
            </form>
            <p>Already have an account?</p>
            <div className="flex flex-row items-center gap-2">
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="password"
                  className="input input-sm input-bordered"
                  placeholder="Paste secret key"
                  onChange={(e) => onPrivateKeyChange(e)}
                />
              </form>
              or
              <button className="btn btn-sm btn-accent" onClick={() => extensionLogin()}>
                {window.nostr ? 'Nostr Extension Login' : 'Install Nostr Extension'}
              </button>
            </div>
          </div>
        </Show>
        <Show when={publicKey}>
          <div className="flex flex-row gap-2 items-center justify-between">
            <Avatar pubKey={publicKey} />
            <Name pubKey={publicKey} />
            <div className="flex flex-row gap-2">
              <Show when={privateKey}>
                <button className="btn btn-sm btn-accent" onClick={() => copyPrivateKey()}>
                  Copy secret key
                </button>
              </Show>
              <button className="btn btn-sm btn-secondary" onClick={() => logout()}>
                Log out
              </button>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
