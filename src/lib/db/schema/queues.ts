import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { counters } from './counters'
import { users } from './users'
import { queueEntries } from './queue-entries'

// Queue status enum
export const queueStatusEnum = pgEnum('queue_status', ['ACTIVE', 'INACTIVE', 'EXPIRED'])

// Queues table
export const queues = pgTable('queues', {
  id: text('id').primaryKey(),
  counterId: text('counter_id')
    .notNull()
    .references(() => counters.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  adminId: text('admin_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: queueStatusEnum('status').notNull().default('ACTIVE'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const queuesRelations = relations(queues, ({ one, many }) => ({
  counter: one(counters, {
    fields: [queues.counterId],
    references: [counters.id],
  }),
  admin: one(users, {
    fields: [queues.adminId],
    references: [users.id],
  }),
  entries: many(queueEntries),
}))

export type Queue = typeof queues.$inferSelect
export type NewQueue = typeof queues.$inferInsert
