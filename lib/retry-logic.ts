/**
 * Retry Logic with Exponential Backoff
 *
 * This module provides retry utilities for network requests with exponential backoff.
 * Used to automatically retry failed Supabase operations.
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  exponentialBackoff?: boolean;
  onRetry?: (attempt: number, error: any) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  exponentialBackoff: true,
  onRetry: () => {},
};

/**
 * Calculate delay for next retry attempt using exponential backoff
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  if (!options.exponentialBackoff) {
    return options.baseDelay;
  }

  // Exponential backoff: delay = baseDelay * 2^attempt
  const exponentialDelay = options.baseDelay * Math.pow(2, attempt);

  // Add jitter (random variation) to prevent thundering herd
  const jitter = Math.random() * options.baseDelay;

  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, options.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors
  if (error.message?.includes('Network')) return true;
  if (error.message?.includes('timeout')) return true;
  if (error.message?.includes('ECONNREFUSED')) return true;
  if (error.message?.includes('ETIMEDOUT')) return true;

  // Supabase specific errors
  if (error.code === 'PGRST301') return true; // Connection timeout
  if (error.code === '08000') return true; // Connection exception
  if (error.code === '08003') return true; // Connection does not exist
  if (error.code === '08006') return true; // Connection failure

  // HTTP status codes that are retryable
  if (error.status === 408) return true; // Request Timeout
  if (error.status === 429) return true; // Too Many Requests
  if (error.status === 500) return true; // Internal Server Error
  if (error.status === 502) return true; // Bad Gateway
  if (error.status === 503) return true; // Service Unavailable
  if (error.status === 504) return true; // Gateway Timeout

  return false;
}

/**
 * Execute a function with automatic retry logic
 *
 * @param fn Function to execute (should return a promise)
 * @param options Retry configuration options
 * @returns Promise with the result of the function
 *
 * @example
 * const result = await withRetry(
 *   async () => await supabase.from('table').insert(data),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not a retryable error
      if (!isRetryableError(error)) {
        throw error;
      }

      // Don't retry if we've exhausted all attempts
      if (attempt === opts.maxRetries) {
        break;
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts);
      console.log(`[Retry Logic] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);

      // Call onRetry callback
      opts.onRetry(attempt + 1, error);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  console.error(`[Retry Logic] All ${opts.maxRetries} retry attempts failed`);
  throw lastError;
}

/**
 * Wrapper for Supabase operations with retry logic
 *
 * @example
 * const { data, error } = await withSupabaseRetry(
 *   async () => await supabase.from('moods').insert(moodData).select().single()
 * );
 */
export async function withSupabaseRetry<T extends { data: any; error: any }>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  return withRetry(async () => {
    const result = await fn();

    // If Supabase returns an error, throw it so retry logic can handle it
    if (result.error && isRetryableError(result.error)) {
      throw result.error;
    }

    return result;
  }, options);
}
