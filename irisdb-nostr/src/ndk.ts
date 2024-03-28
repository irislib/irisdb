import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import NDK, { NDKConstructorParams, NDKNip07Signer, NDKPrivateKeySigner } from '@nostr-dev-kit/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { localState } from 'irisdb';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';

let ndkInstance: NDK | null = null;
let privateKeySigner: NDKPrivateKeySigner | undefined;
let nip07Signer: NDKNip07Signer | undefined;

/**
 * Get a singleton "default" NDK instance to get started quickly. If you want to init NDK with e.g. your own relays, pass them on the first call.
 * @throws Error if NDK init options are passed after the first call
 */
export const ndk = (opts?: NDKConstructorParams): NDK => {
  if (!ndkInstance) {
    const options = opts || {
      explicitRelayUrls: [
        'wss://strfry.iris.to',
        'wss://relay.damus.io',
        'wss://relay.nostr.band',
        'wss://relay.snort.social',
      ],
      cacheAdapter: new NDKCacheAdapterDexie({ dbName: 'irisdb-nostr' }),
    };
    ndkInstance = new NDK(options);
    watchNdkSigner(ndkInstance);
    ndkInstance.connect();
  } else if (opts) {
    throw new Error('NDK instance already initialized, cannot pass options');
  }
  return ndkInstance;
};

function watchNdkSigner(instance: NDK) {
  localState.get('user/privateKey').on((privateKey?: string) => {
    const havePrivateKey = privateKey && typeof privateKey === 'string';
    if (!privateKeySigner && havePrivateKey) {
      try {
        privateKeySigner = new NDKPrivateKeySigner(privateKey);
        instance.signer = privateKeySigner;
      } catch (e) {
        console.error(e);
      }
    } else if (privateKeySigner && !havePrivateKey) {
      privateKeySigner = undefined;
      instance.signer = undefined;
    }
  });

  localState.get('user/nip07Login').on((nip07?: string) => {
    if (nip07) {
      nip07Signer = new NDKNip07Signer();
      instance.signer = nip07Signer;
      nip07Signer.user().then((user) => {
        localState.get('user/publicKey').put(user.pubkey);
      });
    } else if (nip07Signer) {
      nip07Signer = undefined;
      instance.signer = undefined;
    }
  });
}

export function newUserLogin(name: string) {
  if (!ndkInstance) {
    throw new Error('NDK not initialized');
  }
  const sk = generateSecretKey(); // `sk` is a Uint8Array
  const pk = getPublicKey(sk); // `pk` is a hex string
  const privateKeyHex = bytesToHex(sk);
  localState.get('user/privateKey').put(privateKeyHex);
  localState.get('user/publicKey').put(pk);
  privateKeySigner = new NDKPrivateKeySigner(privateKeyHex);
  ndkInstance.signer = privateKeySigner;
  const profileEvent = new NDKEvent(ndkInstance);
  profileEvent.kind = 0;
  profileEvent.content = JSON.stringify({ name });
  profileEvent.publish();
}

export function privateKeyLogin(privateKey: string) {
  if (!ndkInstance) {
    throw new Error('NDK not initialized');
  }
  if (privateKey && typeof privateKey === 'string') {
    const bytes =
      privateKey.indexOf('nsec1') === 0
        ? (nip19.decode(privateKey).data as Uint8Array)
        : hexToBytes(privateKey);
    const hex = bytesToHex(bytes);
    privateKeySigner = new NDKPrivateKeySigner(hex);
    ndkInstance.signer = privateKeySigner;
    const publicKey = getPublicKey(bytes);
    localState.get('user/privateKey').put(hex);
    localState.get('user/publicKey').put(publicKey);
  }
}
