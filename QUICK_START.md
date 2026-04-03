# Quick Start — Local Testing

## Prerequisites Check

Make sure you have:

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Docker Desktop installed and running
- [ ] Git credentials configured

---

## Step 1: Set Up Environment Variables

Copy the example env file:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Or manually create .env file with this content:
```

**.env file:**

```env
# Database (Docker PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/queue_automation?schema=public"

# NextAuth - Generate secret with: openssl rand -base64 32
# Or use this temporary one for testing:
AUTH_SECRET="test-secret-change-in-production-abc123xyz"
AUTH_URL="http://localhost:3000"

# Super Admin
SUPER_ADMIN_EMAILS="admin@example.com"

# Evolution-API (optional for testing without WhatsApp)
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="test-key"
EVOLUTION_INSTANCE_NAME="queue-automation"

# Cron Secret
CRON_SECRET="test-cron-secret"
```

---

## Step 2: Start PostgreSQL Database

```bash
# Start Docker PostgreSQL
docker compose up -d

# Wait 10 seconds for database to be ready
# Verify it's running:
docker compose ps
```

You should see:

```
NAME                STATUS
queue-automation-postgres-1   Up (healthy)
```

---

## Step 3: Run Prisma Migrations

```bash
# Install dependencies (if not already done)
npm install

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

This creates:

- User table (for authentication)
- Queue table (for queue management)
- QueueEntry table (for people in queue)
- Notification table (for WhatsApp tracking)

---

## Step 4: Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 5: Test the Application

### Create Test Account

1. Go to http://localhost:3000/signup
2. Create an account:
   - Email: `test@example.com`
   - Password: `password123`

### Create a Queue

1. After login, click "Create Queue"
2. Enter a queue name (e.g., "Test Queue")
3. Click "Create"
4. You'll be redirected to `/queue/[queueId]`

### Test QR Code

1. The QR code displays on the queue page
2. Click "Download" to save as PNG
3. Click "Share" to copy the queue URL

### Join Queue (User Flow)

1. Open the queue URL in a new incognito window
2. Fill in the join form:
   - First Name: `John`
   - Last Name: `Doe`
   - Phone: `081234567890` (Indonesian format)
3. Click "Join Queue"
4. You should see your position number

### Admin Dashboard

1. Go back to admin view (logged in)
2. You should see the queue entry in real-time
3. Click "Call Next" to mark the person as served
4. The entry should be removed and positions updated

---

## Step 6: Run Tests

### Unit Tests

```bash
npm run test:run
```

Expected output: All tests passing (20+ tests)

### E2E Tests (requires dev server running)

```bash
# Start dev server in one terminal
npm run dev

# Run E2E tests in another terminal
npm run test:e2e
```

This runs Playwright tests for:

- Authentication flow (signup, login)
- Queue management (create, join, call next)

---

## Troubleshooting

### "Can't connect to database"

1. Check Docker is running: `docker compose ps`
2. Verify connection: `docker compose logs postgres`
3. Restart if needed: `docker compose down && docker compose up -d`

### "Prisma Client not found"

Run: `npx prisma generate`

### "Port 3000 already in use"

Change port in package.json:

```json
"dev": "next dev -p 3001"
```

### Evolution-API errors (WhatsApp not configured)

This is normal for local testing without WhatsApp. The app will:

- Log errors to console
- Continue working without notifications
- Show notification status in admin panel

To fully test WhatsApp:

1. Run Evolution-API: `docker-compose -f docker-compose.evolution.yml up -d`
2. Visit http://localhost:8080/manager
3. Scan QR code to pair WhatsApp
4. Update `.env` with correct API key

---

## Next Steps

After local testing:

1. ✅ All features working
2. ✅ Tests passing
3. ✅ Database migrations successful

Then deploy to production:

- See `docs/VERCEL_DEPLOYMENT.md`

---

**Need help?** Check the full documentation in `/docs` folder.
