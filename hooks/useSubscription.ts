import { useProfileStore } from '@/store/useProfileStore';

export type Subscription = {
  type: 'trial' | 'monthly' | 'lifetime';
  expiryDate?: string | null;
};

export function useSubscription() {
  const profile = useProfileStore((state) => state.profile);

  const subscription: Subscription | null = profile?.subscription_type
    ? {
        type: profile.subscription_type as Subscription['type'],
        expiryDate: profile.subscription_expiry,
      }
    : null;

  const isExpired =
    subscription?.type === 'trial' &&
    subscription?.expiryDate != null &&
    new Date(subscription.expiryDate) < new Date();

  const isLifetime = subscription?.type === 'lifetime';

  // A user has full access if they are lifetime OR in an active trial
  const hasFullAccess = isLifetime || (subscription?.type === 'trial' && !isExpired);

  return {
    subscription,
    isExpired,
    isLifetime,
    hasFullAccess,
  };
}
