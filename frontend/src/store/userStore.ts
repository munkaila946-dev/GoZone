// ============================================================
// STORE: User Profile Store (Zustand)
// ============================================================
// Manages user profile data globally so changes in the Profile
// screen are reflected across the entire app (Home, Food, etc.)
// ============================================================

import { create } from 'zustand';
import { TRANSACTIONS } from '@services/mockData';
import { Transaction } from '../types';
import { API_BASE_URL } from '@services/apiConfig';

interface UserState {
  // ---- State ----
  name: string;
  email: string;
  phone: string;
  balance: number;
  isBalanceVisible: boolean;
  transactions: Transaction[];
  rides: any[];
  orders: any[];
  avatarUrl: string | null;
  token: string | null;
  userId: number | null;
  isAuthenticated: boolean;

  // ---- Derived ----
  firstName: () => string;
  initials: () => string;

  // ---- Actions ----
  setProfile: (name: string, email: string, phone: string) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhone: (phone: string) => void;
  setBalance: (balance: number) => void;
  setBalanceVisible: (visible: boolean) => void;
  addTransaction: (transaction: Transaction) => void;
  setAuth: (token: string, userId: number, name: string, email: string | null, phone: string, balance: number) => void;
  logout: () => void;
  fetchWallet: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  setAvatarUrl: (avatarUrl: string | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // Default profile
  name: 'Kwame Mensah',
  email: 'kwame@example.com',
  phone: '+233 24 123 4567',
  balance: 1250.0,
  isBalanceVisible: false,
  transactions: [...TRANSACTIONS],
  rides: [],
  orders: [],
  avatarUrl: null,
  token: 'demo-token-12345',
  userId: 1,
  isAuthenticated: true,

  // Get first name (for greeting)
  firstName: () => {
    const parts = get().name.trim().split(' ');
    return parts[0] || 'User';
  },

  // Get initials (for avatar)
  initials: () => {
    const parts = get().name.trim().split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'U').toUpperCase();
  },

  // Update all profile fields at once
  setProfile: (name, email, phone) => set({ name, email, phone }),

  // Individual setters
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setPhone: (phone) => set({ phone }),
  setBalance: (balance) => set({ balance }),
  setBalanceVisible: (visible) => set({ isBalanceVisible: visible }),
  addTransaction: (transaction) => set((state) => ({ transactions: [transaction, ...state.transactions] })),
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),

  setAuth: (token, userId, name, email, phone, balance) =>
    set({
      token,
      userId,
      name,
      email: email || '',
      phone,
      balance,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      token: null,
      userId: null,
      isAuthenticated: false,
      name: '',
      email: '',
      phone: '',
      balance: 0.0,
      transactions: [],
      avatarUrl: null,
      rides: [],
      orders: [],
    }),

  fetchWallet: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/wallet`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          set({ balance: json.data.balance });
        }
      }
      
      const txResponse = await fetch(`${API_BASE_URL}/wallet/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (txResponse.ok) {
        const txJson = await txResponse.json();
        if (txJson.success && txJson.data) {
          set({ transactions: txJson.data });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch wallet info from backend:', error);
    }
  },

  fetchHistory: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const ridesRes = await fetch(`${API_BASE_URL}/rides`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (ridesRes.ok) {
        const ridesJson = await ridesRes.json();
        if (ridesJson.success && ridesJson.data) {
          set({ rides: ridesJson.data });
        }
      }

      const ordersRes = await fetch(`${API_BASE_URL}/orders`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (ordersRes.ok) {
        const ordersJson = await ordersRes.json();
        if (ordersJson.success && ordersJson.data) {
          set({ orders: ordersJson.data });
        }
      }
    } catch (error) {
      console.warn('Failed to fetch history from backend:', error);
    }
  }
}));
