# Supabase Connection Troubleshooting

## Issue

Your current DATABASE_URL is not connecting. This is usually because:
1. Project ref is incorrect
2. Database is paused
3. Connection string format is wrong

---

## Get Correct Connection String

### Step 1: Log into Supabase Dashboard

Go to: https://supabase.com/dashboard

### Step 2: Select Your Project

Click on your queue automation project (or create a new one)

**If project is paused:**
- You'll see "Resume Database" button
- Click it and wait ~2 minutes for database to start

### Step 3: Get Connection String

1. Go to **Settings** (left sidebar) → **Database**
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string

It should look like:
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Step 4: Update .env File

Paste your connection string into `.env`:

```env
DATABASE_URL="postgresql://postgres.xxxxx:your-password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Important:** Replace `[YOUR-PASSWORD]` with your actual database password!

---

## Test Connection

After updating `.env`, run:

```bash
npx prisma db pull
```

If successful, you'll see your database schema.

Then run migrations:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Common Issues

### "Can't reach database server"

**Solution:** Database is paused - resume it from Supabase dashboard

### "Password authentication failed"

**Solution:** Update password in connection string (check Supabase dashboard → Settings → Database)

### "SSL connection required"

**Solution:** Add `?sslmode=require` to connection string

### "Too many connections"

**Solution:** Use pooler connection string (port 6543 with `?pgbouncer=true`)

---

## Quick Fix: Create New Project

If your current project has issues:

1. Go to https://supabase.com/dashboard/new
2. Create new project:
   - Name: `queue-automation`
   - Password: (save this!)
   - Region: Southeast Asia (Singapore)
3. Wait 2 minutes for setup
4. Copy connection string from Settings → Database
5. Update `.env`
6. Run migrations

---

## Need Help?

**Supabase Status:** https://status.supabase.com  
**Supabase Docs:** https://supabase.com/docs  
**Discord Support:** https://discord.supabase.com
