import { NDKRelay } from '@nostr-dev-kit/ndk';
import { ndk as getNdk } from 'irisdb-nostr';
import { useEffect, useState } from 'react';

import { SubscriptionTab } from '@/pages/subscription/SubscriptionTab.tsx';

export default function Settings() {
  const ndk = getNdk();

  const [relays, setRelays] = useState(new Map<string, NDKRelay>());

  useEffect(() => {
    const updateRelays = () => {
      setRelays(new Map(ndk.pool.relays));
    };
    updateRelays();
    const interval = setInterval(updateRelays, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-1 flex-col h-full items-center">
      <div className="container max-w-3xl p-4 md:p-8 my-5 bg-base-100 rounded-lg shadow">
        <h1 className="text-3xl font-semibold mb-6">Settings</h1>
        <div className="mb-4">
          <h2 className="text-2xl mb-4">Network</h2>
          <div className="divide-y divide-base-300">
            {Array.from(relays).map(([name, relay]) => (
              <div key={name} className="py-2 flex justify-between">
                <span className="text-lg font-medium">{name.replace('wss://', '')}</span>
                <span
                  className={`badge ${relay.status === 1 ? 'badge-success' : 'badge-error'}`}
                ></span>
              </div>
            ))}
          </div>
        </div>
        <SubscriptionTab />
      </div>
    </div>
  );
}
