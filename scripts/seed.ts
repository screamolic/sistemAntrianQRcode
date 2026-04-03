/**
 * Database seed script — creates initial super admin account
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *   # atau
 *   npx ts-node scripts/seed.ts
 *
 * Requires: DATABASE_URL dan SUPER_ADMIN_EMAILS di .env.local
 */

import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from '../src/lib/db/schema/users'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'

const connectionString =
  process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL?.replace(':6543', ':5432')

if (!connectionString) {
  console.error('❌ DATABASE_URL belum dikonfigurasi di .env.local')
  process.exit(1)
}

const client = postgres(connectionString, {
  ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
  max: 1,
  prepare: false, // Required for Supabase pooler
})

const db = drizzle(client, { schema: { users } })

async function seed() {
  console.log('🌱 Memulai seeding database...\n')

  // Get super admin emails from env
  const superAdminEmails = process.env.SUPER_ADMIN_EMAILS?.split(',').map((e) => e.trim()) ?? []

  if (superAdminEmails.length === 0) {
    console.log(
      '⚠️  SUPER_ADMIN_EMAILS tidak dikonfigurasi. Menggunakan default: superadmin@example.com'
    )
    superAdminEmails.push('superadmin@example.com')
  }

  // Default password untuk seed
  const DEFAULT_PASSWORD = 'Admin123!' // Harus diganti setelah login pertama
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12)

  let createdCount = 0
  let skippedCount = 0

  for (const email of superAdminEmails) {
    const normalizedEmail = email.toLowerCase()

    // Check if already exists
    const existing = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1)

    if (existing.length > 0) {
      console.log(`  ⏭  Dilewati: ${normalizedEmail} (sudah ada)`)
      skippedCount++
      continue
    }

    // Create super admin
    await db.insert(users).values({
      id: createId(),
      name: 'Super Admin',
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
    })

    console.log(`  ✓  Dibuat: ${normalizedEmail} (SUPER_ADMIN)`)
    createdCount++
  }

  console.log('\n📊 Hasil seeding:')
  console.log(`   Dibuat: ${createdCount} akun`)
  console.log(`   Dilewati: ${skippedCount} akun (sudah ada)`)

  if (createdCount > 0) {
    console.log('\n🔑 Password default untuk akun baru: Admin123!')
    console.log('   ⚠️  PENTING: Ganti password setelah login pertama!')
  }

  console.log('\n✅ Seeding selesai!')
}

seed()
  .catch((error) => {
    console.error('❌ Seeding gagal:', error)
    process.exit(1)
  })
  .finally(async () => {
    await client.end()
  })
