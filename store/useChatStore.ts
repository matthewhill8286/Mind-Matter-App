import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, ChatHistory, ChatHistoryInsert } from '@/lib/types';
import { syncToSupabase, fetchFromSupabase, getUserIdOrThrow } from '@/lib/supabase-sync';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/lib/supabase';

interface ChatState {
  // Map of issueKey to message history
  history: Record<string, ChatMessage[]>;
  error: string | null;
}

interface ChatActions {
  fetchHistory: (issueKey: string) => Promise<void>;
  fetchAllHistories: () => Promise<void>;
  addMessage: (issueKey: string, message: ChatMessage) => Promise<void>;
  clearHistory: (issueKey: string) => Promise<void>;
  clearAllChat: () => void;
}

type ChatStore = ChatState & ChatActions & LoadingState;

// const CHAT_HISTORY_KEY = 'chat:history:v1';

const createChatSlice: SliceCreator<ChatState & ChatActions, LoadingState> = (set, get, api) => ({
  history: {},
  error: null,

  fetchHistory: async (issueKey: string) => {
    const { startLoading, stopLoading } = api.getState();
    startLoading(`fetchHistory:${issueKey}`);
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data, error } = await supabase
        .from('chat_histories')
        .select('*')
        .eq('user_id', userId)
        .eq('issue_key', issueKey)
        .maybeSingle();

      if (error) throw error;

      if (data && data.messages) {
        set((state) => ({
          history: { ...state.history, [issueKey]: data.messages as unknown as ChatMessage[] },
        }));
      } else {
        set((state) => ({ history: { ...state.history, [issueKey]: [] } }));
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading(`fetchHistory:${issueKey}`);
    }
  },

  fetchAllHistories: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchAllHistories');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data, error } = await supabase
        .from('chat_histories')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const allHistory: Record<string, ChatMessage[]> = {};
      (data || []).forEach((row) => {
        allHistory[row.issue_key] = row.messages as unknown as ChatMessage[];
      });

      set({ history: allHistory });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchAllHistories');
    }
  },

  addMessage: async (issueKey: string, message: ChatMessage) => {
    const { history } = get();
    const currentMessages = history[issueKey] || [];
    const updatedMessages = [...currentMessages, message];

    // Optimistic update
    set((state) => ({ history: { ...state.history, [issueKey]: updatedMessages } }));

    try {
      const { error } = await syncToSupabase(
        'chat_histories',
        { issue_key: issueKey, messages: updatedMessages as any },
        { matchColumn: 'issue_key', onConflict: 'user_id,issue_key' },
      );
      if (error) throw error;
    } catch (err) {
      // Rollback on failure
      console.error('Failed to update chat history in Supabase:', err);
      set((state) => ({ history: { ...state.history, [issueKey]: currentMessages } }));
    }
  },

  clearHistory: async (issueKey: string) => {
    set((state) => ({ history: { ...state.history, [issueKey]: [] } }));
    try {
      const userId = getUserIdOrThrow();
      const { error } = await supabase
        .from('chat_histories')
        .delete()
        .eq('user_id', userId)
        .eq('issue_key', issueKey);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to clear chat history in Supabase:', err);
    }
  },

  clearAllChat: () => set({ history: {} }),
});

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get, api) => ({
      ...createChatSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        history: state.history,
      }),
    },
  ),
);
