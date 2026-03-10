import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StressCompletion, StressCompletionInsert } from '@/lib/types';
import { syncToSupabase, getUserIdOrThrow } from '@/lib/supabase-sync';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/lib/supabase';

interface StressHistoryState {
  stressHistory: StressCompletion[];
  error: string | null;
}

interface StressHistoryActions {
  fetchStressHistory: () => Promise<void>;
  addStressCompletion: (input: StressCompletionInsert) => Promise<StressCompletion>;
  clearStressHistory: () => void;
}

type StressHistoryStore = StressHistoryState & StressHistoryActions & LoadingState;

const createStressHistorySlice: SliceCreator<
  StressHistoryState & StressHistoryActions,
  LoadingState
> = (set, get, api) => ({
  stressHistory: [],
  error: null,

  fetchStressHistory: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchStressHistory');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data, error } = await supabase
        .from('stress_histories')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      console.log('data from stress_histories supabase:', data);

      if (error) throw error;

      const items = (data || []).map((item: any) => ({
        ...item,
      }));
      set({ stressHistory: items });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchStressHistory');
    }
  },

  addStressCompletion: async (input) => {
    const { data: result, error } = await syncToSupabase('stress_histories', input, {
      matchColumn: 'id',
    });

    if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

    const item = {
      ...result,
    } as StressCompletion;

    set((state) => ({ stressHistory: [item, ...state.stressHistory] }));
    return item;
  },

  clearStressHistory: () => set({ stressHistory: [] }),
});

export const useStressHistoryStore = create<StressHistoryStore>()(
  persist(
    (set, get, api) => ({
      ...createStressHistorySlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'stress-history-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stressHistory: state.stressHistory,
      }),
    },
  ),
);
