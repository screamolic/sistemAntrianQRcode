import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

// Counters table
export const counters = pgTable('counters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  adminId: text('admin_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Counter = typeof counters.$inferSelect
export type NewCounter = typeof counters.$inferInsert

// Import users for the reference
import { users } from './users'
