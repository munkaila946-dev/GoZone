# 📡 GoZone API Documentation

Base URL: `http://localhost:8080`

## Authentication

All protected endpoints require a JWT token in the header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Auth Endpoints (Public — No Login Required)

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ama Owusu",
  "phone": "0244567890",
  "email": "ama@example.com",     // optional
  "password": "mypassword"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOi...",
    "userId": 1,
    "name": "Ama Owusu",
    "phone": "0244567890",
    "role": "CUSTOMER",
    "walletBalance": 0.0
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "0241234567",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

---

## 🍔 Restaurant Endpoints (Public — No Login Required)

### Get All Restaurants
```http
GET /api/restaurants
```

### Get Open Restaurants Only
```http
GET /api/restaurants/open
```

### Get Single Restaurant
```http
GET /api/restaurants/1
```

### Get Restaurant Menu
```http
GET /api/restaurants/1/menu
```

---

## 💳 Wallet Endpoints (Protected — Requires Login)

### Get Wallet Balance
```http
GET /api/wallet
Authorization: Bearer <token>
```

### Get All Transactions
```http
GET /api/wallet/transactions
Authorization: Bearer <token>
```

### Get Transactions by Type
```http
GET /api/wallet/transactions/type/CREDIT
GET /api/wallet/transactions/type/DEBIT
Authorization: Bearer <token>
```

### Top Up Wallet
```http
POST /api/wallet/topup
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100,
  "description": "MTN MoMo top-up",
  "reference": "PSK_123456789"
}
```

### Transfer Money
```http
POST /api/wallet/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientPhone": "0244567890",
  "amount": 50,
  "note": "Lunch money"
}
```

---

## 🧪 Quick Test (Without the App)

You can test these APIs using **Postman**, **Thunder Client** (VS Code), or **curl**.

### Test Login with seeded data:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0241234567","password":"password123"}'
```

### Test Get Restaurants:
```bash
curl http://localhost:8080/api/restaurants
```

### Test Top-Up (replace TOKEN with your JWT):
```bash
curl -X POST http://localhost:8080/api/wallet/topup \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":100,"description":"MTN MoMo","reference":"TEST123"}'
```

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | All users (riders, drivers, restaurant owners, admins) |
| `wallets` | One wallet per user |
| `transactions` | All wallet transactions |
| `restaurants` | Restaurant directory |
| `menu_items` | Food items |
| `orders` | Food orders |
| `order_items` | Items within an order |
| `rides` | Ride records |
| `saved_locations` | User's saved addresses |

## 🌱 Seeded Test Data

| Field | Value |
|-------|-------|
| **Phone** | `0241234567` |
| **Password** | `password123` |
| **Name** | Kwame Mensah |
| **Wallet Balance** | GH₵1,250.00 |
| **Restaurants** | Papaye, Pizza Hut, KFC |
