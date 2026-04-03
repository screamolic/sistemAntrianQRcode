import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Entry status enum
export const entryStatusEnum = pgEnum('entry_status', ['WAITING', 'SERVED', 'COMPLETED', 'NO_SHOW'])

// Queue entries table
export const queueEntries = pgTable('queue_entries', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  queueId: text('queue_id')
    .notNull()
    .references(() => queues.id, { onDelete: 'cascade' }),
  customerPhone: text('customer_phone').notNull(),
  customerName: text('customer_name'),
  position: integer('position').notNull(),
  status: entryStatusEnum('status').notNull().default('WAITING'),
  calledAt: timestamp('called_at', { withTimezone: true }),
  servedAt: timestamp('served_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type QueueEntry = typeof queueEntries.$inferSelect
export type NewQueueEntry = typeof queueEntries.$inferInsert

// Import for references
import { queues } from './queues'
