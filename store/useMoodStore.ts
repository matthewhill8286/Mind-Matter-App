import { create } from 'zustand';
import { MoodCheckIn, MoodCheckInInsert } from '@/lib/types';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface MoodState {
  moodCheckIns: MoodCheckIn[];
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface MoodActions {
  initialize: () => void;
  cleanup: () => void;
  fetchMoodCheckIns: () => Promise<void>;
  addMoodCheckIn: (input: MoodCheckInInsert) => Promise<MoodCheckIn>;
  deleteMoodCheckIn: (id: string) => Promise<void>;
  clearMood: () => void;
}

type MoodStore = MoodState & MoodActions & LoadingState;

const createMoodSlice: SliceCreator<MoodState & MoodActions, LoadingState> = (set, get, api) => ({
  moodCheckIns: [],
  error: null,
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      console.error('[Mood Store] Cannot initialize: No user session');
      return;
    }

    // Setup realtime subscription
    const channel = supabase
      .channel('moods-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moods',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            set((state) => ({
              moodCheckIns: [newRecord as MoodCheckIn, ...state.moodCheckIns],
            }));
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              moodCheckIns: state.moodCheckIns.map((item) =>
                item.id === newRecord.id ? (newRecord as MoodCheckIn) : item,
              ),
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              moodCheckIns: state.moodCheckIns.filter((item) => item.id !== oldRecord.id),
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

  fetchMoodCheckIns: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchMoodCheckIns');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('No user session');

      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const items = (data ?? []).map((item: any) => ({
        ...item,
        created_at: item.created_at || item.created_at,
      }));
      set({ moodCheckIns: items });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchMoodCheckIns');
    }
  },

  addMoodCheckIn: async (input) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('No user session');

    const { id: _id, created_at: _created_at, ...body } = input;

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: MoodCheckIn = {
      id: tempId,
      ...body,
      user_id: userId,
      created_at: new Date().toISOString(),
    } as MoodCheckIn;

    set((state) => ({ moodCheckIns: [optimisticItem, ...state.moodCheckIns] }));

    try {
      const { data: result, error } = await supabase
        .from('moods')
        .insert({ ...body, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic with real data
      set((state) => ({
        moodCheckIns: state.moodCheckIns.map((item) =>
          item.id === tempId ? (result as MoodCheckIn) : item,
        ),
      }));

      return result as MoodCheckIn;
    } catch (err) {
      // Rollback optimistic update
      set((state) => ({
        moodCheckIns: state.moodCheckIns.filter((item) => item.id !== tempId),
        error: (err as Error).message,
      }));
      throw err;
    }
  },

  deleteMoodCheckIn: async (id) => {
    const previousItems = get().moodCheckIns;

    // Optimistic delete
    set((state) => ({
      moodCheckIns: state.moodCheckIns.filter((i) => i.id !== id),
    }));

    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('No user session');

      const { error } = await supabase.from('moods').delete().eq('user_id', userId).eq('id', id);
      if (error) throw error;
    } catch (err) {
      // Rollback on error
      set({ moodCheckIns: previousItems, error: (err as Error).message });
      throw err;
    }
  },

  clearMood: () => {
    const { cleanup } = get();
    cleanup();
    set({ moodCheckIns: [], error: null });
  },
});

export const useMoodStore = create<MoodStore>()((set, get, api) => ({
  ...createMoodSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
