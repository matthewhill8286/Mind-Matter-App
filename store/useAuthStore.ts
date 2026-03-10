import { create } from 'zustand';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean; // true during initial session hydration only
  submitting: boolean; // true during sign-in / sign-up / sign-out calls
  error: string | null;
}

interface AuthActions {
  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  signUpWithEmail: (email: string, password: string) => Promise<AuthError | null>;
  signInWithMagicLink: (email: string) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>((set) => ({
  // State
  user: null,
  session: null,
  loading: true,
  submitting: false,
  error: null,

  // ── initialize ─────────────────────────────────────────────────────────────
  // Call once at app boot (in the root layout). Hydrates the session from
  // AsyncStorage and subscribes to future auth state changes.
  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, loading: false });

    supabase.auth.onAuthStateChange((event, session) => {
      // Handle session expiration
      if (event === 'TOKEN_REFRESHED') {
        set({ session, user: session?.user ?? null });
      } else if (event === 'SIGNED_OUT' || !session) {
        set({ session: null, user: null, loading: false });
        router.replace('/(auth)/sign-in');
      } else {
        set({ session, user: session?.user ?? null, loading: false });
      }
    });
  },

  // ── signInWithEmail ─────────────────────────────────────────────────────────
  signInWithEmail: async (email, password) => {
    set({ submitting: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ submitting: false, error: error.message });
      return error;
    }
    set({ submitting: false });
    router.replace('/(tabs)/home');
    return null;
  },

  // ── signUpWithEmail ─────────────────────────────────────────────────────────
  signUpWithEmail: async (email, password) => {
    set({ submitting: true, error: null });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ submitting: false, error: error.message });
      return error;
    }
    // User needs to confirm email — stay on auth screen, show message upstream
    set({ submitting: false });
    return null;
  },

  // ── signInWithMagicLink ─────────────────────────────────────────────────────
  signInWithMagicLink: async (email) => {
    set({ submitting: true, error: null });
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    set({ submitting: false, error: error?.message ?? null });
    return error ?? null;
  },

  // ── signOut ─────────────────────────────────────────────────────────────────
  signOut: async () => {
    set({ submitting: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, submitting: false, error: null });
    router.replace('/(auth)/sign-in');
  },

  // ── clearError ──────────────────────────────────────────────────────────────
  clearError: () => set({ error: null }),
}));
