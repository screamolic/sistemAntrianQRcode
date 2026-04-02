import { pgTable, text, timestamp, pgEnum, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { queueEntries } from './queue-entries'
import { users } from './users'

// Notification type enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'WELCOME',
  'POSITION_UPDATE',
  'TURN_CALLED',
  'SERVICE_COMPLETED',
  'FEEDBACK_REQUEST',
])

// Notification status enum
export const notificationStatusEnum = pgEnum('notification_status', ['PENDING', 'SENT', 'FAILED'])

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  queueEntryId: text('queue_entry_id').references(() => queueEntries.id, { onDelete: 'cascade' }),
  queueId: text('queue_id').notNull(),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  phone: text('phone').notNull(),
  message: text('message').notNull(),
  status: notificationStatusEnum('status').notNull().default('PENDING'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const notificationsRelations = relations(notifications, ({ one }) => ({
  queueEntry: one(queueEntries, {
    fields: [notifications.queueEntryId],
    references: [queueEntries.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
