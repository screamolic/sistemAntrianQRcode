import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/index'

// Global type for hot-reload prevention
declare global {
  var dbClient: ReturnType<typeof postgres> | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create PostgreSQL client with SSL configuration for Supabase
const client = postgres(connectionString, {
  ssl: {
    rejectUnauthorized: false,
  },
  max: 4,
  idle_timeout: 30,
  connect_timeout: 5,
})

// Create Drizzle database instance
export const db = drizzle(client, { schema })

// Export client for manual queries if needed
export { client }

// Re-export all schema for convenience
export * from './schema/index'
