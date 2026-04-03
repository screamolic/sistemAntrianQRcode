import { z } from 'zod'

export const joinQueueSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters'),

  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be at most 20 characters')
    .refine((phone) => {
      // Accept Indonesian WhatsApp formats: +62, 62, 08
      const cleaned = phone.replace(/[\s\-\(\)]/g, '')
      return /^(\+62|62|08)[0-9]{8,12}$/.test(cleaned)
    }, 'Phone must be valid Indonesian WhatsApp format (+62/08)'),

  queueId: z.string().min(1, 'Queue ID is required'),
})

export type JoinQueueInput = z.infer<typeof joinQueueSchema>
