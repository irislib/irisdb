import { SubscriptionTab } from '@/pages/subscription/SubscriptionTab.tsx';

export default function Settings() {
  return (
    <div className="flex flex-1 flex-col h-full items-center">
      <div className="container max-w-3xl p-4 md:p-8 my-5 bg-base-100 rounded-lg shadow">
        <SubscriptionTab />
      </div>
    </div>
  );
}
