import { SatsToUsd } from '@/pages/subscription/SatsToUsd.tsx';
import { Plans, SubscriptionType } from '@/pages/subscription/utils.ts';

const SubscriptionCards = ({ subscribe }: { subscribe: (type: number) => void }) => (
  <div className="grid md:grid-cols-2 sm:grid-cols-1 gap-4">
    {Plans.map((plan) => (
      <div key={plan.id} className="card bg-primary bg-primary-content w-full shadow-xl">
        <div className="card-body">
          <h2 className="card-title">{plan.name} Subscription</h2>
          <PlanFeatures planId={plan.id} />
          <div className="font-bold">
            {plan.price.toLocaleString()} sats / mo{' '}
            <span className="text-sm">
              <SatsToUsd sats={plan.price} />
            </span>
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-primary w-full" onClick={() => subscribe(plan.id)}>
              Subscribe
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PlanFeatures = ({ planId }: { planId: SubscriptionType }) => {
  const features = {
    [SubscriptionType.Supporter]: (
      <ul className="list-disc pl-5 h-full text-sm">
        <li>Write access to Snort relay, with 1 year of data retention</li>
        <li>
          Iris.to:
          <ul className="list-disc pl-5">
            <li>Multi-account support</li>
            <li>Snort nostr address</li>
            <li>Supporter badge</li>
          </ul>
        </li>
      </ul>
    ),
    [SubscriptionType.Premium]: (
      <ul className="list-disc pl-5 h-full text-sm">
        <li>Unlimited data retention on Snort relay</li>
        <li>
          Iris.to:
          <ul className="list-disc pl-5">
            <li>DeepL translations</li>
            <li>Downloadable backups</li>
            <li>Bitcoin Lightning address proxy</li>
            <li>Email - DM bridge</li>
          </ul>
        </li>
        <li>All Fan features</li>
      </ul>
    ),
  };

  return features[planId] || null;
};

export default SubscriptionCards;
