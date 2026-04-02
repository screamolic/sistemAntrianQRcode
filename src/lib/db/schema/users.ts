import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'

// Role enum
export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'ADMIN', 'STAFF'])

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('STAFF'),
  counterId: text('counter_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
