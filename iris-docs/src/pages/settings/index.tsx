import { NDKRelay } from '@nostr-dev-kit/ndk';
import { useLocalState } from 'irisdb-hooks';
import { ndk as getNdk } from 'irisdb-nostr';
import { useEffect, useState } from 'react';

import QrCode from '@/pages/settings/QrCode.tsx';
import SnortApi, { Subscription, SubscriptionError } from '@/pages/settings/SnortApi.ts';
import CopyButton from '@/shared/components/CopyButton.tsx';
import Show from '@/shared/components/Show.tsx';

export function Invoice({ invoice, notice }: { invoice: string; notice?: string }) {
  return (
    <div className="flex flex-col items-center g12 txt-center">
      {notice && <b className="error">{notice}</b>}
      <QrCode data={invoice} link={`lightning:${invoice}`} />
      <div className="flex flex-col g12">
        <CopyButton text="Copy invoice" copyStr={invoice} className="items-center" />
        <a href={`lightning:${invoice}`}>
          <button type="button" className="btn btn-primary">
            Open Wallet
          </button>
        </a>
      </div>
    </div>
  );
}

function SubscriptionTab() {
  const [isLoggedIn] = useLocalState('user/publicKey', false, Boolean);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoice, setInvoice] = useState('');
  const [error, setError] = useState<SubscriptionError>();

  async function subscribe(type: number) {
    setError(undefined);
    try {
      const ref = 'iris-docs';
      const rsp = await new SnortApi().createSubscription(type, ref);
      setInvoice(rsp.pr);
    } catch (e) {
      if (e instanceof SubscriptionError) {
        setError(e);
      }
    }
  }

  useEffect(() => {
    if (!isLoggedIn) return;
    new SnortApi().listSubscriptions().then((subs) => {
      console.log(111, subs);
      setSubscriptions(subs);
    });
  }, [isLoggedIn]);

  return (
    <Show when={isLoggedIn}>
      <div className="mb-4">
        <h2 className="text-2xl mb-4">Subscription</h2>
        <Show when={subscriptions.length === 0}>
          <div className="flex justify-center items-center gap-4 h-32">
            <button className="btn btn-primary" onClick={() => subscribe(0)}>
              Subscribe to Fan
            </button>
            <button className="btn btn-primary" onClick={() => subscribe(1)}>
              Subscribe to Pro
            </button>
          </div>
        </Show>
        <Show when={!!invoice}>
          <Invoice invoice={invoice} />
        </Show>
        <Show when={!!error}>
          <div className="alert alert-error">{error?.code}</div>
        </Show>
        <Show when={subscriptions.length > 0}>
          <div className="divide-y divide-base-300">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="py-2 flex justify-between">
                <span className="text-lg font-medium">
                  {subscription.type === 0 ? 'Fan' : 'Pro'}
                </span>
                <span
                  className={`badge ${subscription.state === 'paid' ? 'badge-success' : 'badge-error'}`}
                >
                  {subscription.state}
                </span>
              </div>
            ))}
          </div>
        </Show>
      </div>
    </Show>
  );
}

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
    <div className="flex justify-center items-start min-h-screen bg-base-300">
      <div className="container max-w-2xl p-4 md:p-8 my-5 bg-base-100 rounded-lg shadow">
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
