import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import './pg-config' // Configure SSL globally
import * as schema from './schema/index'

// Global type for hot-reload prevention
declare global {
  var dbPool: pg.Pool | undefined
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create PostgreSQL connection pool with SSL configuration for Supabase
const pool = new pg.Pool({
  connectionString,
  max: 4, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

// Create Drizzle database instance
export const db = drizzle(pool, { schema })

// Export pool for manual queries if needed
export { pool }

// Re-export all schema for convenience
export * from './schema/index'
