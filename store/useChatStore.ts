import { create } from 'zustand';
import { ChatMessage } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ChatState {
  // Map of issueKey to message history
  history: Record<string, ChatMessage[]>;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface ChatActions {
  initialize: () => void;
  cleanup: () => void;
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
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;

    const channel = supabase
      .channel('chat-histories-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_histories',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            set((state) => ({
              history: {
                ...state.history,
                [newRecord.issue_key]: newRecord.messages as unknown as ChatMessage[],
              },
            }));
          } else if (eventType === 'DELETE') {
            set((state) => {
              const { [oldRecord.issue_key]: _, ...rest } = state.history;
              return { history: rest };
            });
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

  fetchHistory: async (issueKey: string) => {
    const { startLoading, stopLoading } = api.getState();
    startLoading(`fetchHistory:${issueKey}`);
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('User not authenticated');
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
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('User not authenticated');
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
    const userId = useAuthStore.getState().user?.id;
    const { history } = get();
    const currentMessages = history[issueKey] || [];
    const updatedMessages = [...currentMessages, message];

    // Optimistic update
    set((state) => ({ history: { ...state.history, [issueKey]: updatedMessages } }));

    try {
      if (!userId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('chat_histories')
        .upsert(
          { user_id: userId, issue_key: issueKey, messages: updatedMessages as any },
          { onConflict: 'user_id,issue_key' },
        )
        .select()
        .single();

      if (error) throw error;
    } catch (err) {
      // Rollback on failure
      set((state) => ({
        history: { ...state.history, [issueKey]: currentMessages },
        error: (err as Error).message,
      }));
      throw err;
    }
  },

  clearHistory: async (issueKey: string) => {
    const previousHistory = get().history;

    set((state) => ({ history: { ...state.history, [issueKey]: [] } }));

    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('User not authenticated');
      const { error } = await supabase
        .from('chat_histories')
        .delete()
        .eq('user_id', userId)
        .eq('issue_key', issueKey);
      if (error) throw error;
    } catch (err) {
      set({ history: previousHistory, error: (err as Error).message });
      throw err;
    }
  },

  clearAllChat: () => {
    const { cleanup } = get();
    cleanup();
    set({ history: {}, error: null });
  },
});

export const useChatStore = create<ChatStore>()((set, get, api) => ({
  ...createChatSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
