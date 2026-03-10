import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MindfulEntry, MindfulEntryInsert } from '@/lib/types';
import { syncToSupabase } from '@/lib/supabase-sync';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/lib/supabase';

interface MindfulnessState {
  mindfulnessHistory: MindfulEntry[];
  error: string | null;
}

interface MindfulnessActions {
  fetchMindfulnessHistory: () => Promise<void>;
  addMindfulMinutes: (input: MindfulEntryInsert) => Promise<MindfulEntry>;
  clearMindfulness: () => void;
}

type MindfulnessStore = MindfulnessState & MindfulnessActions & LoadingState;

const createMindfulnessSlice: SliceCreator<MindfulnessState & MindfulnessActions, LoadingState> = (
  set,
  get,
  api,
) => ({
  mindfulnessHistory: [],
  error: null,

  fetchMindfulnessHistory: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchMindfulnessHistory');
    set({ error: null });
    try {
      const { data, error } = await supabase
        .from('mindfulness')
        .select('*')
        .order('date_iso', { ascending: false });

      if (error) throw error;
      const items = (data || []).map((item: any) => ({
        ...item,
      }));
      set({ mindfulnessHistory: items });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchMindfulnessHistory');
    }
  },

  addMindfulMinutes: async (input) => {
    const { data: result, error } = await syncToSupabase('mindfulness', input, {
      matchColumn: 'id',
    });

    if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

    const item = {
      ...result,
    } as MindfulEntry;

    set((state) => ({ mindfulnessHistory: [item, ...state.mindfulnessHistory] }));
    return item;
  },

  clearMindfulness: () => set({ mindfulnessHistory: [] }),
});

export const useMindfulnessStore = create<MindfulnessStore>()(
  persist(
    (set, get, api) => ({
      ...createMindfulnessSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'mindfulness-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        mindfulnessHistory: state.mindfulnessHistory,
      }),
    },
  ),
);
