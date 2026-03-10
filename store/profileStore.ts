import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  Assessment,
  AssessmentInsert,
} from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { authStore } from '@/store/authStore';
import { createLoadingSlice, LoadingState, SliceCreator } from '@/lib/zustand-helpers';

function getUserIdOrThrow(): string {
  const { user } = authStore.getState();
  if (!user) throw new Error('No user session found. Please sign in again.');
  return user.id;
}

interface ProfileState {
  profile: UserProfile | null;
  assessment: Assessment | null;
  error: string | null;
}

interface ProfileActions {
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

  fetchProfile: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchProfile');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data: supabaseProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) set({ error: (error as Error).message });

      if (supabaseProfile) {
        set({ profile: supabaseProfile as UserProfile });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchProfile');
    }
  },

  saveProfile: async (profile: UserProfileInsert) => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('saveProfile');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data: result, error } = await supabase
        .from('profiles')
        .upsert({ ...profile, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) set({ error: (error as Error).message });

      if (result) {
        set({ profile: result as UserProfile });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('saveProfile');
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('updateProfile');
    set({ error: null });
    try {
      const currentProfile = get().profile || ({} as UserProfile);
      const merged = { ...currentProfile, ...updates, updated_at: new Date().toISOString() };

      const userId = getUserIdOrThrow();
      const { data: result, error } = await supabase
        .from('profiles')
        .upsert({ ...merged, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

      if (result) {
        set({ profile: result as UserProfile });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('updateProfile');
    }
  },

  fetchAssessment: async () => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('fetchAssessment');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data: supabaseAssessment, error: supabaseError } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (supabaseError) throw supabaseError;

      if (supabaseAssessment) {
        set({ assessment: supabaseAssessment });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('fetchAssessment');
    }
  },

  saveAssessment: async (assessment) => {
    const { startLoading, stopLoading } = api.getState();
    startLoading('saveAssessment');
    set({ error: null });
    try {
      const userId = getUserIdOrThrow();
      const { data: result, error } = await supabase
        .from('assessments')
        .upsert({ ...assessment, user_id: userId }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) throw new Error(typeof error === 'string' ? error : (error as any).message);

      if (result) {
        set({ assessment: result as Assessment });
      }
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      stopLoading('saveAssessment');
    }
  },

  clearProfile: () => set({ profile: null, assessment: null }),
});

export const profileStore = create<ProfileStore>()(
  persist(
    (set, get, api) => ({
      ...createProfileSlice(set, get, api),
      ...createLoadingSlice(set, get, api),
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        profile: state.profile,
        assessment: state.assessment,
      }),
    },
  ),
);
