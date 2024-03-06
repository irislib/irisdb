import { Adapter, Callback, NodeValue, Unsubscribe } from '@/state/types.ts';
import NDK, {NDKEvent, NostrEvent} from "@nostr-dev-kit/ndk";

const EVENT_KIND = 30078;

export default class NDKAdapter extends Adapter {
  seenValues = new Map<string, NodeValue>();
  ndk: NDK;
  authors: string[];

  constructor(ndk: NDK, authors: string[]) {
    super();
    this.ndk = ndk;
    this.authors = authors;
  }

  get(path: string, callback: Callback): Unsubscribe {
    const unsubObj = { fn: null as Unsubscribe | null };

    const sub = this.ndk.subscribe(
      { authors: this.authors, kinds: [EVENT_KIND], '#d': [path] },
    );
    unsubObj.fn = () => sub.stop();
    sub.on('event', (event) => {
      callback(JSON.parse(event.content), path, event.created_at * 1000, () => unsubObj.fn?.());
    });
    sub.start();
    return () => unsubObj.fn?.();
  }

  async set(path: string, value: NodeValue) {
    if (value && value.updatedAt === undefined) {
      throw new Error(`Invalid value: ${JSON.stringify(value)}`);
    }

    const seen = this.seenValues.get(path);
    if (seen && seen.updatedAt <= value.updatedAt) {
      return;
    }
    this.seenValues.set(path, value);

    console.log('set state', path, value);

    const directory = path.split('/').slice(0, -1).join('/');
    const e = new NDKEvent(this.ndk);
    e.kind = EVENT_KIND;
    e.content = JSON.stringify(value.value);
    e.created_at = Math.ceil(value.updatedAt / 1000);
    e.tags = [
      ['d', path],
      ['f', directory],
    ];
    try {
      await e.publish();
      console.log('published state event', e);
    } catch (error) {
      console.error('error publishing state event', error, e);
    }
  }

  list(path: string, callback: Callback): Unsubscribe {
    const unsubObj = { fn: null as Unsubscribe | null };

    const sub = this.ndk.subscribe(
      { authors: this.authors, kinds: [EVENT_KIND] },
    );
    unsubObj.fn = () => sub.stop();
    sub.on('event',       (event: NostrEvent) => {
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
          callback(JSON.parse(event.content), childPath, event.created_at * 1000, () =>
            unsubObj.fn?.(),
          );
        }
      }
    );
    sub.start();
    return () => unsubObj.fn?.();
  }
}
