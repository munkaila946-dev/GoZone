// ============================================================
// STORE: WebSocket Connection Store (Zustand)
// ============================================================
// Manages a single global WebSocket connection for receiving
// real-time updates from the Spring Boot backend.
// ============================================================

import { create } from 'zustand';
import { WS_BASE_URL } from '../services/apiConfig';

interface SocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  connect: (userId: number) => void;
  disconnect: () => void;
  listeners: Map<string, Set<(data: any) => void>>;
  subscribe: (type: string, callback: (data: any) => void) => () => void;
  emit: (type: string, data: any) => void;
}

export const useSocketStore = create<SocketState>((set, get) => {
  return {
    socket: null,
    isConnected: false,
    listeners: new Map(),

    connect: (userId: number) => {
      const state = get();
      if (state.socket && (state.socket.readyState === WebSocket.OPEN || state.socket.readyState === WebSocket.CONNECTING)) {
        return; // Already connecting or connected
      }

      // Close old socket if any
      if (state.socket) {
        state.socket.close();
      }

      const wsUrl = `${WS_BASE_URL}?userId=${userId}`;
      console.log(`Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        set({ isConnected: true });
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const type = payload.type;
          console.log(`WebSocket received event of type: ${type}`, payload);

          const typeListeners = get().listeners.get(type);
          if (typeListeners) {
            typeListeners.forEach((callback) => callback(payload));
          }
        } catch (e) {
          console.warn('Failed to parse WebSocket message', event.data, e);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket connection error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.reason);
        set({ isConnected: false, socket: null });
      };

      set({ socket: ws });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.close();
      }
      set({ socket: null, isConnected: false });
    },

    subscribe: (type: string, callback: (data: any) => void) => {
      const { listeners } = get();
      if (!listeners.has(type)) {
        listeners.set(type, new Set());
      }
      listeners.get(type)!.add(callback);

      // Return unsubscribe function
      return () => {
        const typeListeners = get().listeners.get(type);
        if (typeListeners) {
          typeListeners.delete(callback);
          if (typeListeners.size === 0) {
            get().listeners.delete(type);
          }
        }
      };
    },

    emit: (type: string, data: any) => {
      const { socket, isConnected } = get();
      if (socket && isConnected) {
        socket.send(JSON.stringify({ type, ...data }));
      } else {
        console.warn('Socket not connected. Cannot emit event:', type);
      }
    }
  };
});
