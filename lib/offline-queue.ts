/**
 * Offline Queue for Failed Mutations
 *
 * This module provides an offline queue system that stores failed mutations
 * and retries them when the connection is restored.
 *
 * Usage:
 * - enqueueOperation() to add failed operations to the queue
 * - processQueue() to retry all queued operations
 * - clearQueue() to clear all queued operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = 'offline-queue:v1';

export interface QueuedOperation {
  id: string;
  timestamp: number;
  store: string;
  operation: 'insert' | 'update' | 'delete' | 'upsert';
  table: string;
  data: any;
  retryCount: number;
  error?: string;
}

/**
 * Get all queued operations from AsyncStorage
 */
export async function getQueue(): Promise<QueuedOperation[]> {
  try {
    const queueJSON = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJSON ? JSON.parse(queueJSON) : [];
  } catch (error) {
    console.error('[Offline Queue] Error reading queue:', error);
    return [];
  }
}

/**
 * Save queue to AsyncStorage
 */
async function saveQueue(queue: QueuedOperation[]): Promise<void> {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[Offline Queue] Error saving queue:', error);
  }
}

/**
 * Add a failed operation to the offline queue
 */
export async function enqueueOperation(
  store: string,
  operation: QueuedOperation['operation'],
  table: string,
  data: any,
  error?: string,
): Promise<void> {
  try {
    const queue = await getQueue();

    const queuedOp: QueuedOperation = {
      id: `${store}-${operation}-${Date.now()}`,
      timestamp: Date.now(),
      store,
      operation,
      table,
      data,
      retryCount: 0,
      error,
    };

    queue.push(queuedOp);
    await saveQueue(queue);

    console.log(`[Offline Queue] Enqueued ${operation} for ${store} on ${table}`);
  } catch (error) {
    console.error('[Offline Queue] Error enqueueing operation:', error);
  }
}

/**
 * Remove an operation from the queue by ID
 */
async function dequeueOperation(id: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter((op) => op.id !== id);
    await saveQueue(filtered);
    console.log(`[Offline Queue] Dequeued operation ${id}`);
  } catch (error) {
    console.error('[Offline Queue] Error dequeuing operation:', error);
  }
}

/**
 * Update retry count for an operation
 */
async function updateRetryCount(id: string, retryCount: number): Promise<void> {
  try {
    const queue = await getQueue();
    const updated = queue.map((op) => (op.id === id ? { ...op, retryCount } : op));
    await saveQueue(updated);
  } catch (error) {
    console.error('[Offline Queue] Error updating retry count:', error);
  }
}

/**
 * Process all queued operations
 * Called when network connection is restored
 */
export async function processQueue(): Promise<void> {
  const queue = await getQueue();

  if (queue.length === 0) {
    console.log('[Offline Queue] Queue is empty');
    return;
  }

  console.log(`[Offline Queue] Processing ${queue.length} operations...`);

  for (const op of queue) {
    try {
      // Import store dynamically based on operation
      const success = await retryOperation(op);

      if (success) {
        await dequeueOperation(op.id);
        console.log(`[Offline Queue] Successfully processed ${op.id}`);
      } else {
        // Increment retry count
        await updateRetryCount(op.id, op.retryCount + 1);

        // Remove after 5 failed retries
        if (op.retryCount >= 5) {
          console.warn(`[Offline Queue] Max retries exceeded for ${op.id}, removing from queue`);
          await dequeueOperation(op.id);
        }
      }
    } catch (error) {
      console.error(`[Offline Queue] Error processing ${op.id}:`, error);
      await updateRetryCount(op.id, op.retryCount + 1);
    }
  }

  console.log('[Offline Queue] Queue processing complete');
}

/**
 * Retry a single operation
 */
async function retryOperation(op: QueuedOperation): Promise<boolean> {
  try {
    console.log(
      `[Offline Queue] Retrying ${op.operation} on ${op.table} (attempt ${op.retryCount + 1})`,
    );

    // Import Supabase client
    const { supabase } = await import('@/supabase/supabase');
    const { getUserIdOrThrow } = await import('@/supabase/supabase-sync');

    const userId = getUserIdOrThrow();

    // Execute the operation based on type
    switch (op.operation) {
      case 'insert':
        const { error: insertError } = await supabase
          .from(op.table as any)
          .insert({ ...op.data, user_id: userId })
          .select()
          .single();
        return !insertError;

      case 'update':
        const { error: updateError } = await supabase
          .from(op.table as any)
          .update({ ...op.data, user_id: userId })
          .eq('id', op.data.id)
          .eq('user_id', userId);
        return !updateError;

      case 'upsert':
        const { error: upsertError } = await supabase
          .from(op.table as any)
          .upsert({ ...op.data, user_id: userId })
          .select()
          .single();
        return !upsertError;

      case 'delete':
        const { error: deleteError } = await supabase
          .from(op.table as any)
          .delete()
          .eq('id', op.data.id)
          .eq('user_id', userId);
        return !deleteError;

      default:
        console.warn(`[Offline Queue] Unknown operation type: ${op.operation}`);
        return false;
    }
  } catch (error) {
    console.error(`[Offline Queue] Retry failed for ${op.id}:`, error);
    return false;
  }
}

/**
 * Clear all operations from the queue
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    console.log('[Offline Queue] Queue cleared');
  } catch (error) {
    console.error('[Offline Queue] Error clearing queue:', error);
  }
}

/**
 * Get queue size
 */
export async function getQueueSize(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

/**
 * Setup network listener to auto-process queue when connection restored
 */
export function setupNetworkListener(): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable) {
      console.log('[Offline Queue] Network connection restored, processing queue...');
      processQueue();
    }
  });

  return unsubscribe;
}
