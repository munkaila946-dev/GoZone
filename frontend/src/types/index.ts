// ============================================================
// TYPES: Core Domain Types
// ============================================================
// These define the data shapes used across GoZone
// ============================================================

// 👤 User Types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  walletBalance: number;
}

// 🚗 Ride Types
export type RideType = 'GoPool' | 'GoStandard' | 'GoPremium';

export interface RideOption {
  id: string;
  type: RideType;
  price: number;
  eta: number; // estimated arrival time in minutes
  capacity: number;
  icon: string;
}

export interface RideLocation {
  address: string;
  latitude: number;
  longitude: number;
}

export type RideStatus = 
  | 'searching'    // Looking for driver
  | 'accepted'     // Driver found
  | 'arriving'     // Driver on the way to pickup
  | 'inProgress'   // Ride in progress
  | 'completed'    // Ride finished
  | 'cancelled';

// 🍔 Food Types
export type FoodCategory = 'Pizza' | 'Burgers' | 'Local' | 'Drinks' | 'Dessert' | 'Chicken';

export interface Restaurant {
  id: string;
  name: string;
  imageUrl: string;
  rating: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  category: FoodCategory;
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isPopular: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export type OrderType = 'delivery' | 'pickup' | 'dineIn';
export type OrderStatus = 'placed' | 'preparing' | 'ready' | 'pickedUp' | 'delivered' | 'cancelled';

// 💳 Wallet Types
export type TransactionType = 'credit' | 'debit';
export type TransactionCategory = 
  | 'topup'        // Money added to wallet
  | 'ride'         // Ride payment
  | 'food'         // Food payment
  | 'transfer'     // Send to another user
  | 'withdrawal'   // Cash out
  | 'refund'       // Money returned
  | 'payout';      // Driver/restaurant payout

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string; // ISO date string
  status: 'pending' | 'completed' | 'failed';
}
