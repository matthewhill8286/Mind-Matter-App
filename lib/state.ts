import { t } from 'i18next';
import { create } from 'zustand';
import { createLoadingSlice, LoadingState, SliceCreator } from './zustand-helpers';

export interface AlertAction {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  actions: AlertAction[];
}

const defaultAlertState: AlertState = {
  visible: false,
  title: '',
  message: '',
  actions: [],
};

// --- Slices ---

interface AlertSlice {
  alert: AlertState;
  setAlert: (val: AlertState) => void;
  hideAlert: () => void;
}

const createAlertSlice: SliceCreator<AlertSlice> = (set, get) => ({
  alert: defaultAlertState,
  setAlert: (val) => set({ alert: val }),
  hideAlert: () => set({ alert: { ...get().alert, visible: false } }),
});

// Auth slice removed - use authStore from @/store/authStore instead

// For backward compatibility during migration
interface LegacyActions {
  actions: {
    setAlert: (val: AlertAction | any) => void;
    hideAlert: () => void;
    setIsLoading: (val: boolean) => void;
    setIsMutating: (val: boolean) => void;
  };
}

type GlobalState = AlertSlice & LoadingState & LegacyActions;

export const useGlobalStore = create<GlobalState>()((set, get, api) => ({
  ...createAlertSlice(set, get, api),
  ...createLoadingSlice(set, get, api),
  // Legacy actions bridge
  actions: {
    setAlert: (val) => get().setAlert(val),
    hideAlert: () => get().hideAlert(),
    setIsLoading: (val) =>
      val ? get().startLoading('legacy-loading') : get().stopLoading('legacy-loading'),
    setIsMutating: (val) =>
      val ? get().startLoading('legacy-mutating') : get().stopLoading('legacy-mutating'),
  },
}));

export const alertVar = (val?: AlertState) => {
  if (val !== undefined) useGlobalStore.getState().setAlert(val);
  return useGlobalStore.getState().alert;
};

export const useAlert = () => useGlobalStore((s) => s.alert);

export const isLoadingVar = (val?: boolean) => {
  if (val !== undefined) {
    if (val) useGlobalStore.getState().startLoading('manual');
    else useGlobalStore.getState().stopLoading('manual');
  }
  return useGlobalStore.getState().isLoading;
};

export const useIsLoading = () => useGlobalStore((s) => s.isLoading);

export const isMutatingVar = (val?: boolean) => {
  if (val !== undefined) {
    if (val) useGlobalStore.getState().startLoading('manual-mutation');
    else useGlobalStore.getState().stopLoading('manual-mutation');
  }
  return useGlobalStore.getState().isLoading; // Mapping to isLoading for now
};

export const useIsMutating = () => useGlobalStore((s) => s.isLoading);

export const showAlert = (title: string, message: string, actions?: AlertAction[]) => {
  alertVar({
    visible: true,
    title,
    message,
    actions: actions || [{ text: t('common.ok', { defaultValue: 'OK' }) }],
  });
};

export const hideAlert = () => useGlobalStore.getState().hideAlert();

// Auth exports removed - use authStore from @/store/authStore instead
// export const useUser, useSession, useAuthInitialized, setSession have been migrated

/**
 * Global Loading Utility
 */
export const startLoading = (id: string) => useGlobalStore.getState().startLoading(id);
export const stopLoading = (id: string) => useGlobalStore.getState().stopLoading(id);

export async function withLoading<T>(id: string, fn: () => Promise<T>): Promise<T> {
  startLoading(id);
  try {
    return await fn();
  } finally {
    stopLoading(id);
  }
}
