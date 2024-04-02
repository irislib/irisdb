import { useRates } from '@/pages/subscription/useRates.ts';

export function SatsToUsd({ sats }: { sats: number }) {
  const rate = useRates('BTCUSD');
  if (!rate) return null;
  return `≈ $${((sats * rate.ask) / 100_000_000).toFixed(2)}`;
}
