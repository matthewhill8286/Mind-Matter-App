import { Stack } from 'expo-router';
import { AlertModal } from '@/components/AlertModal';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useSleepDetection } from '@/hooks/useSleepDetection';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { initializeAllStores, fetchAllStoreData } from '@/lib/store-initializer';
import { SupabaseProvider } from '@/providers/supabase-provider';
import './../i18n';

export default function RootLayout() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize stores when user is authenticated
  useEffect(() => {
    if (user && !loading) {
      console.log('[Root Layout] User authenticated, initializing stores...');
      try {
        initializeAllStores();
        fetchAllStoreData();
      } catch (error) {
        console.error('[Root Layout] Failed to initialize stores:', error);
      }
    }
  }, [user, loading]);

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
