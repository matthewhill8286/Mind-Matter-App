import { create } from 'zustand';
import {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  Assessment,
  AssessmentInsert,
} from '@/lib/types';
import { useAuthStore } from '@/store/useAuthStore';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';
import { supabase } from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ProfileState {
  profile: UserProfile | null;
  assessment: Assessment | null;
  error: string | null;
  realtimeChannel: RealtimeChannel | null;
}

interface ProfileActions {
  initialize: () => void;
  cleanup: () => void;
  fetchProfile: () => Promise<void>;
  saveProfile: (profile: UserProfileInsert) => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  fetchAssessment: () => Promise<void>;
  saveAssessment: (assessment: AssessmentInsert) => Promise<void>;
  clearProfile: () => void;
}

type ProfileStore = ProfileState & ProfileActions & LoadingState;

const createProfileSlice: SliceCreator<ProfileState & ProfileActions, LoadingState> = (
  set,
  get,
  api,
) => ({
  profile: null,
  assessment: null,
  error: null,
  realtimeChannel: null,

  initialize: () => {
    const userId = useAuthStore.getState().user?.id;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            set({ profile: newRecord as UserProfile });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'assessments',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { eventType, new: newRecord } = payload;
          if (eventType === 'INSERT' || eventType === 'UPDATE') {
            set({ assessment: newRecord as Assessment });
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

  fetchProfile: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchProfile');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ profile: data as UserProfile });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchProfile');
    }
  },

  saveProfile: async (profile: UserProfileInsert) => {
    const userId = useAuthStore.getState().user?.id;
    const { startLoading, stopLoading } = api.getState();
    startLoading('saveProfile');
    set({ error: null });

    const previousProfile = get().profile;

    // Optimistic update
    set({ profile: { ...profile, user_id: userId } as UserProfile });

    try {
      const { data: result, error } = await supabase
        .from('profiles')
        .upsert({ ...profile, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      set({ profile: result as UserProfile });
    } catch (err) {
      set({ profile: previousProfile, error: (err as Error).message });
      throw err;
    } finally {
      stopLoading('saveProfile');
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const userId = useAuthStore.getState().user?.id;
    const { startLoading, stopLoading } = api.getState();
    startLoading('updateProfile');
    set({ error: null });

    const previousProfile = get().profile;
    const currentProfile = get().profile || ({} as UserProfile);
    const merged = { ...currentProfile, ...updates, updated_at: new Date().toISOString() };

    // Optimistic update
    set({ profile: merged });

    try {
      const { data: result, error } = await supabase
        .from('profiles')
        .upsert({ ...merged, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      set({ profile: result as UserProfile });
    } catch (err) {
      set({ profile: previousProfile, error: (err as Error).message });
      throw err;
    } finally {
      stopLoading('updateProfile');
    }
  },

  fetchAssessment: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchAssessment');
    set({ error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ assessment: data as Assessment });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchAssessment');
    }
  },

  saveAssessment: async (assessment) => {
    const userId = useAuthStore.getState().user?.id;
    const { startLoading, stopLoading } = api.getState();
    startLoading('saveAssessment');
    set({ error: null });

    const previousAssessment = get().assessment;

    // Optimistic update
    set({ assessment: { ...assessment, user_id: userId } as Assessment });

    try {
      const { data: result, error } = await supabase
        .from('assessments')
        .upsert({ ...assessment, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw error;

      set({ assessment: result as Assessment });
    } catch (err) {
      set({ assessment: previousAssessment, error: (err as Error).message });
      throw err;
    } finally {
      stopLoading('saveAssessment');
    }
  },

  clearProfile: () => {
    const { cleanup } = get();
    cleanup();
    set({ profile: null, assessment: null, error: null });
  },
});

export const useProfileStore = create<ProfileStore>()((set, get, api) => ({
  ...createProfileSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
}));
