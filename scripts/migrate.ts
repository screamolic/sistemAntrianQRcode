/**
 * Database migration runner using Drizzle ORM
 *
 * Usage:
 *   npx dotenv-cli -e .env.local -- npx tsx scripts/migrate.ts
 *   # or add to package.json scripts
 *
 * Requires: DATABASE_URL in .env.local
 * Note: For Supabase, use the direct connection URL (port 5432), not pooler (port 6543)
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { migrate } from 'drizzle-orm/postgres-js/migrator'

const connectionString =
  process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL?.replace(':6543', ':5432')

if (!connectionString) {
  console.error('❌ DATABASE_URL tidak ditemukan di .env.local')
  process.exit(1)
}

async function runMigration() {
  console.log('🔄 Menghubungkan ke database...')

  const sql = postgres(connectionString!, {
    ssl: { rejectUnauthorized: false },
    max: 1,
    prepare: false,
    connect_timeout: 30,
  })

  const db = drizzle(sql)

  console.log('🚀 Menjalankan migrasi...')

  try {
    await migrate(db, { migrationsFolder: './drizzle' })
    console.log('✅ Migrasi berhasil!')
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    if (err?.message?.includes('already exists')) {
      console.log('ℹ️  Skema sudah ada — tidak ada migrasi baru.')
    } else {
      console.error('❌ Migrasi gagal:', err?.message ?? error)
      process.exit(1)
    }
  } finally {
    await sql.end()
    console.log('🏁 Selesai.')
  }
}

runMigration()
