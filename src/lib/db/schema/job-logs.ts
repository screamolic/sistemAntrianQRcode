import { pgTable, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core'
import { createId } from '@paralleldrive/cuid2'

// Job status enum
export const jobStatusEnum = pgEnum('job_status', ['RUNNING', 'COMPLETED', 'FAILED'])

// Job logs table
export const jobLogs = pgTable('job_logs', {
  id: text('id')
    .$defaultFn(() => createId())
    .primaryKey(),
  jobType: text('job_type').notNull(),
  status: jobStatusEnum('status').notNull(),
  message: text('message'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata'),
})

export type JobLog = typeof jobLogs.$inferSelect
export type NewJobLog = typeof jobLogs.$inferInsert
