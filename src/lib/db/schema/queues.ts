import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Queue status enum
export const queueStatusEnum = pgEnum('queue_status', ['ACTIVE', 'INACTIVE', 'EXPIRED'])

// Queues table
export const queues = pgTable('queues', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
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
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Queue = typeof queues.$inferSelect
export type NewQueue = typeof queues.$inferInsert

// Import for references
import { counters } from './counters'
import { users } from './users'
