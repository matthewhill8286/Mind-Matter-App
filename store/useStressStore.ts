import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StressKit, StressKitInsert } from '@/lib/types';
import { DEFAULT_KIT } from '@/lib/types';
import { syncToSupabase, fetchFromSupabase } from '@/lib/supabase-sync';

import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';

interface StressState {
  stressKit: StressKit | null;
  error: string | null;
}

interface StressActions {
  fetchStressKit: () => Promise<void>;
  saveStressKit: (kit: StressKitInsert) => Promise<void>;
  clearStress: () => void;
}

type StressStore = StressState & StressActions & LoadingState;

// const KIT_KEY = 'stress:kit:v1';

const createStressSlice: SliceCreator<StressState & StressActions, LoadingState> = (
  set,
  get,
  api,
) => ({
  stressKit: null,
  error: null,

  fetchStressKit: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchStressKit');
    set({ error: null });
    try {
      // Refresh from Supabase
      const { data: supabaseKit, error } = await fetchFromSupabase<any>('stress_kits', {
        matchColumn: 'user_id',
      });

      if (error) throw error;

      if (supabaseKit) {
        set({ stressKit: supabaseKit as StressKit });
      } else {
        // Fallback default if nothing found
        set((state) => ({ stressKit: state.stressKit || DEFAULT_KIT }));
      }
    } catch (err) {
      set({ error: (err as Error).message });
      // Fallback default if nothing cached
      set((state) => ({ stressKit: state.stressKit || DEFAULT_KIT }));
    } finally {
      stopLoading('fetchStressKit');
    }
  },

  saveStressKit: async (kit: StressKitInsert) => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('saveStressKit');
    set({ error: null });
    try {
      // Sync to Supabase
      const { data: result, error } = await syncToSupabase('stress_kits', kit, {
        matchColumn: 'user_id',
        onConflict: 'user_id',
      });

      if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

      if (result) {
        set({ stressKit: result as StressKit });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('saveStressKit');
    }
  },

  clearStress: () => set({ stressKit: null }),
});

export const useStressStore = create<StressStore>()(
  persist(
    (set, get, api) => ({
      ...createStressSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'stress-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ stressKit: state.stressKit }),
    },
  ),
);
