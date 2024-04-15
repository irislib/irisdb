import NDK, { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk';
import debug from 'debug';
import { Adapter, Callback, NodeValue, Unsubscribe } from 'irisdb';
import { nip19 } from 'nostr-tools';

import { PublicKey } from './Hex/PublicKey';

const EVENT_KIND = 30078;

const log = debug('nostree:ndk-adapter');

/**
 * Stores and syncs data over [Nostr](https://nostr.com/) using the [Nostr Dev Kit](https://github.com/nostr-dev-kit/ndk).
 */
export default class NDKAdapter implements Adapter {
  seenValues = new Map<string, NodeValue>();
  ndk: NDK;
  authors: string[];

  constructor(ndk: NDK, authors: PublicKey[]) {
    this.ndk = ndk;
    this.authors = authors.map((p) => p.toString());
  }

  get(path: string, callback: Callback): Unsubscribe {
    const unsubObj = { fn: null as Unsubscribe | null };

    const sub = this.ndk.subscribe({
      authors: this.authors,
      kinds: [EVENT_KIND],
      '#d': [path],
    });
    unsubObj.fn = () => sub.stop();
    sub.on('event', (event) => {
      const npub = nip19.npubEncode(event.pubkey);
      callback(JSON.parse(event.content), npub + path, event.created_at * 1000, () =>
        unsubObj.fn?.(),
      );
    });
    sub.start();
    return () => unsubObj.fn?.();
  }

  async set(path: string, value: NodeValue) {
    if (value && value.updatedAt === undefined) {
      throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }

    const seen = this.seenValues.get(path);
    if (seen) {
      if (seen.updatedAt > value.updatedAt) {
        return;
      }
      if (seen.updatedAt === value.updatedAt) {
        if ((seen.value || '') > (value.value || '')) {
          return;
        }
      }
    }
    this.seenValues.set(path, value);

    log('set state', path, value);

    const directory = path.split('/').slice(0, -1).join('/');
    const e = new NDKEvent(this.ndk);
    e.kind = EVENT_KIND;
    e.content = JSON.stringify(value.value);
    e.created_at = Math.floor(value.updatedAt / 1000);
    e.tags = [
      ['d', path],
      ['f', directory],
    ];
    if (value.expiresAt) {
      // NIP-40
      e.tags.push(['expiration', Math.floor(value.expiresAt / 1000).toString()]);
    }
    try {
      await e.publish();
      log('published state event', e);
    } catch (error) {
      console.error('error publishing state event', error, e);
    }
  }

  list(path: string, callback: Callback): Unsubscribe {
    const unsubObj = { fn: null as Unsubscribe | null };

    const sub = this.ndk.subscribe({ authors: this.authors, kinds: [EVENT_KIND] });
    unsubObj.fn = () => sub.stop();
    sub.on('event', (event: NostrEvent) => {
      const childPath = event.tags.find((tag: string[]) => {
        if (tag[0] === 'd') {
          const remainingPath = tag[1].replace(`${path}/`, '');
          if (
            remainingPath.length &&
            tag[1].startsWith(`${path}/`) &&
            !remainingPath.includes('/')
          ) {
            return true;
          }
        }
      })?.[1];

      if (childPath) {
        const npub = nip19.npubEncode(event.pubkey);
        callback(JSON.parse(event.content), npub + childPath, event.created_at * 1000, () =>
          unsubObj.fn?.(),
        );
      }
    });
    sub.start();
    return () => unsubObj.fn?.();
  }
}
