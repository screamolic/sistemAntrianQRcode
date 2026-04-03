import 'dotenv/config'
import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL!.replace(':6543', ':5432')

console.log('Testing session pooler:', connectionString.substring(0, 30) + '...')
const sql = postgres(connectionString, { ssl: 'require', max: 1 })

sql`CREATE SCHEMA IF NOT EXISTS "drizzle_test"`
  .then((res) => {
    console.log('SUCCESS', res)
    process.exit(0)
  })
  .catch((err) => {
    console.error('ERROR', err)
    process.exit(1)
  })
