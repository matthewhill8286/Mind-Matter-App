import { Stack, useRouter, useSegments } from 'expo-router';
import { AlertModal } from '@/components/AlertModal';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useSleepDetection } from '@/hooks/useSleepDetection';

import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/lib/notifications';
import { useAuthStore } from '@/store/useAuthStore';
import './../i18n';
import { SupabaseProvider } from '@/providers/supabase-provider';

export default function RootLayout() {
  const notificationListener = useRef<Notifications.Subscription>(null);
  const responseListener = useRef<Notifications.Subscription>(null);
  const { user, loading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user) {
      // If not logged in, only allow access to (auth), (onboarding) splash/welcome, or the index root.
      // Most of (onboarding) requires a user (profile setup, assessment).

      const isSplash = segments[1] === 'splash-loading';
      const isWelcome = segments[1] === 'welcome';

      // Special case: if we are in (onboarding) but NOT splash or welcome, and NOT logged in, we must redirect.
      // However, index.tsx handles the very first entry.
      // If the user is at /profile-setup and they logout (somehow) or session expires, they should go to sign-in.
      if (!inAuthGroup && !isSplash && !isWelcome && segments.length > 0) {
        // router.replace('/(auth)/sign-in');
      }
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated but in auth screens
      router.replace('/(tabs)/home');
    }
  }, [user, segments, loading, router]);

  useEffect(() => {
    (async () => await registerForPushNotificationsAsync())();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });
  }, []);

  useSleepDetection();

  return (
    <SupabaseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="resources" />
        <Stack.Screen name="(utils)" />
      </Stack>
      <AlertModal />
      <LoadingOverlay />
    </SupabaseProvider>
  );
}
