import { useLocalState } from 'irisdb-hooks';
import { useEffect, useState } from 'react';

import { RenewSub } from '@/pages/settings/subscription/RenewSub.tsx';
import SnortApi, {
  Subscription,
  SubscriptionError,
} from '@/pages/settings/subscription/SnortApi.ts';
import { Plans, SubscriptionType } from '@/pages/settings/subscription/utils.ts';
import Show from '@/shared/components/Show.tsx';

export function SubscriptionTab() {
  const [isLoggedIn] = useLocalState('user/publicKey', false, Boolean);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
  const [error, setError] = useState<SubscriptionError>();

  async function subscribe(type: number) {
    setError(undefined);
    try {
      const ref = 'iris-docs';
      await new SnortApi().createSubscription(type, ref);
      listSubscriptions();
    } catch (e) {
      if (e instanceof SubscriptionError) {
        setError(e);
      }
    }
  }

  async function listSubscriptions() {
    try {
      const subs = await new SnortApi().listSubscriptions();
      setSubscriptions(subs);
    } catch (e) {
      if (e instanceof SubscriptionError) {
        setError(e);
      }
    }
  }

  useEffect(() => {
    listSubscriptions();
  }, [isLoggedIn]);

  return (
    <Show when={isLoggedIn && !!subscriptions}>
      <div className="mb-4 gap-4 flex flex-col">
        <h2 className="text-2xl mb-4">Subscription</h2>
        <ul className="list-disc pl-5">
          <li>Storage space for your documents</li>
          <li>
            Paid features on the{' '}
            <a href="https://iris.to" className="link" target="_blank">
              Iris.to
            </a>{' '}
            decentralized social networking application
          </li>

          <li>
            Bitcoin lightning payment only! Get started easily with{' '}
            <a href="https://www.walletofsatoshi.com/" className="link link-accent">
              Wallet of Satoshi
            </a>
          </li>
        </ul>
        <Show when={subscriptions?.length === 0}>
          <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
            <div className="card w-full shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Fan Subscription</h2>
                <ul className="list-disc pl-5 h-full">
                  <li>Write access to Snort relay, with 1 year of data retention</li>
                  <li>
                    <a href="https://iris.to" className="link" target="_blank">
                      Iris.to
                    </a>
                    :
                    <ul className="list-disc pl-5">
                      <li>Multi-account support</li>
                      <li>Snort nostr address</li>
                      <li>Supporter badge</li>
                    </ul>
                  </li>
                </ul>
                <div className="font-bold">
                  {Plans.find((p) => p.id === SubscriptionType.Supporter)?.price.toLocaleString()}{' '}
                  sats / mo
                </div>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary w-full" onClick={() => subscribe(0)}>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            <div className="card w-full shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Pro Subscription</h2>
                <ul className="list-disc pl-5 h-full">
                  <li>Unlimited data retention on Snort relay</li>
                  <li>
                    <a href="https://iris.to" className="link" target="_blank">
                      Iris.to
                    </a>
                    :
                    <ul className="list-disc pl-5">
                      <li>DeepL translations</li>
                      <li>Downloadable backups from Snort relay</li>
                      <li>Bitcoin Lightning address proxy</li>
                      <li>Email - DM bridge for your Snort nostr address</li>
                    </ul>
                  </li>
                  <li>All Fan features</li>
                </ul>
                <div className="font-bold">
                  {Plans.find((p) => p.id === SubscriptionType.Premium)?.price.toLocaleString()}{' '}
                  sats / mo
                </div>

                <div className="card-actions justify-end">
                  <button className="btn btn-primary w-full" onClick={() => subscribe(1)}>
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Show>
        <Show when={!!error}>
          <div className="alert alert-error">{error?.code}</div>
        </Show>
        <Show when={!!subscriptions && subscriptions.length > 0}>
          <div className="divide-y divide-base-300">
            {subscriptions?.map((subscription) => (
              <div>
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
                {subscription.state !== 'paid' && <RenewSub sub={subscription} />}
              </div>
            ))}
          </div>
        </Show>
      </div>
    </Show>
  );
}
