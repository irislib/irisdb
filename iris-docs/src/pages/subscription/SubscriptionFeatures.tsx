import { RiFlashlightLine, RiSaveLine, RiVipCrownLine } from '@remixicon/react';
import { ReactNode } from 'react';

const SubscriptionFeatures = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <FeatureCard
      description="Storage space for your documents"
      icon={<RiSaveLine className="w-8 h-8" />}
    />
    <FeatureCard
      description={
        <>
          Paid features on the{' '}
          <a href="https://iris.to" className="link" target="_blank">
            Iris.to
          </a>{' '}
          decentralized social networking application
        </>
      }
      icon={<RiVipCrownLine className="w-8 h-8" />}
    />
    <FeatureCard
      description={
        <>
          Bitcoin lightning payment only! Get started easily with{' '}
          <a href="https://www.walletofsatoshi.com/" className="link link-primary" target="_blank">
            Wallet of Satoshi
          </a>
        </>
      }
      icon={<RiFlashlightLine className="w-8 h-8" />}
    />
  </div>
);

const FeatureCard = ({
  description,
  icon,
}: {
  description: string | ReactNode;
  icon: ReactNode;
}) => (
  <div className="card bg-base-300 text-base-content w-full shadow-xl p-4 flex flex-col items-center gap-2">
    {icon}
    <div className="text-center">{description}</div>
  </div>
);

export default SubscriptionFeatures;
