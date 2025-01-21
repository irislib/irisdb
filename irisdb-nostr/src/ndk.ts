import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import NDK, {
  NDKConstructorParams,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKRelay,
  NDKRelayAuthPolicies,
} from '@nostr-dev-kit/ndk';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import NDKCacheAdapterDexie from '@nostr-dev-kit/ndk-cache-dexie';
import { localState } from 'irisdb';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';

let ndkInstance: NDK | null = null;
let privateKeySigner: NDKPrivateKeySigner | undefined;
let nip07Signer: NDKNip07Signer | undefined;

/**
 * Default relays to use when initializing NDK
 */
export const DEFAULT_RELAYS = [
  'wss://strfry.iris.to',
  'wss://relay.damus.io',
  'wss://relay.nostr.band',
  'wss://relay.snort.social',
];

/**
 * Get a singleton "default" NDK instance to get started quickly. If you want to init NDK with e.g. your own relays, pass them on the first call.
 *
 * This needs to be called to make nip07 login features work.
 * @throws Error if NDK init options are passed after the first call
 */
export const ndk = (opts?: NDKConstructorParams): NDK => {
  if (!ndkInstance) {
    const options = opts || {
      explicitRelayUrls: DEFAULT_RELAYS,
      cacheAdapter: new NDKCacheAdapterDexie({ dbName: 'irisdb-nostr' }),
    };
    ndkInstance = new NDK(options);
    watchLocalSettings(ndkInstance);
    ndkInstance.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({ ndk: ndkInstance });
    ndkInstance.connect();
  } else if (opts) {
    throw new Error('NDK instance already initialized, cannot pass options');
  }
  return ndkInstance;
};

function watchLocalSettings(instance: NDK) {
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

  localState.get('user/relays').on((relays?: string[]) => {
    if (Array.isArray(relays)) {
      relays.forEach((url) => {
        if (!instance.pool.relays.has(url)) {
          instance.pool.addRelay(new NDKRelay(url, undefined, instance));
        }
      });
      for (const url of instance.pool.relays.keys()) {
        if (!relays.includes(url)) {
          instance.pool.removeRelay(url);
        }
      }
    }
  });
}

/**
 * Create a new account (keypair), login with it and publish a profile event with the given name
 * @param name
 */
export function newUserLogin(name: string) {
  ndk();
  const sk = generateSecretKey(); // `sk` is a Uint8Array
  const pk = getPublicKey(sk); // `pk` is a hex string
  const privateKeyHex = bytesToHex(sk);
  localState.get('user/privateKey').put(privateKeyHex);
  localState.get('user/publicKey').put(pk);
  privateKeySigner = new NDKPrivateKeySigner(privateKeyHex);
  ndkInstance!.signer = privateKeySigner;
  const profileEvent = new NDKEvent(ndkInstance!);
  profileEvent.kind = 0;
  profileEvent.content = JSON.stringify({ name });
  profileEvent.publish();
}

/**
 * Login with a private key
 * @param privateKey - hex or nsec format
 */
export function privateKeyLogin(privateKey: string) {
  ndk();
  if (privateKey && typeof privateKey === 'string') {
    const bytes =
      privateKey.indexOf('nsec1') === 0
        ? (nip19.decode(privateKey).data as Uint8Array)
        : hexToBytes(privateKey);
    const hex = bytesToHex(bytes);
    privateKeySigner = new NDKPrivateKeySigner(hex);
    ndkInstance!.signer = privateKeySigner;
    const publicKey = getPublicKey(bytes);
    localState.get('user/privateKey').put(hex);
    localState.get('user/publicKey').put(publicKey);
  }
}
