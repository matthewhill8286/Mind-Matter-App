import { create } from 'zustand';
import { JournalEntry, JournalEntryInsert } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface JournalState {
  journalEntries: JournalEntry[];
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface JournalActions {
  initialize: () => void;
  cleanup: () => void;
  fetchJournalEntries: () => Promise<void>;
  createJournalEntry: (input: JournalEntryInsert) => Promise<JournalEntry>;
  upsertJournalEntry: (entry: JournalEntry) => Promise<JournalEntry>;
  deleteJournalEntry: (id: string) => Promise<void>;
  clearJournal: () => void;
}

type JournalStore = JournalState & JournalActions & LoadingState;

const createJournalSlice: SliceCreator<JournalState & JournalActions, LoadingState> = (
  set,
  get,
  api,
) => ({
  journalEntries: [],
  error: null,
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;

    const channel = supabase
      .channel('journals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journals',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT') {
            set((state) => ({
              journalEntries: [newRecord as JournalEntry, ...state.journalEntries],
            }));
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              journalEntries: state.journalEntries.map((item) =>
                item.id === newRecord.id ? (newRecord as JournalEntry) : item
              ),
            }));
          } else if (eventType === 'DELETE') {
            set((state) => ({
              journalEntries: state.journalEntries.filter((item) => item.id !== oldRecord.id),
            }));
          }
        }
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

  fetchJournalEntries: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchJournalEntries');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const items = (data || []).map((item: any) => ({
        ...item,
        created_at: item.created_at || item.created_at,
      }));
      set({ journalEntries: items });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchJournalEntries');
    }
  },

  createJournalEntry: async (input) => {
    const userId = useAuthStore.getState().user?.id;
    const { id: _id, created_at: _created_at, updated_at: _updated_at, ...body } = input;

    const tempId = `temp-${Date.now()}`;
    const optimisticEntry: JournalEntry = {
      id: tempId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body,
    } as JournalEntry;

    set((state) => ({ journalEntries: [optimisticEntry, ...state.journalEntries] }));

    try {
      const { data: result, error } = await supabase
        .from('journals')
        .insert({ ...body, user_id: userId })
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        journalEntries: state.journalEntries.map((item) =>
          item.id === tempId ? (result as JournalEntry) : item
        ),
      }));

      return result as JournalEntry;
    } catch (err) {
      set((state) => ({
        journalEntries: state.journalEntries.filter((item) => item.id !== tempId),
        error: (err as Error).message,
      }));
      throw err;
    }
  },

  upsertJournalEntry: async (entry) => {
    const userId = useAuthStore.getState().user?.id;
    const { id, created_at: _c, updated_at: _u, ...body } = entry;
    const previousEntries = get().journalEntries;

    // Optimistic update
    const optimisticEntry: JournalEntry = {
      ...entry,
      updated_at: new Date().toISOString(),
    };

    set((state) => {
      const idx = state.journalEntries.findIndex((e) => e.id === entry.id);
      if (idx >= 0) {
        const next = [...state.journalEntries];
        next[idx] = optimisticEntry;
        return { journalEntries: next };
      }
      return { journalEntries: [optimisticEntry, ...state.journalEntries] };
    });

    try {
      const { data: result, error } = await supabase
        .from('journals')
        .upsert({ id, ...body, user_id: userId }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      set((state) => {
        const idx = state.journalEntries.findIndex((e) => e.id === entry.id);
        if (idx >= 0) {
          const next = [...state.journalEntries];
          next[idx] = result as JournalEntry;
          return { journalEntries: next };
        }
        return { journalEntries: [result as JournalEntry, ...state.journalEntries] };
      });

      return result as JournalEntry;
    } catch (err) {
      set({ journalEntries: previousEntries, error: (err as Error).message });
      throw err;
    }
  },

  deleteJournalEntry: async (id) => {
    const previousEntries = get().journalEntries;

    set((state) => ({
      journalEntries: state.journalEntries.filter((e) => e.id !== id),
    }));

    try {
      const userId = useAuthStore.getState().user?.id;
      const { error } = await supabase.from('journals').delete().eq('user_id', userId).eq('id', id);
      if (error) throw error;
    } catch (err) {
      set({ journalEntries: previousEntries, error: (err as Error).message });
      throw err;
    }
  },

  clearJournal: () => {
    const { cleanup } = get();
    cleanup();
    set({ journalEntries: [], error: null });
  },
});

export const useJournalStore = create<JournalStore>()((set, get, api) => ({
  ...createJournalSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
