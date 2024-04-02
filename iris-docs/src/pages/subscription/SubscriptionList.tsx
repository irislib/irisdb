import { RenewSub } from '@/pages/subscription/RenewSub.tsx';
import { Subscription } from '@/pages/subscription/SnortApi.ts';

const SubscriptionList = ({ subscriptions }: { subscriptions: Subscription[] }) => (
  <div className="divide-y divide-base-300">
    {subscriptions.map((subscription) => (
      <div key={subscription.id} className="flex flex-col gap-4">
        <div className="flex justify-between">
          <span className="text-lg font-medium">{subscription.type === 0 ? 'Fan' : 'Pro'}</span>
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
);

export default SubscriptionList;
