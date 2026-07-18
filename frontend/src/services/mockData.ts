// ============================================================
// MOCK DATA: Sample data for GoZone screens
// ============================================================
// This simulates data that will eventually come from the backend.
// ============================================================

// ===== RESTAURANTS =====
export const RESTAURANTS = [
  {
    id: '1',
    name: 'Papaye Fast Foods',
    tagline: 'Chicken • Grills • Local',
    gradient: ['#FDF0E0', '#FBD9B0'],
    rating: 4.5,
    deliveryTimeMin: 25,
    deliveryTimeMax: 30,
    deliveryFee: 5,
    isOpen: true,
    isFreeDelivery: false,
    isFavorite: false,
  },
  {
    id: '2',
    name: 'Pizza Hut',
    tagline: 'Pizza • Italian • Pasta',
    gradient: ['#E8F5E9', '#C8E6C9'],
    rating: 4.3,
    deliveryTimeMin: 30,
    deliveryTimeMax: 40,
    deliveryFee: 0,
    isOpen: true,
    isFreeDelivery: true,
    isFavorite: true,
  },
  {
    id: '3',
    name: 'KFC - Osu',
    tagline: 'Fried Chicken • Fast Food',
    gradient: ['#FFFDE7', '#FFF9C4'],
    rating: 4.6,
    deliveryTimeMin: 20,
    deliveryTimeMax: 30,
    deliveryFee: 6,
    isOpen: false,
    isFreeDelivery: false,
    isFavorite: false,
  },
];

// ===== RESTAURANT DETAILS (full menu) =====
export const RESTAURANT_DETAILS: Record<string, {
  id: string;
  name: string;
  tagline: string;
  rating: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  gradient: [string, string, ...string[]];
  isOpen: boolean;
  isFreeDelivery: boolean;
  menuSections: { title: string; items: MenuItem[] }[];
}> = {
  '1': {
    id: '1',
    name: 'Papaye Fast Foods',
    tagline: 'Chicken • Grills • Local',
    rating: 4.5,
    deliveryTimeMin: 25,
    deliveryTimeMax: 30,
    deliveryFee: 5,
    gradient: ['#FDF0E0', '#FBD9B0'],
    isOpen: true,
    isFreeDelivery: false,
    menuSections: [
      {
        title: 'Popular',
        items: [
          { id: 'm1', name: 'Jollof Rice & Chicken', description: 'Smoky jollof rice with grilled chicken', price: 35, gradient: ['#FFF3E0', '#FFE0B2'], isPopular: true, category: 'Popular' },
          { id: 'm2', name: 'Fried Rice & Chicken', description: 'Special fried rice with crispy chicken', price: 38, gradient: ['#E8F5E9', '#C8E6C9'], isPopular: true, category: 'Popular' },
        ],
      },
      {
        title: 'Grills',
        items: [
          { id: 'm3', name: 'Grilled Chicken (Quarter)', description: 'Marinated and flame-grilled to perfection', price: 30, gradient: ['#FBE9E7', '#FFCCBC'], isPopular: false, category: 'Grills' },
          { id: 'm4', name: 'Grilled Chicken (Half)', description: 'Half chicken with pepper sauce', price: 55, gradient: ['#FBE9E7', '#FFCCBC'], isPopular: false, category: 'Grills' },
          { id: 'm5', name: 'Grilled Tilapia', description: 'Fresh tilapia grilled with spices', price: 65, gradient: ['#E3F2FD', '#BBDEFB'], isPopular: false, category: 'Grills' },
        ],
      },
      {
        title: 'Sides',
        items: [
          { id: 'm6', name: 'Plantain (3 pcs)', description: 'Golden fried plantain', price: 12, gradient: ['#FFFDE7', '#FFF9C4'], isPopular: false, category: 'Sides' },
          { id: 'm7', name: 'Salad Bowl', description: 'Fresh garden salad with dressing', price: 15, gradient: ['#E8F5E9', '#C8E6C9'], isPopular: false, category: 'Sides' },
          { id: 'm8', name: 'Shito (Pepper Sauce)', description: 'Spicy Ghanaian black pepper sauce', price: 5, gradient: ['#EFEBE9', '#D7CCC8'], isPopular: false, category: 'Sides' },
        ],
      },
    ],
  },
  '2': {
    id: '2',
    name: 'Pizza Hut',
    tagline: 'Pizza • Italian • Pasta',
    rating: 4.3,
    deliveryTimeMin: 30,
    deliveryTimeMax: 40,
    deliveryFee: 0,
    gradient: ['#E8F5E9', '#C8E6C9'],
    isOpen: true,
    isFreeDelivery: true,
    menuSections: [
      {
        title: 'Popular Pizzas',
        items: [
          { id: 'p1', name: 'Pepperoni Large', description: 'Loaded with pepperoni and mozzarella', price: 85, gradient: ['#FFEBEE', '#FFCDD2'], isPopular: true, category: 'Popular' },
          { id: 'p2', name: 'Margherita Large', description: 'Classic tomato, basil, and mozzarella', price: 75, gradient: ['#E8F5E9', '#C8E6C9'], isPopular: true, category: 'Popular' },
        ],
      },
      {
        title: 'Specialty',
        items: [
          { id: 'p3', name: 'Chicken BBQ Large', description: 'BBQ chicken, onions, and peppers', price: 95, gradient: ['#FFF3E0', '#FFE0B2'], isPopular: false, category: 'Specialty' },
          { id: 'p4', name: 'Meat Lovers Large', description: 'Pepperoni, beef, sausage, and bacon', price: 105, gradient: ['#FBE9E7', '#FFCCBC'], isPopular: false, category: 'Specialty' },
          { id: 'p5', name: 'Veggie Supreme Large', description: 'Peppers, mushrooms, olives, and onions', price: 90, gradient: ['#E8F5E9', '#C8E6C9'], isPopular: false, category: 'Specialty' },
        ],
      },
    ],
  },
};

