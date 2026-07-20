# 🇬🇭 GoZone - Ghana's Everyday Super-App

> **Mobility • Food Delivery • Digital Wallet**

GoZone is an all-in-one everyday super-app built specifically for West Africa (Ghana), unifying **ride-hailing**, **food ordering**, and **digital wallet payments** into a single, seamless mobile experience.

---

## 🌟 Key Features

### 🚗 GoRide (Ride Hailing)
- **Bolt-Inspired Interface**: Modern header, top service grid cards (**GoRide**, **GoBite**, **GoSend**), and prominent search.
- **60fps Draggable Bottom Sheet**: Fluid gesture-driven sliding sheet (`PanResponder` with native spring physics).
- **Professional Map Vehicles**: 3D top-down vehicle silhouettes flat-aligned to map roads with directional rotation.
- **Full Trip Lifecycle Simulation**: 
  - Pulsing radar driver search (3.5s)
  - Driver found notification (**Kwame Asante** • Toyota Vitz • `GW-4921-23`)
  - Live animated trip progression on map
  - Completed trip rating sheet & SuperWallet fare deduction summary.

### 🍔 GoBite (Food & Courier Delivery)
- **Restaurant Discovery**: Browse popular local restaurants, cuisines, and food items.
- **Cart & Checkout**: Pay instantly using **SuperWallet** balance.
- **4-Stage Delivery Tracking**:
  - *Order Placed* 📝
  - *Kitchen Preparing* 👨‍🍳
  - *Rider Picked Up & En Route* 🛵
  - *Order Delivered!* 🎉

### 💳 GoZone SuperWallet
- **Unified Balance**: Instant payments across ride hailing, food delivery, and transfers.
- **Financial Features**: Top-up wallet, withdraw, send money to friends, and view complete transaction history.

### 🎨 Design & Theme Engine
- **Dynamic Theme Switcher**: Full support for both **Sleek Light Mode** and **Vibrant Dark Mode**.
- **Local Ghanaian Formatting**: Phone prefix validation (`+233`), Ghanaian landmarks (*East Legon*, *Accra Mall*, *Kotoka Airport*), yellow license plate badges, and **GH₵** currency formatting.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React Native, Expo (TypeScript) |
| **State Management** | Zustand |
| **Navigation** | React Navigation (Native Stack + Bottom Tabs) |
| **Backend Framework** | Java 17, Spring Boot |
| **Real-time Messaging** | WebSockets |
| **Build Tools** | Maven, npm |

---

## 📁 Repository Structure

```text
GoZone/
├── frontend/               # React Native Expo Mobile Application
│   ├── src/
│   │   ├── components/     # Reusable UI Components (Icons, Buttons, Cards)
│   │   ├── screens/        # Screen Modules (Auth, Ride, Food, Wallet, Settings)
│   │   ├── navigation/     # React Navigation Navigators & Types
│   │   ├── store/          # Zustand State Stores (User, Socket)
│   │   ├── theme/          # Dynamic Design System & Color Tokens
│   │   └── services/       # API Services & Push Notification Manager
│   └── app.json
│
├── backend/                # Java Spring Boot Backend Server
│   ├── src/main/java/com/gozone/
│   │   ├── controller/     # REST Controllers (Ride, Order, Wallet, Auth)
│   │   ├── service/        # Business Logic & WebSocket Handlers
│   │   ├── entity/         # Database Entities
│   │   └── dto/            # Data Transfer Objects
│   └── pom.xml
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Java Development Kit (JDK 17+)](https://www.oracle.com/java/technologies/downloads/)
- [Apache Maven](https://maven.apache.org/)

### 1. Run Backend Server
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 2. Run Mobile Frontend
```bash
cd frontend
npm install
npm start
```
*Scan the QR code using the **Expo Go** app on iOS or Android.*

---

## 📄 License
This project is developed for demonstration and commercial application in Ghana. All rights reserved.
