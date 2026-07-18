# 🚀 GoZone Frontend — Quick Start Guide

## What We've Built So Far

A complete Expo + React Native + TypeScript project with:

| Screen | Status | Description |
|--------|--------|-------------|
| 🔐 Login | ✅ Done | Phone number login with Ghana flag (+233) |
| 🏠 Home | ✅ Done | Dark theme dashboard, wallet balance, 3 service cards |
| 🚗 GoRide | ✅ Done | Map view, pickup/destination, ride options & pricing |
| 🍔 GoBite | ✅ Done | Restaurants, categories, promo banner, food cards |
| 👤 Profile | ✅ Done | User stats, menu sections, settings |

## How to Run the App

### Prerequisites
You need to install these on your computer first:
1. **Node.js** (v18 or newer) — Download from [nodejs.org](https://nodejs.org)
2. **Expo Go app** on your phone (search "Expo Go" in App Store / Play Store)

### Step-by-Step

```bash
# 1. Go into the frontend folder
cd GoZone/frontend

# 2. Install dependencies (only needed once)
npm install

# 3. Start the app
npx expo start
```

This will open the **Expo Dev Tools** in your browser and show a **QR code** in the terminal.

### To View on Your Phone:
1. Open the **Expo Go** app on your phone
2. Scan the **QR code** from the terminal
3. The app will load on your phone! 📱

### To View on Android Emulator:
- Press `a` in the terminal (after starting the app)

### To View on iOS Simulator (Mac only):
- Press `i` in the terminal

---

## Project Structure (What Each Folder Does)

```
frontend/
├── App.tsx                    # 🎯 Entry point — where the app starts
├── app.json                   # ⚙️ App config (name, icon, colors)
├── package.json               # 📦 Dependencies list
│
├── src/
│   ├── theme/                 # 🎨 DESIGN SYSTEM
│   │   ├── colors.ts          #   → All colors (change brand color here!)
│   │   ├── typography.ts      #   → Font sizes & weights
│   │   └── spacing.ts         #   → Spacing, borders, shadows
│   │
│   ├── navigation/            # 🧭 NAVIGATION
│   │   ├── RootNavigator.tsx  #   → Controls Auth ↔ Main flow
│   │   ├── MainTabNavigator.tsx  → Bottom tab bar
│   │   └── types.ts           #   → TypeScript routes
│   │
│   ├── screens/               # 📱 ALL SCREENS
│   │   ├── auth/              #   → Login, Register, OTP
│   │   ├── home/              #   → Home dashboard
│   │   ├── ride/              #   → GoRide screens
│   │   ├── food/              #   → GoBite screens
│   │   └── profile/           #   → Profile & settings
│   │
│   ├── components/            # 🧩 REUSABLE PIECES
│   │   ├── Button.tsx         #   → Reusable button
│   │   ├── ServiceCard.tsx    #   → Service cards on home
│   │   └── WalletCard.tsx     #   → Wallet balance display
│   │
│   └── types/                 # 📝 DATA TYPES
│       └── index.ts           #   → User, Ride, Food, Wallet types
```

## How to Change the Brand Color

Open `src/theme/colors.ts` and change the first line:

```typescript
primary: '#00B14F',  // ← Change this hex code to change the whole app!
```

This updates every button, card, and accent across the entire app instantly.

---

## What's Next?

Tell me which screen you want to build next:
1. 🔐 **Register / OTP screens** (complete the auth flow)
2. 🍔 **Restaurant detail + Menu + Cart** (complete the food flow)
3. 🚗 **Ride searching + tracking** (complete the ride flow)
4. 💳 **SuperWallet screens** (top-up, transactions)
5. 🎨 **Adjust the design** (colors, layout, fonts)
