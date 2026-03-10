import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSubscription, PremiumFeature } from '@/hooks/useSubscription';

interface FeatureGateProps {
  feature: PremiumFeature;
  children: React.ReactNode;
  // Optional custom fallback UI when feature is locked
  fallback?: React.ReactNode;
}

/**
 * Wraps premium content. Renders children if the user has access,
 * otherwise shows an upgrade prompt (or a custom fallback).
 *
 * Usage:
 * ```tsx
 * <FeatureGate feature="journal">
 *   <JournalEditor />
 * </FeatureGate>
 * ```
 */
export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { canAccess, daysRemaining, isExpired } = useSubscription();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>
        {isExpired ? 'Trial Expired' : 'Premium Feature'}
      </Text>
      <Text style={styles.description}>
        {isExpired
          ? 'Your free trial has ended. Upgrade to keep using this feature.'
          : 'This feature requires an active subscription.'}
      </Text>
      <Pressable
        onPress={() => router.push('/(auth)/trial-upgrade')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Upgrade Now</Text>
      </Pressable>
    </View>
  );
}

/**
 * Hook-based gate for programmatic checks in event handlers / effects.
 *
 * Usage:
 * ```tsx
 * const { guardFeature } = useFeatureGate();
 * const handlePress = () => {
 *   if (!guardFeature('chat')) return; // redirects to upgrade
 *   // proceed with chat...
 * };
 * ```
 */
export function useFeatureGate() {
  const { canAccess } = useSubscription();

  const guardFeature = (feature: PremiumFeature): boolean => {
    if (canAccess(feature)) return true;
    router.push('/(auth)/trial-upgrade');
    return false;
  };

  return { guardFeature };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F6F4F2',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6a5e55',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#6a5e55',
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#828a6a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 16,
  },
});