// ===== MENU ITEM TYPE =====
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  gradient: [string, string, ...string[]];
  isPopular: boolean;
  category: string;
}

// ===== WALLET TRANSACTIONS =====
export const TRANSACTIONS = [
  { id: 't1', type: 'debit' as const, category: 'ride' as const, amount: 25, description: 'GoRide - Accra Mall to Airport', date: '2026-06-24T09:30:00', status: 'completed' as const },
  { id: 't2', type: 'credit' as const, category: 'topup' as const, amount: 200, description: 'Top-up via MTN MoMo', date: '2026-06-23T14:20:00', status: 'completed' as const },
  { id: 't3', type: 'debit' as const, category: 'food' as const, amount: 43, description: 'GoBite - Papaye Fast Foods', date: '2026-06-23T12:45:00', status: 'completed' as const },
  { id: 't4', type: 'debit' as const, category: 'transfer' as const, amount: 150, description: 'Sent to Ama Owusu', date: '2026-06-22T18:00:00', status: 'completed' as const },
  { id: 't5', type: 'credit' as const, category: 'refund' as const, amount: 38, description: 'Refund - Cancelled order', date: '2026-06-22T10:15:00', status: 'completed' as const },
  { id: 't6', type: 'debit' as const, category: 'ride' as const, amount: 15, description: 'GoRide - GoPool to Osu', date: '2026-06-21T08:30:00', status: 'completed' as const },
  { id: 't7', type: 'credit' as const, category: 'topup' as const, amount: 500, description: 'Top-up via Telecel Cash', date: '2026-06-20T16:00:00', status: 'completed' as const },
  { id: 't8', type: 'debit' as const, category: 'withdrawal' as const, amount: 300, description: 'Withdrawal to MTN MoMo', date: '2026-06-19T11:00:00', status: 'completed' as const },
];

// ===== ORDER TRACKING STEPS =====
export const ORDER_STEPS = [
  { id: 0, title: 'Order Placed', description: 'We received your order', icon: 'receipt' },
  { id: 1, title: 'Preparing', description: 'Restaurant is preparing your food', icon: 'chef-hat' },
  { id: 2, title: 'On the Way', description: 'Rider is heading to you', icon: 'motorbike' },
  { id: 3, title: 'Delivered', description: 'Enjoy your meal!', icon: 'check-circle' },
];
