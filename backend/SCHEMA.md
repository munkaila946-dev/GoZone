# 🗄️ GoZone Database Schema

## Overview
This document describes the database tables for GoZone.

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│    users     │────<│   wallets    │────<│  transactions   │
│              │     │              │     │                 │
│ id           │     │ id           │     │ id              │
│ name         │     │ user_id (FK) │     │ wallet_id (FK)  │
│ phone        │     │ balance      │     │ type (C/D)      │
│ email        │     │ is_active    │     │ category        │
│ password     │     └──────────────┘     │ amount          │
│ role         │                          │ description     │
└──────┬───────┘                          │ status          │
       │                                  └─────────────────┘
       │
       ├────<┌──────────────┐
       │     │    rides     │
       │     │              │
       │     │ id           │
       │     │ rider_id(FK) │
       │     │ driver_id(FK)│
       │     │ status       │
       │     │ ride_type    │
       │     │ fare         │
       │     │ pickup_*     │
       │     │ dest_*       │
       │     └──────────────┘
       │
       ├────<┌──────────────┐     ┌──────────────┐     ┌──────────────┐
       │     │   orders     │────<│ order_items  │     │  menu_items  │
       │     │              │     │              │     │              │
       │     │ id           │     │ id           │     │ id           │
       │     │ user_id (FK) │     │ order_id(FK) │     │ restaurant_id│
       │     │ restaurant_id│     │ menu_item_id │     │ name         │
       │     │ status       │     │ quantity     │     │ price        │
       │     │ order_type   │     │ price        │     │ category     │
       │     │ total        │     └──────────────┘     └──────┬───────┘
       │     │ delivery_fee │                                  │
       │     └──────────────┘                  ┌──────────────┐│
       │                                       │ restaurants  ││
       │                                       │              ││
       │                                       │ id           ││
       │                                       │ name         ││
       │                                       │ rating       │
       │                                       │ is_open      │
       │                                       └──────────────┘
       │
       └────<┌──────────────────────┐
             │ saved_locations      │
             │                      │
             │ id                   │
             │ user_id (FK)         │
             │ label (Home/Work)    │
             │ address              │
             │ latitude             │
             │ longitude            │
             └──────────────────────┘
```

## Tables Summary

| Table | Purpose |
|-------|---------|
| `users` | All users (riders, drivers, restaurant owners, admins) |
| `wallets` | Each user has one wallet for SuperWallet |
| `transactions` | All wallet transactions (top-ups, rides, food, transfers) |
| `restaurants` | Restaurant directory for GoBite |
| `menu_items` | Food items belonging to restaurants |
| `orders` | Food orders from GoBite |
| `order_items` | Individual items within an order |
| `rides` | Ride records from GoRide |
| `saved_locations` | User's saved addresses (Home, Work, etc.) |
