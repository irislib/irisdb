import { hexToBytes } from '@noble/hashes/utils';
import classNames from 'classnames';
import { useLocalState } from 'irisdb-hooks';
import { newUserLogin, privateKeyLogin } from 'irisdb-nostr';
import { nip19 } from 'nostr-tools';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import Show from '@/shared/components/Show';
import { UserRow } from '@/shared/components/user/UserRow';

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
    // TODO proper validation
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

  function copyPublicKey() {
    navigator.clipboard.writeText(nip19.npubEncode(publicKey));
  }

  return (
    <div className="flex flex-row items-center gap-2 justify-between card card-compact bg-base-100">
      <div className="card-body">
        <Show when={!publicKey}>
          <div className="flex flex-col gap-4">
            <form className="flex flex-row items-center gap-2" onSubmit={(e) => onNewUserLogin(e)}>
              <input
                autoComplete="name"
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
            <div className="divider">Already have an account?</div>
            <div className="flex flex-row items-center gap-2">
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  autoComplete="nsec"
                  type="password"
                  className={classNames('input input-sm input-bordered', {
                    'input-error': inputPrivateKey && inputPrivateKey.length < 60,
                  })}
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
        <Show when={!!publicKey}>
          <div className="flex flex-col gap-2">
            <UserRow pubKey={publicKey} />
            <button className="btn btn-sm btn-primary" onClick={() => copyPublicKey()}>
              Copy public key
            </button>
            <Show when={!!privateKey}>
              <button className="btn btn-sm btn-secondary" onClick={() => copyPrivateKey()}>
                Copy secret key
              </button>
              <span className={'text-xs text-base-content'}>
                Secret key grants full access to your account. Keep it safe.
              </span>
            </Show>
            <button className="btn btn-sm btn-outline" onClick={() => logout()}>
              Log out
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
