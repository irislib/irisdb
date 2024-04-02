import {
  OfflineError,
  SubscriptionError,
  SubscriptionErrorCode,
} from '@/pages/subscription/SnortApi.ts';

export function mapPlanName(id: number) {
  switch (id) {
    case SubscriptionType.Supporter:
      return 'FAN';
    case SubscriptionType.Premium:
      return 'PRO';
  }
}

export function mapFeatureName(k: LockedFeatures) {
  switch (k) {
    case LockedFeatures.MultiAccount:
      return 'Multi account support';
    case LockedFeatures.NostrAddress:
      return 'Snort nostr address';
    case LockedFeatures.Badge:
      return 'Supporter Badge';
    case LockedFeatures.DeepL:
      return 'DeepL translations';
    case LockedFeatures.RelayRetention:
      return 'Unlimited note retention on Snort relay';
    case LockedFeatures.RelayBackup:
      return 'Downloadable backups from Snort relay';
    case LockedFeatures.RelayAccess:
      return 'Write access to Snort relay, with 1 year of event retention';
    case LockedFeatures.LNProxy:
      return 'LN Address Proxy';
    case LockedFeatures.EmailBridge:
      return 'Email <> DM bridge for your Snort nostr address';
  }
}

export function mapSubscriptionErrorCode(c: SubscriptionError) {
  switch (c.code) {
    case SubscriptionErrorCode.InternalError:
      return 'Internal error: ' + c.message;
    case SubscriptionErrorCode.SubscriptionActive:
      return "Your subscription is still active, you can't renew yet";
    case SubscriptionErrorCode.Duplicate:
      return 'You already have a subscription of this type, please renew or pay';
    default:
      return c.message;
  }
}

export enum SubscriptionType {
  Supporter = 0,
  Premium = 1,
}

export enum LockedFeatures {
  MultiAccount = 1,
  NostrAddress = 2,
  Badge = 3,
  DeepL = 4,
  RelayRetention = 5,
  RelayBackup = 6,
  RelayAccess = 7,
  LNProxy = 8,
  EmailBridge = 9,
}

export const Plans = [
  {
    id: SubscriptionType.Supporter,
    name: 'Fan',
    price: 5_000,
    disabled: false,
    unlocks: [
      LockedFeatures.MultiAccount,
      LockedFeatures.NostrAddress,
      LockedFeatures.Badge,
      LockedFeatures.RelayAccess,
    ],
  },
  {
    id: SubscriptionType.Premium,
    name: 'Pro',
    price: 20_000,
    disabled: false,
    unlocks: [
      LockedFeatures.DeepL,
      LockedFeatures.RelayBackup,
      LockedFeatures.RelayRetention,
      LockedFeatures.LNProxy,
      LockedFeatures.EmailBridge,
    ],
  },
];

export interface SubscriptionEvent {
  id: string;
  type: SubscriptionType;
  start: number;
  end: number;
}

export function getActiveSubscriptions(s: Array<SubscriptionEvent>) {
  const now = unixNow();
  return [...s].sort((a, b) => b.type - a.type).filter((a) => a.start <= now && a.end > now);
}

export function getCurrentSubscription(s: Array<SubscriptionEvent>) {
  return getActiveSubscriptions(s).at(0);
}

export function mostRecentSubscription(s: Array<SubscriptionEvent>) {
  return [...s].sort((a, b) => (b.start > a.start ? -1 : 1)).at(0);
}

export function throwIfOffline() {
  if (isOffline()) {
    throw new OfflineError('Offline');
  }
}

export function isOffline() {
  return !('navigator' in globalThis && globalThis.navigator.onLine);
}

export function unwrap<T>(v: T | undefined | null): T {
  if (v === undefined || v === null) {
    throw new Error('missing value');
  }
  return v;
}

export function unixNowMs() {
  return new Date().getTime();
}

export function unixNow() {
  return Math.floor(unixNowMs() / 1000);
}
