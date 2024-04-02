import { useLocalState } from 'irisdb-hooks';
import { useEffect, useState } from 'react';

import SnortApi, { Subscription, SubscriptionError } from '@/pages/subscription/SnortApi.ts';
import Show from '@/shared/components/Show.tsx';

import SubscriptionCards from './SubscriptionCards.tsx';
import SubscriptionFeatures from './SubscriptionFeatures.tsx';
import SubscriptionList from './SubscriptionList.tsx';

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
    <Show when={isLoggedIn}>
      <div className="mb-4 gap-4 flex flex-col">
        <h2 className="text-2xl mb-4">Subscription</h2>
        <Show when={subscriptions?.length === 0}>
          <SubscriptionFeatures />
          <SubscriptionCards subscribe={subscribe} />
        </Show>
        <Show when={!!error}>
          <div className="alert alert-error">{error?.code}</div>
        </Show>
        {subscriptions && subscriptions.length > 0 && (
          <SubscriptionList subscriptions={subscriptions} />
        )}
      </div>
    </Show>
  );
}
