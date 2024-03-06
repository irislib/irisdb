import NDK, {NDKNip07Signer, NDKPrivateKeySigner} from "@nostr-dev-kit/ndk";
import localState from "@/state/LocalState.ts";
import {NDKEvent} from "@nostr-dev-kit/ndk";
import {generateSecretKey, getPublicKey} from "nostr-tools";
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'

const ndk = new NDK({
  explicitRelayUrls: ["wss://relay.snort.social"],
});

ndk.connect();

let privateKeySigner: NDKPrivateKeySigner | undefined;
localState.get("user/privateKey").on((privateKey) => {
  if (!privateKeySigner && privateKey && typeof privateKey === "string") {
    try {
      privateKeySigner = new NDKPrivateKeySigner(privateKey);
      ndk.signer = privateKeySigner;
    } catch (e) {
      console.error(e);
    }
  } else if (privateKeySigner) {
    privateKeySigner = undefined;
    ndk.signer = undefined;
  }
});

let nip07Signer: NDKNip07Signer | undefined;
localState.get("user/nip07Login").on((nip07) => {
  if (nip07) {
    nip07Signer = new NDKNip07Signer();
    ndk.signer = nip07Signer;
    nip07Signer.user().then((user) => {
      localState.get('user/publicKey').put(user.pubkey);
    });
  } else if (nip07Signer) {
    nip07Signer = undefined;
    ndk.signer = undefined;
  }
});

export function newUserLogin(name: string) {
  const sk = generateSecretKey() // `sk` is a Uint8Array
  const pk = getPublicKey(sk) // `pk` is a hex string
  const privateKeyHex = bytesToHex(sk);
  localState.get("user/privateKey").put(privateKeyHex);
  localState.get("user/publicKey").put(pk);
  privateKeySigner = new NDKPrivateKeySigner(privateKeyHex);
  ndk.signer = privateKeySigner;
  const profileEvent = new NDKEvent(ndk);
  profileEvent.kind = 0;
  profileEvent.content = JSON.stringify({ name });
  profileEvent.publish();
}

export function privateKeyLogin(privateKey: string) {
  if (privateKey && typeof privateKey === "string") {
    const bytes = hexToBytes(privateKey);
    privateKeySigner = new NDKPrivateKeySigner(privateKey);
    ndk.signer = privateKeySigner;
    const publicKey = getPublicKey(bytes);
    localState.get("user/privateKey").put(privateKey);
    localState.get("user/publicKey").put(publicKey);
  }
}

export default ndk;