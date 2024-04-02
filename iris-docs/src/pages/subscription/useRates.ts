import { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk';
import { ndk, PublicKey } from 'irisdb-nostr';
import { useEffect, useState } from 'react';

export const SnortPubkey = new PublicKey(
  'npub1sn0rtcjcf543gj4wsg7fa59s700d5ztys5ctj0g69g2x6802npjqhjjtws',
).toString();

export function useRates(symbol: string, leaveOpen = true) {
  const [latest, setLatest] = useState<NostrEvent | undefined>(undefined);

  useEffect(() => {
    const sub = ndk().subscribe({
      kinds: [1009 as NDKKind],
      authors: [SnortPubkey],
      '#d': [symbol],
      limit: 1,
    });

    sub.on('event', (ev) => {
      if (!latest || ev.created_at > latest.created_at) {
        setLatest(ev);
      }
      if (!leaveOpen) {
        sub.stop();
      }
    });

    return () => sub.stop();
  }, [symbol]);

  const tag = latest?.tags.find((a) => a[0] === 'd' && a[1] === symbol);
  if (!tag) return undefined;
  return {
    time: latest?.created_at,
    ask: Number(tag[2]),
    bid: Number(tag[3]),
    low: Number(tag[4]),
    high: Number(tag[5]),
  };
}
