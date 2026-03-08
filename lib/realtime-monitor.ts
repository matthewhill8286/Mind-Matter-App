/**
 * Supabase Realtime Connection Monitor
 *
 * This module provides utilities to monitor the status of Supabase realtime connections
 * and notify the app when connections are established, lost, or reconnected.
 */

import { create } from 'zustand';
import { supabase } from '@/supabase/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface RealtimeMonitorState {
  status: ConnectionStatus;
  error: string | null;
  connectedChannels: string[];
  lastConnectedAt: Date | null;
  lastDisconnectedAt: Date | null;
  reconnectAttempts: number;
}

interface RealtimeMonitorActions {
  setStatus: (status: ConnectionStatus) => void;
  setError: (error: string | null) => void;
  addChannel: (channelName: string) => void;
  removeChannel: (channelName: string) => void;
  incrementReconnectAttempts: () => void;
  resetReconnectAttempts: () => void;
}

type RealtimeMonitorStore = RealtimeMonitorState & RealtimeMonitorActions;

/**
 * Zustand store for monitoring realtime connection status
 */
export const useRealtimeMonitor = create<RealtimeMonitorStore>((set) => ({
  status: 'disconnected',
  error: null,
  connectedChannels: [],
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  reconnectAttempts: 0,

  setStatus: (status) =>
    set((state) => ({
      status,
      lastConnectedAt: status === 'connected' ? new Date() : state.lastConnectedAt,
      lastDisconnectedAt: status === 'disconnected' ? new Date() : state.lastDisconnectedAt,
    })),

  setError: (error) => set({ error, status: error ? 'error' : 'disconnected' }),

  addChannel: (channelName) =>
    set((state) => ({
      connectedChannels: [...state.connectedChannels, channelName],
    })),

  removeChannel: (channelName) =>
    set((state) => ({
      connectedChannels: state.connectedChannels.filter((name) => name !== channelName),
    })),

  incrementReconnectAttempts: () =>
    set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1,
    })),

  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),
}));

/**
 * Setup connection monitoring for a Supabase realtime channel
 */
export function monitorChannel(channel: RealtimeChannel, channelName: string): void {
  const {
    setStatus,
    addChannel,
    removeChannel,
    setError,
    incrementReconnectAttempts,
    resetReconnectAttempts,
  } = useRealtimeMonitor.getState();

  // Track channel subscription status
  channel
    .on('system', { event: '*' }, (payload) => {
      console.log(`[Realtime Monitor] ${channelName} - System event:`, payload.type);

      switch (payload.type) {
        case 'connected':
          setStatus('connected');
          addChannel(channelName);
          resetReconnectAttempts();
          console.log(`[Realtime Monitor] ${channelName} connected`);
          break;

        case 'disconnected':
          setStatus('disconnected');
          removeChannel(channelName);
          console.log(`[Realtime Monitor] ${channelName} disconnected`);
          break;

        case 'connecting':
          setStatus('connecting');
          console.log(`[Realtime Monitor] ${channelName} connecting...`);
          break;

        case 'error':
          setStatus('error');
          setError(payload.message || 'Unknown error');
          console.error(`[Realtime Monitor] ${channelName} error:`, payload);
          break;
      }
    })
    .subscribe((status, error) => {
      if (status === 'SUBSCRIBED') {
        setStatus('connected');
        addChannel(channelName);
        resetReconnectAttempts();
        console.log(`[Realtime Monitor] ${channelName} subscribed successfully`);
      } else if (status === 'CHANNEL_ERROR') {
        setStatus('error');
        setError(error?.message || 'Channel subscription error');
        incrementReconnectAttempts();
        console.error(`[Realtime Monitor] ${channelName} subscription error:`, error);
      } else if (status === 'TIMED_OUT') {
        setStatus('error');
        setError('Connection timed out');
        incrementReconnectAttempts();
        console.error(`[Realtime Monitor] ${channelName} timed out`);
      } else if (status === 'CLOSED') {
        setStatus('disconnected');
        removeChannel(channelName);
        console.log(`[Realtime Monitor] ${channelName} closed`);
      }
    });
}

/**
 * Get current overall connection health
 */
export function getConnectionHealth(): {
  isHealthy: boolean;
  status: ConnectionStatus;
  message: string;
} {
  const { status, connectedChannels, reconnectAttempts } = useRealtimeMonitor.getState();

  if (status === 'connected' && connectedChannels.length > 0) {
    return {
      isHealthy: true,
      status: 'connected',
      message: `Connected to ${connectedChannels.length} channel(s)`,
    };
  }

  if (status === 'connecting') {
    return {
      isHealthy: false,
      status: 'connecting',
      message: 'Connecting to realtime services...',
    };
  }

  if (status === 'error' || reconnectAttempts > 3) {
    return {
      isHealthy: false,
      status: 'error',
      message: `Connection error (${reconnectAttempts} failed attempts)`,
    };
  }

  return {
    isHealthy: false,
    status: 'disconnected',
    message: 'Disconnected from realtime services',
  };
}

/**
 * Force reconnect all channels
 */
export async function reconnectAllChannels(): Promise<void> {
  console.log('[Realtime Monitor] Forcing reconnection of all channels...');

  // Get all channels from Supabase
  const channels = supabase.getChannels();

  for (const channel of channels) {
    try {
      await channel.unsubscribe();
      await channel.subscribe();
      console.log(`[Realtime Monitor] Reconnected channel: ${channel.topic}`);
    } catch (error) {
      console.error(`[Realtime Monitor] Failed to reconnect channel ${channel.topic}:`, error);
    }
  }
}

/**
 * Get diagnostic information about realtime connections
 */
export function getDiagnostics() {
  const state = useRealtimeMonitor.getState();
  const health = getConnectionHealth();

  return {
    ...state,
    health,
    totalChannels: supabase.getChannels().length,
    timestamp: new Date().toISOString(),
  };
}
