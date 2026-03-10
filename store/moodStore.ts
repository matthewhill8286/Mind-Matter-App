import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodCheckIn, MoodCheckInInsert } from '@/lib/types';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/lib/supabase';
import { authStore } from '@/store/authStore';

function getUserIdOrThrow(): string {
  const { user } = authStore.getState();
  if (!user) throw new Error('No user session found. Please sign in again.');
  return user.id;
}

interface MoodState {
  moodCheckIns: MoodCheckIn[];
  error: string | null;
}

interface MoodActions {
  fetchMoodCheckIns: () => Promise<void>;
  addMoodCheckIn: (input: MoodCheckInInsert) => Promise<MoodCheckIn>;
  deleteMoodCheckIn: (id: string) => Promise<void>;
  clearMood: () => void;
}

type MoodStore = MoodState & MoodActions & LoadingState;

const createMoodSlice: SliceCreator<MoodState & MoodActions, LoadingState> = (set, get, api) => ({
  moodCheckIns: [],
  error: null,

  fetchMoodCheckIns: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchMoodCheckIns');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });

      if (error) throw error;

      console.log('data from mood_logs supabase:', data);

      const items = (data ?? []).map((item: any) => ({
        ...item,
      }));
      set({ moodCheckIns: items });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchMoodCheckIns');
    }
  },

  addMoodCheckIn: async (input) => {
    const { id: _id, logged_at: _logged_at, ...body } = input;
    const userId = getUserIdOrThrow();
    const { data: result, error } = await supabase
      .from('mood_logs')
      .upsert({ ...body, user_id: userId }, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

    const item = {
      ...result,
    } as MoodCheckIn;

    set((state) => ({ moodCheckIns: [item, ...state.moodCheckIns] }));
    return item;
  },

  deleteMoodCheckIn: async (id) => {
    try {
      const userId = getUserIdOrThrow();
      const { error } = await supabase
        .from('mood_logs')
        .delete()
        .eq('user_id', userId)
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        moodCheckIns: state.moodCheckIns.filter((i) => i.id !== id),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearMood: () => set({ moodCheckIns: [] }),
});

export const moodStore = create<MoodStore>()(
  persist(
    (set, get, api) => ({
      ...createMoodSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'mood-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        moodCheckIns: state.moodCheckIns,
      }),
    },
  ),
);
