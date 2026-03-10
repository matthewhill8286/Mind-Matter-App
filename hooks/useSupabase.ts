import { useContext } from 'react';

import { SupabaseClient, Session } from '@supabase/supabase-js';

import { SupabaseContext } from '@/context/supabase-context';
import { authStore } from '@/store/authStore';

interface UseSupabaseProps {
  isLoaded: boolean;
  session: Session | null | undefined;
  supabase: SupabaseClient;
  signOut: () => Promise<void>;
}

export const useSupabase = (): UseSupabaseProps => {
  const supabase = useContext(SupabaseContext);
  const { session, loading, signOut } = authStore();

  if (!supabase) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }

  return {
    isLoaded: !loading,
    session,
    supabase,
    signOut,
  };
};
