import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './users'
import { queues } from './queues'

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

export const countersRelations = relations(counters, ({ one, many }) => ({
  admin: one(users, {
    fields: [counters.adminId],
    references: [users.id],
  }),
  queues: many(queues),
}))

export type Counter = typeof counters.$inferSelect
export type NewCounter = typeof counters.$inferInsert
