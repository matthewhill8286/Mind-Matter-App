/**
 * @deprecated This file is deprecated. Use the new supabase-client.ts instead.
 *
 * Migration guide:
 *
 * Old approach:
 * ```ts
 * const userId = getUserIdOrThrow();
 * const { data, error } = await syncToSupabase('moods', moodData);
 * const result = await fetchFromSupabase('moods');
 * ```
 *
 * New approach:
 * ```ts
 * import { moodsClient } from '@/lib/supabase-client';
 * const { data, error } = await moodsClient.insert(moodData);
 * const result = await moodsClient.getAll();
 * ```
 *
 * Benefits of the new approach:
 * - ✅ Type-safe with full TypeScript support
 * - ✅ Automatic user_id handling
 * - ✅ Built-in error handling and formatting
 * - ✅ Optimistic updates support
 * - ✅ Batch operations support
 * - ✅ Better query builder with filtering, ordering, and pagination
 * - ✅ CRUD operations: getById, getAll, query, insert, update, upsert, delete
 *
 * Available table clients:
 * - profilesClient
 * - moodsClient
 * - journalsClient
 * - sleepClient
 * - mindfulnessClient
 * - chatHistoriesClient
 * - assessmentsClient
 * - stressKitsClient
 * - stressHistoriesClient
 */

import { supabase } from './supabase';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * @deprecated Use the new table clients from supabase-client.ts instead
 * @example
 * ```ts
 * import { moodsClient } from '@/lib/supabase-client';
 * // Auto-handles user ID and type safety
 * const { data, error } = await moodsClient.insert(moodData);
 * ```
 */
export function getUserIdOrThrow(): string {
  const { user } = useAuthStore.getState();
  if (!user) {
    throw new Error('No user session found. Please sign in again.');
  }
  return user.id;
}

/**
 * @deprecated Use table clients from supabase-client.ts instead
 * @example
 * Old: `await syncToSupabase('moods', data)`
 * New: `await moodsClient.insert(data)` or `await moodsClient.upsert(data)`
 */
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

/**
 * @deprecated Use table clients from supabase-client.ts instead
 * @example
 * Old: `await fetchFromSupabase('moods')`
 * New: `await moodsClient.getAll()` or `await moodsClient.getById(id)`
 */
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

/**
 * @deprecated Use withOptimisticUpdate from supabase-client.ts instead
 * @example
 * Old: `withSupabaseSync(storeAction, syncAction)`
 * New: `withOptimisticUpdate(() => optimistic(), () => remote(), (prev) => rollback(prev))`
 */
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
