# Local Testing Setup Options

## Current Status

- ✅ Code complete (all 6 phases)
- ✅ Tests written (Vitest + Playwright)
- ✅ Environment file created (`.env`)
- ❌ Docker not installed
- ❌ PostgreSQL not installed locally

---

## Option 1: Install Docker Desktop (Recommended for Full Testing)

**Download:** https://www.docker.com/products/docker-desktop/

**Steps:**
1. Download and install Docker Desktop for Windows
2. Start Docker Desktop
3. Run: `docker compose up -d`
4. Continue with setup below

**Pros:** Complete local environment, matches production
**Cons:** Requires installation, uses system resources

---

## Option 2: Use Vercel Postgres (Quick Cloud Option)

**Steps:**
1. Go to https://vercel.com/dashboard
2. Sign in with GitHub
3. Click "New Project" → Import your GitHub repo
4. Add Vercel Postgres:
   - Go to Storage → Create Database
   - Copy connection string
5. Update `.env`:
   ```env
   DATABASE_URL="your-vercel-connection-string"
   ```
6. Deploy to Vercel (automatic after push)

**Pros:** No local setup, production-ready
**Cons:** Requires Vercel account, cloud-based

---

## Option 3: Install PostgreSQL Locally

**Download:** https://www.postgresql.org/download/windows/

**Steps:**
1. Download PostgreSQL installer
2. Install (default port: 5432, password: remember it)
3. Create database:
   ```sql
   CREATE DATABASE queue_automation;
   ```
4. Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/queue_automation?schema=public"
   ```

**Pros:** Full control, no Docker overhead
**Cons:** Installation required, manual management

---

## Option 4: Quick UI Test Without Database (Frontend Only)

If you just want to see the UI without database:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **Visit:** http://localhost:3000

**Note:** The app will show errors when accessing database features, but you can see:
- Landing page
- Login/Signup forms (won't submit)
- UI components
- Dark mode toggle

---

## Recommended Path Forward

### For Full Testing:
**Install Docker Desktop** → Run `docker compose up -d` → Complete setup

### For Quick Demo:
**Use Vercel Postgres** → Deploy to Vercel → Test in production

### For UI Review Only:
**Run `npm run dev`** → Browse UI without database

---

## After Database is Ready

Once you have PostgreSQL running:

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Start dev server
npm run dev
```

Then test:
- http://localhost:3000/signup — Create account
- http://localhost:3000/dashboard — Create queue
- http://localhost:3000/queue/[id] — Queue page

---

## Test Credentials (After Setup)

Create your own account via signup, or use:
- Email: `test@example.com`
- Password: Create during signup

Super admin (read-only in database):
- Email: `admin@example.com` (set in `.env`)

---

## Need Help?

- Full guide: `QUICK_START.md`
- Deployment: `docs/VERCEL_DEPLOYMENT.md`
- Performance: `docs/PERFORMANCE.md`
