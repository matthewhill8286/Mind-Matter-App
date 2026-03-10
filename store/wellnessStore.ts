// ============================================================
// MindSport — Wellness Store (Zustand)
// Handles: mood logs, journal entries, prompts, daily state.
// ============================================================

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type {
  MoodLog,
  MoodLogInsert,
  JournalEntry,
  JournalEntryInsert,
  JournalPrompt,
} from '@/types/alias';

// ── Types ────────────────────────────────────────────────────

type TimeWindow = '7d' | '30d' | '90d';

interface WellnessState {
  // state — mood
  todayLog: MoodLog | null;
  recentLogs: MoodLog[];
  timeWindow: TimeWindow;

  // state — journal
  journalEntries: JournalEntry[];
  prompts: JournalPrompt[];

  // state — ui
  loading: boolean;
  error: string | null;

  // actions — mood
  logMood: (entry: MoodLogInsert) => Promise<MoodLog | null>;
  fetchTodayLog: () => Promise<void>;
  fetchMoodLogs: (window?: TimeWindow) => Promise<void>;
  setTimeWindow: (window: TimeWindow) => void;

  // actions — journal
  createJournalEntry: (entry: JournalEntryInsert) => Promise<JournalEntry | null>;
  fetchJournalEntries: (limit?: number) => Promise<void>;
  fetchPrompts: (sportId?: string | null) => Promise<void>;

  // actions — computed
  hasCheckedInToday: () => boolean;
  streak: () => number;

  // helpers
  clearError: () => void;
  reset: () => void;
}

// ── Helpers ──────────────────────────────────────────────────

const startOfDay = (date: Date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const windowToDays: Record<TimeWindow, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

// ── Store ────────────────────────────────────────────────────

export const useWellnessStore = create<WellnessState>((set, get) => ({
  todayLog: null,
  recentLogs: [],
  timeWindow: '7d',
  journalEntries: [],
  prompts: [],
  loading: false,
  error: null,

  // ─── Log Mood ───────────────────────────────────────────
  // Inserts a new mood_log row. The user_id is automatically
  // set by Supabase via the authenticated JWT (RLS policy).

  logMood: async (entry) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ error: 'Not authenticated' });
      return null;
    }

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ ...entry, user_id: user.id })
      .select()
      .single();

    if (error) {
      set({ loading: false, error: `Mood log failed: ${error.message}` });
      return null;
    }

    const log = data as MoodLog;

    // Update local state — add to recent, set as today
    set((state) => ({
      todayLog: log,
      recentLogs: [log, ...state.recentLogs],
      loading: false,
    }));

    return log;
  },

  // ─── Fetch Today's Log ──────────────────────────────────

  fetchTodayLog: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startOfDay())
      .order('logged_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    set({ todayLog: (data as MoodLog) ?? null });
  },

  // ─── Fetch Mood Logs (for charts) ───────────────────────

  fetchMoodLogs: async (window) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const w = window ?? get().timeWindow;
    const since = daysAgo(windowToDays[w]);

    set({ loading: true });

    const { data, error } = await supabase
      .from('mood_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', since)
      .order('logged_at', { ascending: true });

    if (error) {
      set({ loading: false, error: `Fetch mood logs failed: ${error.message}` });
      return;
    }

    set({ recentLogs: (data ?? []) as MoodLog[], loading: false });
  },

  setTimeWindow: (window) => {
    set({ timeWindow: window });
    get().fetchMoodLogs(window);
  },

  // ─── Create Journal Entry ──────────────────────────────

  createJournalEntry: async (entry) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      set({ error: 'Not authenticated' });
      return null;
    }

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ ...entry, user_id: user.id })
      .select()
      .single();

    if (error) {
      set({ loading: false, error: `Journal entry failed: ${error.message}` });
      return null;
    }

    const journalEntry = data as JournalEntry;

    set((state) => ({
      journalEntries: [journalEntry, ...state.journalEntries],
      loading: false,
    }));

    return journalEntry;
  },

  // ─── Fetch Journal Entries ──────────────────────────────

  fetchJournalEntries: async (limit = 20) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    set({ loading: true });

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      set({ loading: false, error: `Fetch journal entries failed: ${error.message}` });
      return;
    }

    set({ journalEntries: (data ?? []) as JournalEntry[], loading: false });
  },

  // ─── Fetch Prompts ──────────────────────────────────────
  // Returns universal prompts (sport_id IS NULL) plus any
  // prompts matching the user's sport.

  fetchPrompts: async (sportId) => {
    let query = supabase.from('journal_prompts').select('*');

    if (sportId) {
      // Universal OR sport-specific
      query = query.or(`sport_id.is.null,sport_id.eq.${sportId}`);
    }

    const { data, error } = await query.order('created_at');

    if (error) {
      set({ error: `Fetch prompts failed: ${error.message}` });
      return;
    }

    set({ prompts: (data ?? []) as JournalPrompt[] });
  },

  // ─── Computed ───────────────────────────────────────────

  hasCheckedInToday: () => {
    return get().todayLog !== null;
  },

  streak: () => {
    const logs = get().recentLogs;
    if (logs.length === 0) return 0;

    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Walk backwards from today
    for (let i = 0; i <= 90; i++) {
      const target = new Date(today);
      target.setDate(target.getDate() - i);
      const targetStr = target.toISOString().slice(0, 10);

      const hasLog = logs.some((log) => log.logged_at.slice(0, 10) === targetStr);

      if (hasLog) {
        count++;
      } else if (i === 0) {
        // If today has no log yet, that's okay — check yesterday
        continue;
      } else {
        break;
      }
    }

    return count;
  },

  // ─── Helpers ────────────────────────────────────────────

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      todayLog: null,
      recentLogs: [],
      timeWindow: '7d',
      journalEntries: [],
      prompts: [],
      loading: false,
      error: null,
    }),
}));
