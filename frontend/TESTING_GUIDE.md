# 📱 How to Run GoZone on Your Phone (Expo Go)

## Prerequisites — Install These First

### 1. Install Node.js
   - Go to https://nodejs.org
   - Download and install the **LTS version** (v20+)
   - Verify it works: open **Terminal** (Mac) or **Command Prompt** (Windows) and type:
     ```bash
     node -v
     ```
     You should see something like `v20.x.x`

### 2. Install Expo Go on Your Phone
   - **iPhone**: Search "Expo Go" in the **App Store**
   - **Android**: Search "Expo Go" in the **Google Play Store**
   - Download and install it (it's free!)

---

## Step-by-Step Instructions

### Step 1: Open Your Terminal
   - **Mac**: Open the **Terminal** app (Cmd + Space → type "Terminal")
   - **Windows**: Open **Command Prompt** or **PowerShell**

### Step 2: Navigate to the Project Folder
```bash
cd path/to/GoZone/frontend
```
*(Replace `path/to/` with wherever you saved the GoZone folder)*

### Step 3: Install Dependencies (Only Needed Once)
```bash
npm install
```
Wait for it to finish. You'll see "added XXX packages".

### Step 4: Start the App
```bash
npx expo start
```

This will:
- Start the Expo development server
- Show a **QR code** in your terminal
- Open Expo Dev Tools in your browser

### Step 5: Connect Your Phone

**For Android:**
1. Open the **Expo Go** app on your phone
2. Tap **"Scan QR code"**
3. Point your camera at the QR code in the terminal
4. The app loads! 🎉

**For iPhone:**
1. Open your phone's **Camera app**
2. Point it at the QR code in the terminal
3. A notification pops up — tap **"Open in Expo Go"**
4. The app loads! 🎉

> ⚠️ **Important**: Your phone and computer must be on the **same WiFi network**!

---

## Troubleshooting

### "Unable to connect" / App won't load
1. Make sure phone and computer are on **the same WiFi**
2. Try starting with tunnel mode:
   ```bash
   npx expo start --tunnel
   ```
   *(This works even on different networks)*

### QR code won't scan
1. In the terminal, press **`s`** to switch to **Expo Go** mode
2. Or press **`w`** to open in your web browser instead

### "Command not found: expo"
1. Install Expo CLI globally:
   ```bash
   npm install -g expo-cli
   ```
2. Then try `npx expo start` again

### App loads but shows a red error screen
1. Read the error message (it usually tells you the problem)
2. Press **`r`** in the terminal to reload the app
3. Press **`c`** to clear the cache and restart

### Bundle is taking too long
1. Just wait — the first load takes 1-2 minutes
2. Press **`r`** to reload if it gets stuck

---

## Terminal Keyboard Shortcuts

While the Expo server is running, you can press these keys:

| Key | Action |
|-----|--------|
| `r` | Reload the app |
| `s` | Switch to Expo Go |
| `a` | Open on Android emulator |
| `i` | Open on iOS simulator (Mac only) |
| `w` | Open in web browser |
| `c` | Clear cache & restart |
| `q` | Show QR code again |
| `?` | Show all commands |

---

## What to Test

Once the app loads, try these flows:

1. **🔐 Login** — Tap "Continue" (it auto-logs in for now)
2. **🏠 Home** — See the dark dashboard with wallet card
3. **🎨 Themes** — Profile → Appearance → Try all 4 themes!
4. **🚗 GoRide** — Go to Ride tab → Enter destination → Tap "Confirm Ride" → Watch the radar animation!
5. **🍔 GoBite** — Go to Food tab → Tap a restaurant → Add items → View cart → Place order → Watch order tracking!
6. **💳 Wallet** — From Home, tap SuperWallet → Top Up → Transactions → Send Money

---

## Stopping the Server

To stop the Expo server, press **`Ctrl + C`** in the terminal.
