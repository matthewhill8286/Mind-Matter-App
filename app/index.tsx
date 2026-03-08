import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { useProfileStore } from '@/store/useProfileStore';
import { useAuthStore } from '@/store/useAuthStore';

import { useMoodStore } from '@/store/useMoodStore';
import { useSleepStore } from '@/store/useSleepStore';
import { useJournalStore } from '@/store/useJournalStore';
import { useStressStore } from '@/store/useStressStore';
import { useChatStore } from '@/store/useChatStore';
import { useMindfulnessStore } from '@/store/useMindfulnessStore';

export default function Index() {
  useEffect(() => {
    (async () => {
      try {
        const onboardingSeen = await AsyncStorage.getItem('onboarding:seen:v1');
        if (!onboardingSeen) return router.replace('/(onboarding)/splash-loading');

        const { session } = useAuthStore.getState();
        if (!session) return router.replace('/(auth)/sign-in');

        // Use the store to fetch the latest profile and assessment
        const { profile, assessment, fetchProfile, fetchAssessment } = useProfileStore.getState();

        if (!profile) await fetchProfile();
        if (!assessment) await fetchAssessment();

        const latestProfile = useProfileStore.getState().profile;
        const latestAssessment = useProfileStore.getState().assessment;

        console.log('profile data:', latestProfile);
        console.log('assessment data:', latestAssessment);

        if (!latestProfile?.subscription_type) {
          return router.replace('/(auth)/trial-upgrade');
        }

        // Fetch other data in parallel
        await Promise.allSettled([
          useMoodStore.getState().fetchMoodCheckIns(),
          useSleepStore.getState().fetchSleepEntries(),
          useJournalStore.getState().fetchJournalEntries(),
          useStressStore.getState().fetchStressKit(),
          useChatStore.getState().fetchAllHistories(),
          useMindfulnessStore.getState().fetchMindfulnessHistory(),
        ]);

        // Check for missing data
        if (!latestAssessment) return router.replace('/(onboarding)/assessment');
        if (!latestProfile) return router.replace('/(onboarding)/profile-setup');

        // selectedIssues is now part of the profile in Supabase
        if (!latestProfile.selectedIssues || latestProfile.selectedIssues.length === 0) {
          return router.replace('/(onboarding)/suggested-categories');
        }

        return router.replace('/(tabs)/home');
      } catch (e) {
        console.error('Routing error:', e);
        // router.replace('/(auth)/sign-in');
      }
    })();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#6f6660',
      }}
    >
      <ActivityIndicator color="white" />
    </View>
  );
}
