import { create } from 'zustand';
import { MindfulEntry, MindfulEntryInsert } from '@/lib/types';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MindfulnessState {
  mindfulnessHistory: MindfulEntry[];
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface MindfulnessActions {
  initialize: () => void;
  cleanup: () => void;
  fetchMindfulnessHistory: () => Promise<void>;
  addMindfulMinutes: (input: Omit<MindfulEntryInsert, 'user_id'>) => Promise<MindfulEntry>;
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
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      console.error('[Mindfulness Store] Cannot initialize: No user session');
      return;
    }

    const channel = supabase
      .channel('mindfulness-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mindfulness',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            set((state) => ({
              mindfulnessHistory: [newRecord as MindfulEntry, ...state.mindfulnessHistory],
            }));
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              mindfulnessHistory: state.mindfulnessHistory.map((item) =>
                item.id === newRecord.id ? (newRecord as MindfulEntry) : item,
              ),
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              mindfulnessHistory: state.mindfulnessHistory.filter(
                (item) => item.id !== oldRecord.id,
              ),
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

  fetchMindfulnessHistory: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchMindfulnessHistory');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('No user session');

      const { data, error } = await supabase
        .from('mindfulness')
        .select('*')
        .eq('user_id', userId)
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
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('No user session');

    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: MindfulEntry = {
      id: tempId,
      ...input,
      user_id: userId,
    } as MindfulEntry;

    set((state) => ({ mindfulnessHistory: [optimisticEntry, ...state.mindfulnessHistory] }));

    try {
      const { data: result, error } = await supabase
        .from('mindfulness')
        .insert({ ...input, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        mindfulnessHistory: state.mindfulnessHistory.map((item) =>
          item.id === tempId ? (result as MindfulEntry) : item,
        ),
      }));

      return result as MindfulEntry;
    } catch (err) {
      set((state) => ({
        mindfulnessHistory: state.mindfulnessHistory.filter((item) => item.id !== tempId),
        error: (err as Error).message,
      }));
      throw err;
    }
  },

  clearMindfulness: () => {
    const { cleanup } = get();
    cleanup();
    set({ mindfulnessHistory: [], error: null });
  },
});

export const useMindfulnessStore = create<MindfulnessStore>()((set, get, api) => ({
  ...createMindfulnessSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
