import { ChangeEvent, FormEvent, useState } from 'react';

import { Invoice } from '@/pages/subscription/Invoice.tsx';
import { SatsToUsd } from '@/pages/subscription/SatsToUsd.tsx';
import SnortApi, { Subscription, SubscriptionError } from '@/pages/subscription/SnortApi.ts';
import { mapPlanName, mapSubscriptionErrorCode, Plans } from '@/pages/subscription/utils.ts';

export function RenewSub({ sub }: { sub: Subscription }) {
  const [invoice, setInvoice] = useState('');
  const [error, setError] = useState<SubscriptionError>();
  const [months, setMonths] = useState(1);

  async function renew(id: string, months: number) {
    const api = new SnortApi();
    try {
      const rsp = await api.renewSubscription(id, months);
      setInvoice(rsp.pr);
    } catch (e) {
      if (e instanceof SubscriptionError) {
        setError(e);
      }
    }
  }

  const handleMonthsChange = (e: ChangeEvent<HTMLInputElement>) =>
    setMonths(Number(e.target.value));
  const handleRenewSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    renew(sub.id, months);
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  const buttonClass = `btn ${sub.state === 'expired' ? 'btn-secondary' : 'btn-primary'}`;
  const buttonText = sub.state === 'expired' ? `Renew ${mapPlanName(sub.type)}` : 'Pay Now';

  const plan = Plans.find((p) => p.id === sub.type);

  if (!sub) return;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center">
        <small className="text-xs">Months</small>
        <form onSubmit={handleRenewSubmit} className="flex gap-2">
          <input
            disabled={!!invoice}
            type="number"
            className="input input-bordered w-full max-w-xs"
            value={months}
            onChange={handleMonthsChange}
            min={1}
          />
          <button disabled={!!invoice} type="submit" className={buttonClass}>
            {buttonText}
          </button>
        </form>
      </div>

      {plan && (
        <div>
          Price: <strong>{formatAmount(plan.price * months)} sats</strong>{' '}
          <span className="text-sm">
            <SatsToUsd sats={plan.price * months} />
          </span>
        </div>
      )}

      <div>
        {invoice && <Invoice invoice={invoice} />}
        {error && <strong className="text-red-500">{mapSubscriptionErrorCode(error)}</strong>}
      </div>
    </div>
  );
}
