import { create } from 'zustand';
import { SleepEntry, SleepEntryInsert } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface SleepModeState {
  sleepModeStartISO: string | null;
  suggestedWakeISO: string | null;
  autoDetectionEnabled: boolean;
}

interface SleepState {
  sleepEntries: SleepEntry[];
  sleepMode: SleepModeState;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface SleepActions {
  initialize: () => void;
  cleanup: () => void;
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
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;

    const channel = supabase
      .channel('sleep-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleep',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            set((state) => ({
              sleepEntries: [newRecord as SleepEntry, ...state.sleepEntries],
            }));
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              sleepEntries: state.sleepEntries.map((item) =>
                item.id === newRecord.id ? (newRecord as SleepEntry) : item,
              ),
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              sleepEntries: state.sleepEntries.filter((item) => item.id !== oldRecord.id),
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

  fetchSleepEntries: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchSleepEntries');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id ?? '';
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
    const userId = useAuthStore.getState().user?.id ?? '';
    const { id: _id, created_at: _created_atISO, ...body } = input;

    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: SleepEntry = {
      id: tempId,
      ...body,
      user_id: userId,
      created_at: new Date().toISOString(),
    } as SleepEntry;

    set((state) => ({ sleepEntries: [optimisticEntry, ...state.sleepEntries] }));

    try {
      const { data: result, error } = await supabase
        .from('sleep')
        .insert({ ...body, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        sleepEntries: state.sleepEntries.map((item) =>
          item.id === tempId ? (result as SleepEntry) : item,
        ),
      }));

      return result as SleepEntry;
    } catch (err) {
      set((state) => ({
        sleepEntries: state.sleepEntries.filter((item) => item.id !== tempId),
        error: (err as Error).message,
      }));
      throw err;
    }
  },

  deleteSleepEntry: async (id) => {
    const previousEntries = get().sleepEntries;

    set((state) => ({
      sleepEntries: state.sleepEntries.filter((i) => i.id !== id),
    }));

    try {
      const userId = useAuthStore.getState().user?.id ?? '';
      const { error } = await supabase.from('sleep').delete().eq('user_id', userId).eq('id', id);
      if (error) throw error;
    } catch (err) {
      set({ sleepEntries: previousEntries, error: (err as Error).message });
      throw err;
    }
  },

  setSleepMode: (mode) => set((state) => ({ sleepMode: { ...state.sleepMode, ...mode } })),

  clearSleep: () => {
    const { cleanup } = get();
    cleanup();
    set({
      sleepEntries: [],
      sleepMode: {
        sleepModeStartISO: null,
        suggestedWakeISO: null,
        autoDetectionEnabled: false,
      },
      error: null,
    });
  },
});

export const useSleepStore = create<SleepStore>()((set, get, api) => ({
  ...createSleepSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
