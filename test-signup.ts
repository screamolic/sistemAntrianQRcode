import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './src/lib/db/schema/users'
import bcrypt from 'bcryptjs'
import { createId } from '@paralleldrive/cuid2'

async function testSignup() {
  console.log('🧪 Testing Supabase connection & signup...\n')

  // Use connection pooler port 6543 directly
  const connectionString =
    'postgresql://postgres.lzfrvgplqwhmgtzkvima:gedanggoreng99@lzfrvgplqwhmgtzkvima.supabase.co:6543/postgres?sslmode=require'

  console.log('📡 Connecting to:', connectionString.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), '\n')

  // Parse connection string
  const dbConnectionString = connectionString.replace('?sslmode=require', '')

  const client = postgres(dbConnectionString, {
    ssl: { rejectUnauthorized: false },
    max: 10,
    idle_timeout: 20,
    connect_timeout: 15,
    prepare: false,
  })

  const db = drizzle(client)

  try {
    // Test database connection
    console.log('📡 Testing database connection...')
    const result = await db.select().from(users).limit(1)
    console.log('✅ Database connected!', result.length, 'users found\n')

    // Test create user
    console.log('👤 Creating test user...')
    const email = 'admin@example.com'

    // Check if exists
    const existing = await db
      .select()
      .from(users)
      .where((users) => users.email === email)
      .limit(1)
    if (existing.length > 0) {
      console.log('⚠️  User already exists!')
      console.log('✅ Database is working!\n')
      return
    }

    const id = createId()
    const passwordHash = await bcrypt.hash('admin123', 10)

    const [newUser] = await db
      .insert(users)
      .values({
        id,
        email,
        passwordHash,
        name: 'Test Admin',
        role: 'ADMIN',
      })
      .returning()

    console.log('✅ User created successfully!')
    console.log('   ID:', newUser.id)
    console.log('   Email:', newUser.email)
    console.log('   Name:', newUser.name)
    console.log('   Role:', newUser.role)
    console.log('\n🎉 Supabase connection is working!\n')
  } catch (error) {
    console.error('❌ Error:', error)
    console.error('\n💡 Connection issue detected\n')
  } finally {
    await client.end()
  }
}

testSignup()
