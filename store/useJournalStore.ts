import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, JournalEntryInsert } from '@/lib/types';
import { syncToSupabase, getUserIdOrThrow } from '@/lib/supabase-sync';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/lib/supabase';

interface JournalState {
  journalEntries: JournalEntry[];
  error: string | null;
}

interface JournalActions {
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

  fetchJournalEntries: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchJournalEntries');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
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
    const { id: _id, created_at: _created_at, updated_at: _updated_at, ...body } = input;
    const { data: result, error } = await syncToSupabase('journals', body, { matchColumn: 'id' });

    if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

    const entry = {
      ...result,
    } as JournalEntry;

    set((state) => ({ journalEntries: [entry, ...state.journalEntries] }));
    return entry;
  },

  upsertJournalEntry: async (entry) => {
    const { id, created_at: _c, updated_at: _u, ...body } = entry;
    const { data: result, error } = await syncToSupabase(
      'journals',
      { id, ...body },
      { matchColumn: 'id' },
    );

    if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

    const item = {
      ...result,
    } as JournalEntry;

    set((state) => {
      const idx = state.journalEntries.findIndex((e) => e.id === entry.id);
      if (idx >= 0) {
        const next = [...state.journalEntries];
        next[idx] = item;
        return { journalEntries: next };
      }
      return { journalEntries: [item, ...state.journalEntries] };
    });
    return item;
  },

  deleteJournalEntry: async (id) => {
    try {
      const userId = getUserIdOrThrow();
      const { error } = await supabase.from('journals').delete().eq('user_id', userId).eq('id', id);
      if (error) throw error;
      set((state) => ({
        journalEntries: state.journalEntries.filter((e) => e.id !== id),
      }));
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearJournal: () => set({ journalEntries: [] }),
});

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get, api) => ({
      ...createJournalSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        journalEntries: state.journalEntries,
      }),
    },
  ),
);
