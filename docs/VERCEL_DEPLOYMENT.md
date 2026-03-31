# Vercel Deployment Guide

## Overview

This guide covers deploying the Queue Automation system to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally with `npm i -g vercel`
3. **Environment Variables**: All required variables must be configured

## Environment Variables

Set these in Vercel Dashboard (Project Settings → Environment Variables):

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | NextAuth.js secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Application URL | `https://your-app.vercel.app` |
| `EVOLUTION_API_URL` | Evolution-API instance URL | `http://your-vps:8080` |
| `EVOLUTION_API_KEY` | Evolution-API authentication key | `your-api-key` |
| `WHATSAPP_INSTANCE_ID` | Evolution-API instance ID | `queue-notifications` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public app URL for queue links | `http://localhost:3000` |
| `NODE_ENV` | Node environment | `production` |

## Deployment Steps

### 1. Connect Repository to Vercel

```bash
# Login to Vercel
vercel login

# Link project
vercel link
```

### 2. Configure Environment Variables

```bash
# Set each variable
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
# ... repeat for all variables
```

Or set them in the Vercel Dashboard.

### 3. Deploy

```bash
# Preview deployment
vercel --env preview

# Production deployment
vercel --prod
```

### 4. Run Database Migrations

After deployment, run Prisma migrations:

```bash
# Connect to Vercel Postgres or your database
npx prisma migrate deploy
```

## GitHub Integration

For automatic deployments:

1. Go to Vercel Dashboard
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Click "Deploy"

Vercel will automatically deploy on every push to `main` branch.

## Cron Jobs

The following cron jobs are configured in `vercel.json`:

| Path | Schedule | Description |
|------|----------|-------------|
| `/api/cron/daily-cleanup` | Daily at 2:00 AM | Deletes expired queues |
| `/api/cron/retry-notifications` | Every hour | Retries failed notifications |

## Monitoring

### View Deployment Logs

```bash
vercel logs
```

### View Build Logs

Navigate to Vercel Dashboard → Deployments → Select deployment → View Build Logs

### Health Check

Create a health check endpoint at `/api/health` and monitor it.

## Rollback

To rollback to a previous deployment:

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

## Performance Optimization

### 1. Enable Edge Functions

For API routes that benefit from edge computing:

```typescript
// In your API route
export const runtime = 'edge'
```

### 2. Configure ISR

For static pages with incremental static regeneration:

```typescript
// In your page component
export const revalidate = 300 // Revalidate every 5 minutes
```

### 3. Image Optimization

Use Next.js Image component for automatic optimization:

```tsx
import Image from 'next/image'
<Image src="/logo.png" alt="Logo" width={200} height={100} />
```

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Run `npm run build` locally to reproduce
3. Ensure all environment variables are set

### Runtime Errors

1. Check function logs: `vercel logs`
2. Verify database connection
3. Check Evolution-API connectivity

### Cron Jobs Not Running

1. Verify cron paths are correct
2. Check Vercel project settings for cron configuration
3. Review cron endpoint logs

## Cost Management

- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month for commercial projects
- Monitor usage in Vercel Dashboard

## Security Best Practices

1. Never commit `.env` files
2. Use Vercel Secrets for sensitive data
3. Enable Vercel WAF for production
4. Set up custom domains with HTTPS
5. Configure CORS properly

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)
