import { create } from 'zustand';
import { StressCompletion, StressCompletionInsert } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface StressHistoryState {
  stressHistory: StressCompletion[];
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface StressHistoryActions {
  initialize: () => void;
  cleanup: () => void;
  fetchStressHistory: () => Promise<void>;
  addStressCompletion: (input: Omit<StressCompletionInsert, 'user_id'>) => Promise<StressCompletion>;
  clearStressHistory: () => void;
}

type StressHistoryStore = StressHistoryState & StressHistoryActions & LoadingState;

const createStressHistorySlice: SliceCreator<
  StressHistoryState & StressHistoryActions,
  LoadingState
> = (set, get, api) => ({
  stressHistory: [],
  error: null,
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;

    const channel = supabase
      .channel('stress-histories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stress_histories',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            set((state) => ({
              stressHistory: [newRecord as StressCompletion, ...state.stressHistory],
            }));
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              stressHistory: state.stressHistory.map((item) =>
                item.id === newRecord.id ? (newRecord as StressCompletion) : item,
              ),
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              stressHistory: state.stressHistory.filter((item) => item.id !== oldRecord.id),
            }));
          }
        },
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  cleanup: () => {
    const { realtimeChannel } = get();
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      set({ realtimeChannel: null });
    }
  },

  fetchStressHistory: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchStressHistory');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('No user session');
      const { data, error } = await supabase
        .from('stress_histories')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

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
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('No user session');

    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: StressCompletion = {
      id: tempId,
      ...input,
      user_id: userId,
    } as StressCompletion;

    set((state) => ({ stressHistory: [optimisticEntry, ...state.stressHistory] }));

    try {
      const { data: result, error } = await supabase
        .from('stress_histories')
        .insert({ ...input, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        stressHistory: state.stressHistory.map((item) =>
          item.id === tempId ? (result as StressCompletion) : item,
        ),
      }));

      return result as StressCompletion;
    } catch (err) {
      set((state) => ({
        stressHistory: state.stressHistory.filter((item) => item.id !== tempId),
        error: (err as Error).message,
      }));
      throw err;
    }
  },

  clearStressHistory: () => {
    const { cleanup } = get();
    cleanup();
    set({ stressHistory: [], error: null });
  },
});

export const useStressHistoryStore = create<StressHistoryStore>()((set, get, api) => ({
  ...createStressHistorySlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
