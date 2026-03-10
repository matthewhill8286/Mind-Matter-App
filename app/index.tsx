import { useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { profileStore } from '@/store/profileStore';
import { authStore } from '@/store/authStore';
import { subscriptionStore } from '@/store/subscriptionStore';

import { moodStore } from '@/store/moodStore';
import { sleepStore } from '@/store/sleepStore';
import { journalStore } from '@/store/journalStore';
import { stressStore } from '@/store/stressStore';
import { chatStore } from '@/store/chatStore';
import { mindfulnessStore } from '@/store/mindfulnessStore';

export default function Index() {
  useEffect(() => {
    (async () => {
      try {
        const onboardingSeen = await AsyncStorage.getItem('onboarding:seen:v1');
        if (!onboardingSeen) return router.replace('/(onboarding)/splash-loading');

        const { session } = authStore.getState();
        if (!session) return router.replace('/(auth)/sign-in');

        // Use the store to fetch the latest profile and assessment
        const { profile, assessment, fetchProfile, fetchAssessment } = profileStore.getState();

        if (!profile) await fetchProfile();
        if (!assessment) await fetchAssessment();

        const latestProfile = profileStore.getState().profile;
        const latestAssessment = profileStore.getState().assessment;

        console.log('profile data:', latestProfile);
        console.log('assessment data:', latestAssessment);

        // Initialize subscription store and check status
        await subscriptionStore.getState().initialize();
        const { status, type: subType } = subscriptionStore.getState();

        if (!subType) {
          return router.replace('/(auth)/trial-upgrade');
        }

        if (status === 'expired') {
          return router.replace('/(auth)/upgrade-required');
        }

        // Fetch other data in parallel
        await Promise.allSettled([
          moodStore.getState().fetchMoodCheckIns(),
          sleepStore.getState().fetchSleepEntries(),
          journalStore.getState().fetchJournalEntries(),
          stressStore.getState().fetchStressKit(),
          chatStore.getState().fetchAllHistories(),
          mindfulnessStore.getState().fetchMindfulnessHistory(),
        ]);

        // Check for missing data
        if (!latestAssessment) return router.replace('/(onboarding)/assessment');
        if (!latestProfile) return router.replace('/(onboarding)/profile-setup');

        // selected_issues is now part of the profile in Supabase
        if (
          !latestProfile.selected_issues ||
          Object.keys(latestProfile?.selected_issues).length === 0
        ) {
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
