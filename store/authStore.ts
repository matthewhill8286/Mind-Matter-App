// ============================================================
// MindSport — Auth Store (Zustand)
// Handles: session, user profile, login, signup, onboarding.
// ============================================================

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { UserProfile, UserProfileUpdate } from '@/types/alias';

// ── Types ────────────────────────────────────────────────────

interface AuthState {
  // state
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // actions — auth
  initialize: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;

  // actions — profile
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  completeOnboarding: (data: { name: string }) => Promise<void>;

  // helpers
  clearError: () => void;
}

// ── Subscription handle ──────────────────────────────────────
// Module-level, so it persists across renders and can be
// unsubscribed if the store is torn down (e.g. in tests).
let _authSubscription: { unsubscribe: () => void } | null = null;

// ── Store ────────────────────────────────────────────────────

export const authStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  sports: [],
  loading: true,
  error: null,

  // ─── Initialize ──────────────────────────────────────────
  // Call once on app mount. Restores session from AsyncStorage
  // and subscribes to auth state changes.

  initialize: async () => {
    try {
      // 1. Restore existing session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      set({ session, user: session?.user ?? null, loading: false });

      // 2. If logged in, fetch profile and sports in parallel
      if (session?.user) {
        await Promise.all([get().fetchProfile()]);
      }

      // 3. Listen for auth changes (login, logout, token refresh).
      // Capture the subscription so it can be cleaned up if needed.
      _authSubscription?.unsubscribe();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        set({ session, user: session?.user ?? null });

        if (event === 'SIGNED_IN' && session?.user) {
          await Promise.all([get().fetchProfile()]);
          set({ loading: false });
        }

        if (event === 'SIGNED_OUT') {
          set({ profile: null, loading: false });
        }
      });
      _authSubscription = subscription;
    } catch {
      set({ loading: false, error: 'Failed to initialize auth' });
    }
  },

  // ─── Sign Up ─────────────────────────────────────────────

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
    }
    // On success, keep loading=true — onAuthStateChange handles the rest.
    return { error };
  },

  // ─── Sign In ─────────────────────────────────────────────

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false, error: error.message });
    }
    // On success, keep loading=true — onAuthStateChange will fetch
    // profile + sports and then set loading=false so the route guard
    // waits until profile is available before navigating.
    return { error };
  },

  // ─── Sign Out ────────────────────────────────────────────

  signOut: async () => {
    set({ loading: true });
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null, loading: false });
  },

  // ─── Fetch Profile ──────────────────────────────────────

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (error) {
      set({ error: `Profile fetch failed: ${error.message}` });
      return;
    }

    set({ profile: data as UserProfile });
  },

  // ─── Update Profile ─────────────────────────────────────

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      set({ loading: false, error: `Profile update failed: ${error.message}` });
      return;
    }

    set({ profile: data as UserProfile, loading: false });
  },

  // ─── Complete Onboarding ────────────────────────────────
  // Sets name, sport, experience level, and marks onboarded_at.

  completeOnboarding: async ({ name }) => {
    await get().updateProfile({
      name,
    });
  },

  clearError: () => set({ error: null }),
}));
