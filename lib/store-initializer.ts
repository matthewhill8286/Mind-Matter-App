/**
 * Centralized Store Initialization
 *
 * This module provides utilities to initialize and cleanup all Zustand stores
 * that use Supabase realtime subscriptions.
 *
 * Call initializeAllStores() after  * the user signs in
Call cleanupAllStores() before the user signs out
 */

import { useMoodStore } from '@/store/useMoodStore';
import { useJournalStore } from '@/store/useJournalStore';
import { useSleepStore } from '@/store/useSleepStore';
import { useMindfulnessStore } from '@/store/useMindfulnessStore';
import { useChatStore } from '@/store/useChatStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useStressStore } from '@/store/useStressStore';
import { useStressHistoryStore } from '@/store/useStressHistoryStore';
import { setupNetworkListener, processQueue } from './offline-queue';

let networkListenerUnsubscribe: (() => void) | null = null;

/**
 * Initialize all stores with Supabase realtime subscriptions
 * Call this after successful authentication
 */
export function initializeAllStores() {
  try {
    console.log('[Store Initializer] Initializing all stores...');

    // Initialize all stores
    useMoodStore.getState().initialize();
    useJournalStore.getState().initialize();
    useSleepStore.getState().initialize();
    useMindfulnessStore.getState().initialize();
    useChatStore.getState().initialize();
    useProfileStore.getState().initialize();
    useStressStore.getState().initialize();
    useStressHistoryStore.getState().initialize();

    // Setup network listener for offline queue
    if (!networkListenerUnsubscribe) {
      networkListenerUnsubscribe = setupNetworkListener();
      console.log('[Store Initializer] Network listener setup');
    }

    // Process any pending offline operations
    processQueue();

    console.log('[Store Initializer] All stores initialized successfully');
  } catch (error) {
    console.error('[Store Initializer] Error initializing stores:', error);
    throw error;
  }
}

/**
 * Cleanup all store realtime subscriptions
 * Call this before sign out (though signOut in useAuthStore already calls clear on each store)
 */
export function cleanupAllStores() {
  try {
    console.log('[Store Initializer] Cleaning up all stores...');

    // Cleanup all stores
    useMoodStore.getState().cleanup();
    useJournalStore.getState().cleanup();
    useSleepStore.getState().cleanup();
    useMindfulnessStore.getState().cleanup();
    useChatStore.getState().cleanup();
    useProfileStore.getState().cleanup();
    useStressStore.getState().cleanup();
    useStressHistoryStore.getState().cleanup();

    // Cleanup network listener
    if (networkListenerUnsubscribe) {
      networkListenerUnsubscribe();
      networkListenerUnsubscribe = null;
      console.log('[Store Initializer] Network listener cleaned up');
    }

    console.log('[Store Initializer] All stores cleaned up successfully');
  } catch (error) {
    console.error('[Store Initializer] Error cleaning up stores:', error);
  }
}

/**
 * Fetch initial data for all stores
 * Call this after initializing realtime subscriptions to populate stores
 */
export async function fetchAllStoreData() {
  try {
    console.log('[Store Initializer] Fetching data for all stores...');

    // Fetch data for all stores in parallel
    await Promise.allSettled([
      useMoodStore.getState().fetchMoodCheckIns(),
      useJournalStore.getState().fetchJournalEntries(),
      useSleepStore.getState().fetchSleepEntries(),
      useMindfulnessStore.getState().fetchMindfulnessHistory(),
      useChatStore.getState().fetchAllHistories(),
      useProfileStore.getState().fetchProfile(),
      useProfileStore.getState().fetchAssessment(),
      useStressStore.getState().fetchStressKit(),
      useStressHistoryStore.getState().fetchStressHistory(),
    ]);

    console.log('[Store Initializer] All store data fetched');
  } catch (error) {
    console.error('[Store Initializer] Error fetching store data:', error);
  }
}
