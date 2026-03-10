import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { authStore } from '@/store/authStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── Types ────────────────────────────────────────────────────

export type SubscriptionType = 'trial' | 'monthly' | 'lifetime';

export type SubscriptionStatus = 'active' | 'expired' | 'none';

interface SubscriptionState {
  type: SubscriptionType | null;
  expiryDate: string | null;
  status: SubscriptionStatus;
  loading: boolean;
  error: string | null;
}

interface SubscriptionActions {
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
  startTrial: () => Promise<void>;
  updateFromWebhook: (type: SubscriptionType, expiryDate: string | null) => Promise<void>;
  cleanup: () => void;
}

type SubscriptionStore = SubscriptionState & SubscriptionActions;

// ── Helpers ──────────────────────────────────────────────────

function computeStatus(
  type: SubscriptionType | null,
  expiryDate: string | null,
): SubscriptionStatus {
  if (!type) return 'none';
  if (type === 'lifetime') return 'active';
  if (!expiryDate) return 'none';
  return new Date(expiryDate) > new Date() ? 'active' : 'expired';
}

// ── Realtime channel ─────────────────────────────────────────

let _channel: RealtimeChannel | null = null;

// ── Store ────────────────────────────────────────────────────

export const subscriptionStore = create<SubscriptionStore>((set, get) => ({
  type: null,
  expiryDate: null,
  status: 'none',
  loading: true,
  error: null,

  // Call once after auth is initialized.
  // Fetches current subscription and subscribes to realtime changes.
  initialize: async () => {
    await get().refresh();

    // Subscribe to realtime changes on the profiles table for this user
    const user = authStore.getState().user;
    if (!user) return;

    // Tear down previous channel if any
    get().cleanup();

    _channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { subscription_type, subscription_expiry } = payload.new as {
            subscription_type: string | null;
            subscription_expiry: string | null;
          };
          const type = (subscription_type as SubscriptionType) || null;
          const status = computeStatus(type, subscription_expiry);
          set({ type, expiryDate: subscription_expiry, status });
        },
      )
      .subscribe();
  },

  refresh: async () => {
    const user = authStore.getState().user;
    if (!user) {
      set({ type: null, expiryDate: null, status: 'none', loading: false });
      return;
    }

    set({ loading: true, error: null });

    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_type, subscription_expiry')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    const type = (data?.subscription_type as SubscriptionType) || null;
    const expiryDate = data?.subscription_expiry || null;
    const status = computeStatus(type, expiryDate);

    set({ type, expiryDate, status, loading: false });
  },

  startTrial: async () => {
    const user = authStore.getState().user;
    if (!user) throw new Error('No user session found.');

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    const expiry = expiryDate.toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_type: 'trial',
        subscription_expiry: expiry,
      })
      .eq('user_id', user.id);

    if (error) throw new Error(error.message);

    set({ type: 'trial', expiryDate: expiry, status: 'active' });
  },

  // Called from payment-success after webhook confirms payment,
  // or can be triggered by the realtime listener.
  updateFromWebhook: async (type, expiryDate) => {
    const status = computeStatus(type, expiryDate);
    set({ type, expiryDate, status });
  },

  cleanup: () => {
    if (_channel) {
      supabase.removeChannel(_channel);
      _channel = null;
    }
  },
}));
