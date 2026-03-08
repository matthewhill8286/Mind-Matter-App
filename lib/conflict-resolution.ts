/**
 * Conflict Resolution for Supabase Data
 *
 * This module provides utilities for resolving conflicts when the same data
 * is modified from multiple devices or sources.
 *
 * Strategy: Last-Write-Wins (LWW) based on updated_at timestamp
 */

export type ConflictResolutionStrategy =
  | 'last-write-wins'
  | 'client-wins'
  | 'server-wins'
  | 'manual';

export interface ConflictData<T> {
  clientVersion: T;
  serverVersion: T;
  strategy?: ConflictResolutionStrategy;
}

export interface ResolvedConflict<T> {
  resolved: T;
  strategy: ConflictResolutionStrategy;
  requiresManualReview: boolean;
}

/**
 * Check if two timestamps indicate a conflict
 * (server version is newer than client version)
 */
export function hasConflict(clientUpdatedAt: string, serverUpdatedAt: string): boolean {
  const clientTime = new Date(clientUpdatedAt).getTime();
  const serverTime = new Date(serverUpdatedAt).getTime();
  return serverTime > clientTime;
}

/**
 * Resolve conflict using Last-Write-Wins strategy
 * Compares updated_at timestamps and chooses the most recent
 */
function resolveLastWriteWins<T extends { updated_at?: string }>(
  clientVersion: T,
  serverVersion: T,
): T {
  const clientTime = clientVersion.updated_at ? new Date(clientVersion.updated_at).getTime() : 0;
  const serverTime = serverVersion.updated_at ? new Date(serverVersion.updated_at).getTime() : 0;

  // If timestamps are equal or within 1 second, prefer client
  // (to avoid overwriting user's pending changes)
  if (Math.abs(clientTime - serverTime) <= 1000) {
    return clientVersion;
  }

  return serverTime > clientTime ? serverVersion : clientVersion;
}

/**
 * Resolve conflict using Client-Wins strategy
 * Always uses the client version (useful for offline-first apps)
 */
function resolveClientWins<T>(clientVersion: T, _serverVersion: T): T {
  return clientVersion;
}

/**
 * Resolve conflict using Server-Wins strategy
 * Always uses the server version (useful for authoritative server data)
 */
function resolveServerWins<T>(_clientVersion: T, serverVersion: T): T {
  return serverVersion;
}

/**
 * Merge two objects, preferring non-null/non-undefined values
 * Useful for partial updates
 */
export function mergeObjects<T extends Record<string, any>>(clientVersion: T, serverVersion: T): T {
  const merged = { ...serverVersion };

  for (const key in clientVersion) {
    const clientValue = clientVersion[key];
    const serverValue = serverVersion[key];

    // Prefer client value if server value is null/undefined
    if (serverValue === null || serverValue === undefined) {
      merged[key] = clientValue;
    }
    // Prefer client value if it's different and more recent
    else if (clientValue !== serverValue) {
      // For nested objects, recursively merge
      if (
        typeof clientValue === 'object' &&
        typeof serverValue === 'object' &&
        !Array.isArray(clientValue)
      ) {
        merged[key] = mergeObjects(clientValue, serverValue);
      } else {
        // Use last-write-wins based on updated_at if available
        merged[key] = clientValue;
      }
    }
  }

  return merged;
}

/**
 * Main conflict resolution function
 * Resolves conflicts between client and server versions using specified strategy
 */
export function resolveConflict<T extends { updated_at?: string }>(
  conflict: ConflictData<T>,
): ResolvedConflict<T> {
  const { clientVersion, serverVersion, strategy = 'last-write-wins' } = conflict;

  let resolved: T;
  let requiresManualReview = false;

  switch (strategy) {
    case 'last-write-wins':
      resolved = resolveLastWriteWins(clientVersion, serverVersion);
      break;

    case 'client-wins':
      resolved = resolveClientWins(clientVersion, serverVersion);
      break;

    case 'server-wins':
      resolved = resolveServerWins(clientVersion, serverVersion);
      break;

    case 'manual':
      // Return both versions for manual resolution
      resolved = clientVersion; // Temporary, app should handle this
      requiresManualReview = true;
      break;

    default:
      console.warn(`[Conflict Resolution] Unknown strategy: ${strategy}, using last-write-wins`);
      resolved = resolveLastWriteWins(clientVersion, serverVersion);
  }

  return {
    resolved,
    strategy,
    requiresManualReview,
  };
}

/**
 * Detect if optimistic update conflicts with server state
 * Used to determine if we need to show a conflict resolution UI
 */
export function detectOptimisticConflict<T extends { id?: string; updated_at?: string }>(
  optimisticItem: T,
  serverItem: T,
): boolean {
  // Different IDs = no conflict (different items)
  if (optimisticItem.id !== serverItem.id) {
    return false;
  }

  // Check if updated_at timestamps differ significantly (> 1 second)
  if (optimisticItem.updated_at && serverItem.updated_at) {
    return hasConflict(optimisticItem.updated_at, serverItem.updated_at);
  }

  // If no timestamps, compare object equality
  return JSON.stringify(optimisticItem) !== JSON.stringify(serverItem);
}

/**
 * Example usage in a store:
 *
 * ```typescript
 * try {
 *   const { data: serverData } = await supabase.from('table').select().eq('id', id).single();
 *
 *   if (detectOptimisticConflict(clientData, serverData)) {
 *     const { resolved } = resolveConflict({
 *       clientVersion: clientData,
 *       serverVersion: serverData,
 *       strategy: 'last-write-wins'
 *     });
 *
 *     // Use resolved data
 *     setState({ data: resolved });
 *   }
 * } catch (error) {
 *   // Handle error
 * }
 * ```
 */
