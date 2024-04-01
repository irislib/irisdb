import { useLocalState } from 'irisdb-hooks';
import { useEffect, useState } from 'react';

import { Invoice } from '@/pages/settings/Invoice.tsx';
import SnortApi, { Subscription, SubscriptionError } from '@/pages/settings/SnortApi.ts';
import Show from '@/shared/components/Show.tsx';

export function SubscriptionTab() {
  const [isLoggedIn] = useLocalState('user/publicKey', false, Boolean);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>();
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
    <Show when={isLoggedIn && !!subscriptions}>
      <div className="mb-4">
        <h2 className="text-2xl mb-4">Subscription</h2>
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
        <Show when={!!invoice}>
          <Invoice invoice={invoice} />
        </Show>
        <Show when={!!error}>
          <div className="alert alert-error">{error?.code}</div>
        </Show>
        <Show when={!!subscriptions && subscriptions.length > 0}>
          <div className="divide-y divide-base-300">
            {subscriptions?.map((subscription) => (
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
