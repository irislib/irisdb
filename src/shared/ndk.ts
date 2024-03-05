import NDK, { NDKNip07Signer } from "@nostr-dev-kit/ndk";

const nip07signer = new NDKNip07Signer();

const ndk = new NDK({
  explicitRelayUrls: ["wss://relay.snort.social"],
  signer: nip07signer,
});

ndk.connect();

export function getUser() {
  return nip07signer.user();
}

export default ndk;