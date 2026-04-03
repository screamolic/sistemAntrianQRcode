import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // Auth
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  AUTH_URL: z.string().url('AUTH_URL must be a valid URL').optional(),

  // Super Admin
  SUPER_ADMIN_EMAILS: z.string().optional(),

  // Evolution API (optional in dev)
  EVOLUTION_API_URL: z.string().url().optional(),
  EVOLUTION_API_KEY: z.string().optional(),
  EVOLUTION_INSTANCE_NAME: z.string().optional(),

  // Cron
  CRON_SECRET: z.string().optional(),

  // Node
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ Invalid environment variables:')
    result.error.issues.forEach((issue: z.ZodIssue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`)
    })
    throw new Error('Invalid environment variables — check .env.local')
  }

  return result.data
}

// Validate and export typed env
export const env = validateEnv()

// Type-safe env access
export type Env = z.infer<typeof envSchema>
