import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Role enum — 3 roles: SUPER_ADMIN, ADMIN, STAFF
export const roleEnum = pgEnum('role', ['SUPER_ADMIN', 'ADMIN', 'STAFF'])

// Users table
export const users = pgTable('users', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text('name'),
  username: text('username').unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: roleEnum('role').notNull().default('STAFF'),
  counterId: text('counter_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
