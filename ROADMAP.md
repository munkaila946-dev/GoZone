# 🚀 GoZone — Project Roadmap

## App Overview
GoZone is a super-app with three integrated service pillars:
1. **GoRide** — Ride-hailing with fare bidding, dynamic pooling, and auto-pricing
2. **GoBite** — Food ordering (delivery, pickup, walk-in queue) with real-time tracking
3. **SuperWallet** — Unified Mobile Money + in-app wallet for all transactions

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React Native + Expo + TypeScript |
| Backend | Spring Boot (Java) + PostgreSQL |
| Payments | Paystack (testing/integration) |

---

## Build Phases

### 📱 Phase 1: Frontend Foundation
- [x] Set up Expo + TypeScript project structure
- [x] Configure navigation (React Navigation)
- [x] Set up theme system (colors, typography, spacing)
- [x] Set up TypeScript types (User, Ride, Food, Wallet)
- [x] **Login screen** (Phone + OTP style)
- [x] **Main tab navigation** (Home, GoRide, GoBite, Profile)
- [x] **Home screen** (Dark theme dashboard + wallet card + services)
- [x] **GoRide screen** (Map + booking sheet + ride options)
- [x] **GoBite screen** (Restaurants + categories + promo banner)
- [x] **Profile screen** (User info + menu + settings)
- [x] **Multi-theme system** (Light, Dark, Midnight, Sunset)
- [x] **Restaurant detail screen** (Full menu, add to cart, qty controls)
- [x] **Cart / Checkout screen** (Items, delivery/pickup, payment, summary)
- [x] **Order tracking screen** (Timeline, rider info, live status)
- [x] **Searching driver screen** (Radar animation, trip summary)
- [x] **Ride in progress screen** (Driver info, progress bar, rating)
- [x] **Wallet home screen** (Balance card, quick actions, transactions)
- [x] **Top-up screen** (MoMo/card selection, quick amounts)
- [x] **Transactions screen** (Filter tabs, grouped by date, summaries)
- [x] **Send money screen** (Contacts, amount, note, summary)
- [ ] **Register & OTP screens**

### ⚙️ Phase 2: Backend Foundation (IN PROGRESS)
- [x] Spring Boot project setup (pom.xml, structure, config)
- [x] PostgreSQL database design & schema (9 tables)
- [x] Entity classes (User, Wallet, Transaction, Restaurant, MenuItem, Order, OrderItem, Ride, SavedLocation)
- [x] Repository layer (Spring Data JPA)
- [x] Authentication (JWT) + user management
- [x] Wallet APIs (balance, transactions, top-up, transfer)
- [x] Restaurant & menu APIs (list, detail, menu)
- [x] Data seeder (test users, restaurants, menu items)
- [x] Global exception handler
- [ ] Order APIs (create order, track order, update status)
- [ ] Ride APIs (pricing engine, ride matching, pooling)
- [ ] Paystack payment integration
- [ ] Connect frontend to backend APIs

### 🔗 Phase 3: Integration & Polish
- [ ] Connect frontend to backend APIs
- [ ] Real-time features (maps, order tracking)
- [ ] Push notifications (SMS/push)
- [ ] Testing & bug fixes
- [ ] Deployment (Expo EAS → app stores)

---

## Folder Structure (Frontend)
```
GoZone/frontend/
├── src/
│   ├── navigation/       # App navigation setup
│   ├── screens/          # All app screens
│   │   ├── auth/         # Login, Register, OTP, Onboarding
│   │   ├── home/         # Dashboard
│   │   ├── ride/         # GoRide screens
│   │   ├── food/         # GoBite screens
│   │   ├── wallet/       # SuperWallet screens
│   │   └── profile/      # User profile & settings
│   ├── components/        # Reusable UI components
│   ├── store/            # Zustand state management
│   ├── services/         # API service layer
│   ├── theme/            # Colors, typography, spacing
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── App.tsx               # Root component
├── app.json              # Expo config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript config
```

---

## Development Principles
1. **Build incrementally** — one screen at a time, test as we go
2. **Keep it simple** — beginner-friendly, well-commented code
3. **Mobile-first design** — clean, modern UI inspired by Uber/Glovo
4. **Type-safe** — leverage TypeScript throughout
