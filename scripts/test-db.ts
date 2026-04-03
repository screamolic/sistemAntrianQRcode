import postgres from 'postgres'

// Try direct connection (port 5432)
const directUrl =
  'postgresql://postgres:9tmvdY1IaM91YMcK@db.lzfrvgplqwhmgtzkvima.supabase.co:5432/postgres'

// Try pooler connection (port 6543)
const poolerUrl =
  'postgresql://postgres.lzfrvgplqwhmgtzkvima:9tmvdY1IaM91YMcK@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'

async function tryConnect(name: string, url: string) {
  const sql = postgres(url, { max: 1, connect_timeout: 10 })
  try {
    const result = await sql`SELECT 1 as test`
    console.log(`✅ ${name}: Connected!`, JSON.stringify(result))

    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `
    console.log(`   📋 Tables:`, tables.map((t) => t.tablename).join(', ') || '(none yet)')
    return true
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    console.log(`❌ ${name}: ${message}`)
    return false
  } finally {
    await sql.end()
  }
}

async function test() {
  console.log('Testing database connections...\n')

  const directOk = await tryConnect('Direct (5432)', directUrl)
  if (!directOk) {
    await tryConnect('Pooler (6543)', poolerUrl)
  }
}

test()
