# Database Setup Guide

## Prerequisites

You need PostgreSQL installed locally or Docker to run the database.

## Option 1: Using Docker (Recommended)

1. Make sure Docker Desktop is installed and running
2. Start the PostgreSQL container:
   ```bash
   docker compose up -d
   ```
3. Wait for the database to be ready (about 10 seconds)
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

## Option 2: Local PostgreSQL Installation

1. Install PostgreSQL from https://www.postgresql.org/download/
2. Create a database:
   ```sql
   CREATE DATABASE queue_automation;
   ```
3. Update `.env` file with your connection string:
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/queue_automation?schema=public"
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

## Option 3: Vercel Postgres (Production)

1. Go to https://vercel.com/dashboard
2. Create a new Vercel Postgres database
3. Copy the connection string
4. Update `.env` file:
   ```
   DATABASE_URL="your-vercel_postgres_connection_string"
   ```
5. Run Prisma migrations:
   ```bash
   npx prisma migrate deploy
   ```

## Verify Setup

After setup, verify the database is working:

```bash
npx prisma studio
```

This opens a web UI at http://localhost:5555 where you can view your database.

## Troubleshooting

### "Can't resolve '.prisma/client/default'"

Run `npx prisma generate` to generate the Prisma Client.

### Connection refused

Make sure PostgreSQL is running:
- Docker: `docker compose ps`
- Local: Check PostgreSQL service status

### Authentication failed

Check your `.env` file has the correct username and password.

## Next Steps

After database setup:
1. Create your first admin user via the signup page
2. Set `SUPER_ADMIN_EMAILS` in `.env` to grant super admin role
3. Start creating queues!
