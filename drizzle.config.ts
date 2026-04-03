import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Session pooler (5432) or direct URL is required for Push/Migrations
    // We auto-replace transaction pooler port 6543 -> 5432 (Session pool) so it works out of the box
    url: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL!.replace(':6543', ':5432'),
  },
})
