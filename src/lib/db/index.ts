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

// Check if this is a local connection (no SSL needed)
const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1')

// Create PostgreSQL client
const client = postgres(connectionString, {
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
})

// Create Drizzle database instance
export const db = drizzle(client, { schema })

// Export client for manual queries if needed
export { client }

// Re-export all schema for convenience
export * from './schema/index'
