import { create } from 'zustand';
import type { StressKit, StressKitInsert } from '@/lib/types';
import { DEFAULT_KIT } from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface StressState {
  stressKit: Partial<StressKit> | null;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface StressActions {
  initialize: () => void;
  cleanup: () => void;
  fetchStressKit: () => Promise<void>;
  saveStressKit: (kit: StressKitInsert) => Promise<void>;
  clearStress: () => void;
}

type StressStore = StressState & StressActions & LoadingState;

// const KIT_KEY = 'stress:kit:v1';

const createStressSlice: SliceCreator<StressState & StressActions, LoadingState> = (
  set,
  get,
  api,
) => ({
  stressKit: null,
  error: null,
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;

    const channel = supabase
      .channel('stress-kits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stress_kits',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            set({ stressKit: newRecord as StressKit });
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

  fetchStressKit: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchStressKit');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('stress_kits')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ stressKit: data as StressKit });
      } else {
        set({ stressKit: DEFAULT_KIT });
      }
    } catch (err) {
      set({ error: (err as Error).message, stressKit: DEFAULT_KIT });
    } finally {
      stopLoading('fetchStressKit');
    }
  },

  saveStressKit: async (kit: StressKitInsert) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('User not authenticated');
    const { startLoading, stopLoading } = api.getState();
    startLoading('saveStressKit');
    set({ error: null });

    const previousKit = get().stressKit;

    // Optimistic update
    set({ stressKit: { ...kit, user_id: userId } as StressKit });

    try {
      const { data: result, error } = await supabase
        .from('stress_kits')
        .upsert({ ...kit, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      set({ stressKit: result as StressKit });
    } catch (err) {
      set({ stressKit: previousKit, error: (err as Error).message });
      throw err;
    } finally {
      stopLoading('saveStressKit');
    }
  },

  clearStress: () => {
    const { cleanup } = get();
    cleanup();
    set({ stressKit: null, error: null });
  },
});

export const useStressStore = create<StressStore>()((set, get, api) => ({
  ...createStressSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
