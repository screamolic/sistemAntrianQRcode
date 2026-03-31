# Database Configuration

## Supabase (Production & Local Development)

**Use Supabase connection string with connection pooling**

### Get Your Connection String

1. Go to https://supabase.com/dashboard
2. Create a new project (or select existing)
3. Go to **Settings** → **Database**
4. Copy **Connection String** (URI mode)
5. For production, use **Connection Pooling** (Settings → Database → Connection Pooling)

### Connection String Format

**Direct Connection (for migrations):**
```
postgresql://postgres.[project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Connection Pooling (for app runtime - recommended):**
```
postgresql://postgres.[project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres
```

---

## Environment Variables

### For Local Development with Supabase

```env
# Supabase Database (Connection Pooling - for app runtime)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@[host].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# NextAuth Configuration
AUTH_SECRET="your-auth-secret-here"
AUTH_URL="http://localhost:3000"

# Super Admin Emails
SUPER_ADMIN_EMAILS="your-email@example.com"

# Evolution-API (WhatsApp Notifications)
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="your-evolution-api-key"
EVOLUTION_INSTANCE_NAME="queue-automation"

# Cron Jobs
CRON_SECRET="your-cron-secret"
```

---

## Setup Steps

### 1. Create Supabase Project

```bash
# Visit https://supabase.com/dashboard
# Click "New Project"
# Choose:
# - Organization: Your org
# - Database Password: (save this securely)
# - Region: Choose closest to you
```

### 2. Update .env File

Copy your connection string from Supabase dashboard and update `.env`:

```env
DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-region.pooler.supabase.com:5432/postgres?pgbouncer=true"
```

**Important:** Use the **Transaction Mode** connection string (port 6543 or with `?pgbouncer=true`)

### 3. Run Prisma Migrations

```bash
# Install dependencies
npm install

# Run migrations to Supabase
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# (Optional) View database in Supabase dashboard
# https://supabase.com/dashboard/project/[your-project]/editor
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Supabase-Specific Configuration

### Prisma Schema Updates

The current schema is already compatible with Supabase. No changes needed.

### Connection Pooling

Supabase uses PgBouncer for connection pooling. Add these parameters to your `DATABASE_URL`:

```
?pgbouncer=true&connection_limit=1
```

This prevents connection exhaustion in serverless environments.

### Production Deployment (Vercel + Supabase)

1. **In Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Add `DATABASE_URL` with Supabase connection string
   - Use **Production** environment

2. **Use Connection Pooling:**
   - In Supabase: Settings → Database → Connection Pooling
   - Enable pooling
   - Copy the pooler connection string
   - Add to Vercel environment variables

3. **Deploy:**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

---

## Testing Supabase Connection

### Test with Prisma Studio

```bash
npx prisma studio
```

Opens at http://localhost:5555 - you should see your Supabase tables.

### Test with Direct Query

```bash
npx prisma db execute --stdin
```

Then paste:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    String @id @default(cuid())
  email String @unique
}
```

---

## Troubleshooting

### "Too many connections" error

- Use connection pooling (`?pgbouncer=true`)
- Add `connection_limit=1` to DATABASE_URL
- Check Supabase dashboard for active connections

### "SSL connection required"

Add `&sslmode=require` to your DATABASE_URL:
```
DATABASE_URL="postgresql://...?pgbouncer=true&sslmode=require"
```

### Migration fails

- Check connection string format
- Verify database password is correct
- Ensure Supabase project is active (not paused)
- Try direct connection (without pooling) for migrations only

---

## Supabase Free Tier Limits

- **Database Size:** 500 MB
- **Bandwidth:** 5 GB/month
- **API Requests:** Unlimited
- **Connection Pooling:** Included

Perfect for development and small production deployments.

---

## Next Steps

After setup:
1. ✅ Database connected to Supabase
2. ✅ Migrations run successfully
3. ✅ Dev server running
4. ✅ Test queue creation and management
5. Deploy to Vercel with same Supabase instance

---

**Supabase Dashboard:** https://supabase.com/dashboard  
**Docs:** https://supabase.com/docs
