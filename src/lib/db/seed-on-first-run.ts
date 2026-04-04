/**
 * Auto-seed default superuser on first run.
 *
 * Called once when the app starts. If no users exist in the database,
 * it creates a default SUPER_ADMIN account.
 *
 * Default credentials (configurable via .env):
 *   Username: admin  (DEFAULT_ADMIN_USERNAME)
 *   Password: Admin123!  (DEFAULT_ADMIN_PASSWORD)
 *   Name: Administrator  (DEFAULT_ADMIN_NAME)
 *   Email: admin@antrian.local  (DEFAULT_ADMIN_EMAIL)
 */

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema/users'
import { count } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'

const DEFAULT_USERNAME = process.env.DEFAULT_ADMIN_USERNAME || 'admin'
const DEFAULT_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!'
const DEFAULT_NAME = process.env.DEFAULT_ADMIN_NAME || 'Administrator'
const DEFAULT_EMAIL = process.env.DEFAULT_ADMIN_EMAIL || 'admin@antrian.local'

let seeded = false

export async function seedDefaultSuperuser() {
  if (seeded) return
  seeded = true

  try {
    // Check if any users exist
    const [{ total }] = await db.select({ total: count() }).from(users)

    if (total > 0) {
      return // Users already exist, no seeding needed
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12)

    await db.insert(users).values({
      id: createId(),
      username: DEFAULT_USERNAME.toLowerCase(),
      name: DEFAULT_NAME,
      email: DEFAULT_EMAIL.toLowerCase(),
      passwordHash: hashedPassword,
      role: 'SUPER_ADMIN',
    })

    console.log('🌱 Default superuser created:')
    console.log(`   Username: ${DEFAULT_USERNAME}`)
    console.log(`   Password: ${DEFAULT_PASSWORD}`)
    console.log('   ⚠️  Change password after first login!')
  } catch (error) {
    // Don't crash the app if seeding fails (e.g., DB not ready yet)
    console.error('⚠️  Auto-seed failed (will retry on next request):', error)
    seeded = false // Allow retry
  }
}
