import { useAuthStore } from '@/store/useAuthStore';

export const API_URL = (process.env.EXPO_PUBLIC_API_URL as string) || 'http://localhost:4000';

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { session, user } = useAuthStore.getState();

  const token = session?.access_token;
  const userId = user?.id;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'X-User-Id': userId } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const data = await response.json();
      errorMsg = (data && (data.error || data.message)) || errorMsg;
    } catch {
      const text = await response.text();
      errorMsg = text || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // Handle empty/204 responses gracefully
  if (response.status === 204) {
    return undefined as unknown as T;
  }
  const contentLength = response.headers.get('content-length');
  if (contentLength === '0' || contentLength === null) {
    try {
      const text = await response.text();
      if (!text) return undefined as unknown as T;
      return JSON.parse(text) as T;
    } catch {
      return undefined as unknown as T;
    }
  }

  return response.json() as Promise<T>;
}
