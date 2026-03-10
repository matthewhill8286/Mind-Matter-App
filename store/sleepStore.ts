import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry, SleepEntryInsert } from '@/lib/types';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/lib/supabase';
import { authStore } from '@/store/authStore';

function getUserIdOrThrow(): string {
  const { user } = authStore.getState();
  if (!user) throw new Error('No user session found. Please sign in again.');
  return user.id;
}

interface SleepModeState {
  sleepModeStartISO: string | null;
  suggestedWakeISO: string | null;
  autoDetectionEnabled: boolean;
}

interface SleepState {
  sleepEntries: SleepEntry[];
  sleepMode: SleepModeState;
  error: string | null;
}

interface SleepActions {
  fetchSleepEntries: () => Promise<void>;
  addSleepEntry: (input: SleepEntryInsert) => Promise<SleepEntry>;
  deleteSleepEntry: (id: string) => Promise<void>;
  setSleepMode: (mode: Partial<SleepModeState>) => void;
  clearSleep: () => void;
}

type SleepStore = SleepState & SleepActions & LoadingState;

const createSleepSlice: SliceCreator<SleepState & SleepActions, LoadingState> = (
  set,
  get,
  api,
) => ({
  sleepEntries: [],
  sleepMode: {
    sleepModeStartISO: null,
    suggestedWakeISO: null,
    autoDetectionEnabled: false,
  },
  error: null,

  fetchSleepEntries: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchSleepEntries');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data, error } = await supabase
        .from('sleep')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const items = (data || []).map((item: any) => ({
        ...item,
      }));
      set({ sleepEntries: items });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchSleepEntries');
    }
  },

  addSleepEntry: async (input) => {
    const { id: _id, created_at: _created_atISO, ...body } = input;
    const userId = getUserIdOrThrow();
    const { data: result, error } = await supabase
      .from('sleep')
      .upsert({ ...body, user_id: userId }, { onConflict: 'id' })
      .select()
      .single();

    console.log('error type', { error });
    console.log('error message', {
      error: typeof error === 'string' ? error : (error as any).message,
    });
    console.log('data is this', { result });

    if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

    const item = {
      ...result,
    } as SleepEntry;

    set((state) => ({ sleepEntries: [item, ...state.sleepEntries] }));
    return item;
  },

  deleteSleepEntry: async (id) => {
    try {
      const userId = getUserIdOrThrow();
      const { error } = await supabase.from('sleep').delete().eq('user_id', userId).eq('id', id);
      if (error) throw error;
      set((state) => ({
        sleepEntries: state.sleepEntries.filter((i) => i.id !== id),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  setSleepMode: (mode) => set((state) => ({ sleepMode: { ...state.sleepMode, ...mode } })),

  clearSleep: () =>
    set({
      sleepEntries: [],
      sleepMode: {
        sleepModeStartISO: null,
        suggestedWakeISO: null,
        autoDetectionEnabled: false,
      },
    }),
});

export const sleepStore = create<SleepStore>()(
  persist(
    (set, get, api) => ({
      ...createSleepSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'sleep-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sleepEntries: state.sleepEntries,
        sleepMode: state.sleepMode,
      }),
    },
  ),
);
