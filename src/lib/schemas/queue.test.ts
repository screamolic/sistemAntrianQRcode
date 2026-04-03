import { describe, it, expect } from 'vitest'
import { joinQueueSchema } from '../schemas/queue'

describe('queue schemas', () => {
  describe('joinQueueSchema', () => {
    const validBaseData = {
      firstName: 'John',
      lastName: 'Doe',
      phone: '+6281234567890',
      queueId: 'test-queue-123',
    }

    it('should validate correct data', () => {
      const result = joinQueueSchema.safeParse(validBaseData)
      expect(result.success).toBe(true)
    })

    it('should reject empty first name', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        firstName: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('firstName')
      }
    })

    it('should reject first name too long', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        firstName: 'A'.repeat(51),
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('less than 50 characters')
      }
    })

    it('should reject first name with numbers', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        firstName: 'John123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('only contain letters')
      }
    })

    it('should accept first name with hyphens and apostrophes', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        firstName: "Mary-Jane O'Brien",
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty last name', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        lastName: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('lastName')
      }
    })

    it('should reject phone number too short', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        phone: '12345',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 10 digits')
      }
    })

    it('should reject phone number too long', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        phone: '+628123456789012345678', // 21 chars
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at most 20 characters')
      }
    })

    it('should accept Indonesian phone format with +62', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        phone: '+628123456789',
      })
      expect(result.success).toBe(true)
    })

    it('should accept Indonesian phone format with 62', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        phone: '628123456789',
      })
      expect(result.success).toBe(true)
    })

    it('should accept Indonesian phone format with 08', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        phone: '081234567890',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid phone format', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        phone: '+1234567890',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Indonesian WhatsApp format')
      }
    })

    it('should accept phone with spaces and dashes', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        phone: '+62 812-3456-7890',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty queueId', () => {
      const result = joinQueueSchema.safeParse({
        ...validBaseData,
        queueId: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('queueId')
      }
    })

    it('should provide helpful error messages', () => {
      const result = joinQueueSchema.safeParse({
        firstName: '',
        lastName: '',
        phone: 'invalid',
        queueId: '',
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
        result.error.issues.forEach((error) => {
          expect(error.message).toBeTruthy()
        })
      }
    })
  })
})
