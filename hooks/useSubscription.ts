import { useEffect } from 'react';
import { subscriptionStore, SubscriptionType } from '@/store/subscriptionStore';

// Features that require an active subscription
export type PremiumFeature =
  | 'chat'
  | 'journal'
  | 'mood_tracking'
  | 'sleep_tracking'
  | 'stress_kit'
  | 'mindfulness'
  | 'insights';

// Features available on the free/expired tier
const FREE_FEATURES: PremiumFeature[] = ['mood_tracking'];

export function useSubscription() {
  const { type, expiryDate, status, loading, initialize, refresh } = subscriptionStore();

  // Initialize realtime listener on first mount
  useEffect(() => {
    initialize();
    return () => subscriptionStore.getState().cleanup();
  }, [initialize]);

  const isExpired = status === 'expired';
  const isLifetime = type === 'lifetime';
  const isActive = status === 'active';
  const hasFullAccess = isActive;

  // Check if a specific feature is available
  const canAccess = (feature: PremiumFeature): boolean => {
    if (hasFullAccess) return true;
    return FREE_FEATURES.includes(feature);
  };

  // Days remaining on trial/monthly
  const daysRemaining = (() => {
    if (!expiryDate || type === 'lifetime') return null;
    const diff = new Date(expiryDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  return {
    type,
    expiryDate,
    status,
    loading,
    isExpired,
    isLifetime,
    isActive,
    hasFullAccess,
    canAccess,
    daysRemaining,
    refresh,
  };
}

// Non-hook version for use outside React components
export function getSubscriptionStatus() {
  const { type, expiryDate, status } = subscriptionStore.getState();
  const hasFullAccess = status === 'active';
  const canAccess = (feature: PremiumFeature): boolean => {
    if (hasFullAccess) return true;
    return FREE_FEATURES.includes(feature);
  };
  return { type, expiryDate, status, hasFullAccess, canAccess };
}
