import { useLocalState } from 'irisdb-hooks';
import { useEffect, useState } from 'react';

import { RenewSub } from '@/pages/settings/subscription/RenewSub.tsx';
import SnortApi, {
  Subscription,
  SubscriptionError,
} from '@/pages/settings/subscription/SnortApi.ts';
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
      <div className="mb-4 gap-2 flex flex-col">
        <h2 className="text-2xl mb-4">Subscription</h2>
        <span className="text-sm">
          Bitcoin lightning payment only! Get started with{' '}
          <a href="https://www.walletofsatoshi.com/" className="link link-accent">Wallet of Satoshi</a>.
        </span>
        <Show when={subscriptions?.length === 0}>
          <div className="flex justify-center items-center gap-4 h-32">
            <button className="btn btn-primary" onClick={() => subscribe(0)}>
              Subscribe to Fan
            </button>
            <button className="btn btn-primary" onClick={() => subscribe(1)}>
              Subscribe to Pro
            </button>
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
