import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { authStore } from '@/store/authStore';
import { useSubscription } from '@/hooks/useSubscription';

export default function UpgradeRequired() {
  const { daysRemaining, isExpired } = useSubscription();

  async function handleSignOut() {
    await authStore.getState().signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, justifyContent: 'center' }}>
      <View
        style={{ backgroundColor: 'white', borderRadius: 28, padding: 26, alignItems: 'center' }}
      >
        <Text style={{ fontSize: 24, fontWeight: '900', color: '#6a5e55', textAlign: 'center' }}>
          Trial Expired
        </Text>
        <Text style={{ opacity: 0.7, marginTop: 12, textAlign: 'center', lineHeight: 22 }}>
          Your 7-day free trial has come to an end. To continue using MindMatters and access your
          data, please upgrade to a paid plan.
        </Text>

        <Pressable
          onPress={() => router.replace('/(auth)/trial-upgrade')}
          style={{
            marginTop: 30,
            backgroundColor: '#828a6a',
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 18,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>Upgrade Now</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/(tabs)/home')} style={{ marginTop: 16 }}>
          <Text style={{ color: '#6a5e55', fontWeight: '800', opacity: 0.8 }}>
            Continue with limited features
          </Text>
        </Pressable>

        <Pressable onPress={handleSignOut} style={{ marginTop: 20 }}>
          <Text style={{ color: '#6a5e55', fontWeight: '800', opacity: 0.6 }}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}
