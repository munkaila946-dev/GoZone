# ⚙️ GoZone Backend Setup Guide

## Prerequisites — Install These First

### 1. Install Java 17 (Required for Spring Boot 3)

**Windows:**
- Download from https://adoptium.net/ (Eclipse Temurin JDK 17)
- Choose "JDK 17 - LTS" → Windows x64 → .msi installer
- Run the installer (check "Set JAVA_HOME variable")

**Mac:**
```bash
brew install openjdk@17
```

**Verify installation:**
```bash
java -version
# Should show: openjdk version "17.x.x"
```

### 2. Install PostgreSQL

**Windows:**
- Download from https://www.postgresql.org/download/windows/
- Run installer, set password to `postgres` (or remember what you set)
- Keep default port: 5432

**Mac:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**After installing, create the database:**
```sql
-- Open pgAdmin or psql, then run:
CREATE DATABASE gozone_db;
```

Or via command line:
```bash
psql -U postgres -c "CREATE DATABASE gozone_db;"
```

### 3. Install Maven (Build Tool)

**Windows:**
- Download from https://maven.apache.org/download.cgi
- Extract to `C:\Program Files\Apache\maven`
- Add to PATH environment variable

**Mac:**
```bash
brew install maven
```

**Verify:**
```bash
mvn -version
```

---

## Running the Backend

### Step 1: Update database credentials (if different from defaults)

Open `src/main/resources/application.yml` and update:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gozone_db
    username: postgres
    password: your_password_here  # ← Change this to your PostgreSQL password
```

### Step 2: Build and Run

**Option A — Using Maven:**
```bash
cd GoZone/backend
mvn spring-boot:run
```

**Option B — Build JAR then run:**
```bash
cd GoZone/backend
mvn clean package
java -jar target/gozone-backend-1.0.0.jar
```

### Step 3: Verify it's running

Open your browser and go to:
```
http://localhost:8080/api/restaurants
```

You should see JSON with restaurant data! 🎉

---

## What Happens on First Run

1. ✅ Spring Boot starts
2. ✅ Connects to PostgreSQL
3. ✅ Creates all database tables automatically
4. ✅ Seeds test data (user, restaurants, menu items)
5. ✅ API is ready at `http://localhost:8080`

## Console Output on Success
```
🌱 Seeding initial data...
✅ Data seeding complete!
   📧 Test user: kwame@example.com
   📱 Test phone: 0241234567
   🔑 Test password: password123
   💰 Wallet balance: GH₵1,250.00
```

---

## Testing the API

### Using a Browser
- `http://localhost:8080/api/restaurants` — Works directly!

### Using VS Code Thunder Client
1. Install "Thunder Client" extension in VS Code
2. Create a new request
3. Method: POST, URL: `http://localhost:8080/api/auth/login`
4. Body (JSON):
   ```json
   {
     "phone": "0241234567",
     "password": "password123"
   }
   ```
5. Send! You'll get a JWT token back.

### Using Postman
1. Download Postman from https://postman.com
2. Import the collection or create requests manually

---

## Troubleshooting

### "Connection refused" / Port 8080 in use
Change the port in `application.yml`:
```yaml
server:
  port: 8081  # Change to any free port
```

### "Unable to connect to PostgreSQL"
1. Verify PostgreSQL is running
2. Check credentials in `application.yml`
3. Verify database `gozone_db` exists

### "JAVA_HOME not set"
Set it manually:
- **Windows:** System Properties → Environment Variables → New
  - Variable: `JAVA_HOME`, Value: `C:\Program Files\Java\jdk-17`
- **Mac:** Add to `~/.zshrc`: `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`

### Tables not being created
Ensure `ddl-auto` is set in `application.yml`:
```yaml
jpa:
  ddl-auto: update  # or create-drop for development
```
