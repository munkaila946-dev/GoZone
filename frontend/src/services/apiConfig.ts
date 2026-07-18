// ============================================================
// SERVICES: API & WebSockets Configuration
// ============================================================

import { useUserStore } from '../store/userStore';

/**
 * IP address of your development machine running the Spring Boot backend.
 * 
 * - Use '10.0.2.2' if running on an Android Emulator (loopback to host).
 * - Use 'localhost' if running on an iOS Simulator or Web build.
 * - Use your machine's local network IP (e.g. '192.168.1.100') if testing on a physical device.
 */
export const SERVER_IP = '172.20.10.3'; 

export const API_BASE_URL = `http://${SERVER_IP}:8080/api`;
export const WS_BASE_URL = `ws://${SERVER_IP}:8080/ws/updates`;

/**
 * Custom fetch wrapper that automatically appends the JWT Authorization token
 * from userStore if it exists.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = useUserStore.getState().token;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
