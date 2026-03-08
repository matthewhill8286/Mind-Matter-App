import { supabase } from './supabase';
import { useAuthStore } from '@/store/useAuthStore';

export function getUserIdOrThrow(): string {
  const { user } = useAuthStore.getState();
  if (!user) {
    throw new Error('No user session found. Please sign in again.');
  }
  return user.id;
}

export async function syncToSupabase<T extends Record<string, any>>(
  table: string,
  data: T,
  options: {
    matchColumn?: string;
    onConflict?: string;
  } = {},
) {
  let userId: string;
  try {
    userId = getUserIdOrThrow();
  } catch (err) {
    return { error: (err as Error).message };
  }

  const matchColumn = options.matchColumn || 'user_id';
  const matchValue = matchColumn === 'user_id' ? userId : data[matchColumn];

  if (!matchValue) return { error: `Missing match value for ${matchColumn}` };

  const { data: result, error } = await supabase
    .from(
      table as
        | 'assessments'
        | 'chat_histories'
        | 'journals'
        | 'mindfulness'
        | 'moods'
        | 'profiles'
        | 'sleep'
        | 'stress_histories'
        | 'stress_kits',
    )
    .upsert({ ...data, user_id: userId }, { onConflict: options.onConflict || matchColumn })
    .select()
    .single();

  return { data: result, error };
}

export async function fetchFromSupabase<T>(
  table: string,
  options: {
    matchColumn?: string;
    matchValue?: any;
  } = {},
) {
  let userId: string;
  try {
    userId = getUserIdOrThrow();
  } catch (err) {
    return { error: (err as Error).message };
  }

  const matchColumn = options.matchColumn || 'user_id';
  const matchValue = options.matchValue || userId;

  const { data, error } = await supabase
    .from(
      table as
        | 'assessments'
        | 'chat_histories'
        | 'journals'
        | 'mindfulness'
        | 'moods'
        | 'profiles'
        | 'sleep'
        | 'stress_histories'
        | 'stress_kits',
    )
    .select('*')
    .eq(matchColumn, matchValue)
    .maybeSingle();

  return { data: data as T | null, error };
}

export const withSupabaseSync = <T extends any[], R>(
  storeAction: (...args: T) => Promise<R>,
  syncAction: (result: R) => Promise<any>,
) => {
  return async (...args: T): Promise<R> => {
    const result = await storeAction(...args);
    try {
      await syncAction(result);
    } catch (err) {
      console.warn('Supabase sync failed:', err);
    }
    return result;
  };
};
