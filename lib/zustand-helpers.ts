import { StateCreator, createStore } from 'zustand/vanilla';
import { create } from 'zustand';

// Lightweight helpers to standardize Zustand usage across the app
// - Slice pattern: define small focused slices + compose in a single store
// - Selector hooks: prefer component-level selectors to avoid re-renders
// - Vanilla store option for non-React modules (e.g., background services)

export type SliceCreator<T, S extends object = object> = StateCreator<T & S, [], [], T>;

// Compose multiple slices into a single store shape
export function composeSlices<Slices extends Record<string, any>>(
  ...slices: StateCreator<Slices, [], []>[]
) {
  return create<Slices>()((...args) => Object.assign({}, ...slices.map((s) => s(...args))));
}

// Create a vanilla store (for non-React modules) and bind a React hook when needed
export function createBoundedStore<T>(initializer: StateCreator<T, [], []>) {
  const vanilla = createStore<T>(initializer);
  const useStore = create(vanilla);
  return Object.assign(useStore, { api: vanilla });
}

// Convenience selector factory: const useX = selectBy((s) => s.x)
export const selectBy =
  <T>() =>
  <U>(fn: (s: T) => U) =>
    fn;

/**
 * Loading Utility Pattern
 *
 * Usage in stores:
 * const createMySlice: SliceCreator<MyState, LoadingState> = (set, get, api) => ({
 *   ...
 *   fetchData: async () => {
 *     const { startLoading, stopLoading } = (api.getState() as any);
 *     startLoading('fetch-data');
 *     try { ... } finally { stopLoading('fetch-data'); }
 *   }
 * });
 */

export interface LoadingState {
  loadingTasks: Set<string>;
  isLoading: boolean;
  startLoading: (taskId: string) => void;
  stopLoading: (taskId: string) => void;
  clearLoading: () => void;
}

export const createLoadingSlice: SliceCreator<LoadingState> = (set) => ({
  loadingTasks: new Set<string>(),
  isLoading: false,
  startLoading: (taskId) =>
    set((state) => {
      const next = new Set(state.loadingTasks);
      next.add(taskId);
      return { loadingTasks: next, isLoading: next.size > 0 };
    }),
  stopLoading: (taskId) =>
    set((state) => {
      const next = new Set(state.loadingTasks);
      next.delete(taskId);
      return { loadingTasks: next, isLoading: next.size > 0 };
    }),
  clearLoading: () => set({ loadingTasks: new Set(), isLoading: false }),
});

// Example slice creators (usage patterns):
//
// type AlertState = { alert: Alert; setAlert: (a: Alert) => void };
// const createAlertSlice: SliceCreator<AlertState> = (set) => ({
//   alert: DEFAULT_ALERT,
//   setAlert: (a) => set({ alert: a }),
// });
//
// type AuthState = { token: string | null; setToken: (t: string | null) => void };
// const createAuthSlice: SliceCreator<AuthState> = (set) => ({
//   token: null,
//   setToken: (t) => set({ token: t }),
// });
//
// export const useAppStore = composeSlices<AlertState & AuthState>(
//   createAlertSlice as any,
//   createAuthSlice as any,
// );
//
// // In components:
// // const token = useAppStore((s) => s.token);
// // const setToken = useAppStore((s) => s.setToken);
