import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useProfileStore } from '@/store/useProfileStore';
import ScoreCard from '@/components/ScoreCard';

export default function ProfileOverview() {
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    (async () => {
      await fetchProfile();
    })();
  }, []);

  const name = profile?.name;

  return (
    <View style={{ flex: 1, backgroundColor: '#6f6660', padding: 24, justifyContent: 'center' }}>
      <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 26 }}>
        <Text style={{ fontSize: 26, fontWeight: '900' }}>
          {name ? `Nice to meet you, ${name}` : 'Profile complete'}
        </Text>
        <Text style={{ opacity: 0.7, marginTop: 8 }}>Here’s a snapshot of your profile.</Text>

        <ScoreCard
          score={87}
          title="Your Feel Score"
          subtitle="A gentle baseline of wellbeing today."
          bg="#6bbf8e"
        />
        <ScoreCard
          score={41}
          title="Stress Load"
          subtitle="A moderate stress signal—let’s keep it manageable."
          bg="#f2a65a"
        />
        <ScoreCard
          score={16}
          title="Fatigue Risk"
          subtitle="Low energy risk detected—prioritize rest when possible."
          bg="#9b8df1"
        />
      </View>

      <Pressable
        onPress={() => router.replace('/(onboarding)/suggested-categories')}
        style={{
          marginTop: 18,
          backgroundColor: '#a07b55',
          padding: 16,
          borderRadius: 18,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '900' }}>Continue</Text>
      </Pressable>
    </View>
  );
}
