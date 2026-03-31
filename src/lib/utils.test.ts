import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  cn,
  generateQueueId,
  formatQueueUrl,
  isQueueExpired,
  formatRelativeTime,
} from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge Tailwind classes correctly', () => {
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
      expect(cn('flex', 'flex-col')).toBe('flex flex-col')
      expect(cn('px-4', 'px-2')).toBe('px-2')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      expect(cn('base-class', isActive && 'active-class')).toBe(
        'base-class active-class'
      )
    })

    it('should handle false and null values', () => {
      expect(cn('class1', false, null, undefined, 'class2')).toBe('class1 class2')
    })

    it('should handle empty input', () => {
      expect(cn()).toBe('')
    })
  })

  describe('generateQueueId', () => {
    it('should generate a non-empty string', () => {
      const id = generateQueueId()
      expect(id).toBeTruthy()
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should generate unique IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateQueueId())
      }
      expect(ids.size).toBe(100)
    })

    it('should generate URL-safe IDs', () => {
      const id = generateQueueId()
      expect(id).toMatch(/^[a-z0-9]+$/i)
    })
  })

  describe('formatQueueUrl', () => {
    const originalEnv = process.env

    beforeEach(() => {
      vi.resetModules()
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should format queue URL with default localhost', () => {
      delete process.env.NEXT_PUBLIC_APP_URL
      const url = formatQueueUrl('abc123')
      expect(url).toBe('http://localhost:3000/queue/abc123')
    })

    it('should format queue URL with custom APP_URL', () => {
      process.env.NEXT_PUBLIC_APP_URL = 'https://queue.example.com'
      const url = formatQueueUrl('xyz789')
      expect(url).toBe('https://queue.example.com/queue/xyz789')
    })

    it('should handle different queue IDs', () => {
      const url = formatQueueUrl('test-queue-id')
      expect(url).toContain('/queue/test-queue-id')
    })
  })

  describe('isQueueExpired', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
      expect(isQueueExpired(pastDate)).toBe(true)
    })

    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now
      expect(isQueueExpired(futureDate)).toBe(false)
    })

    it('should handle edge cases', () => {
      const now = new Date()
      expect(isQueueExpired(now)).toBe(true) // Exactly now is considered expired
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "just now" for recent dates', () => {
      const now = new Date('2024-01-01T12:00:00Z')
      expect(formatRelativeTime(now)).toBe('just now')

      const thirtySecondsAgo = new Date('2024-01-01T11:59:30Z')
      expect(formatRelativeTime(thirtySecondsAgo)).toBe('just now')
    })

    it('should format minutes ago', () => {
      const fiveMinutesAgo = new Date('2024-01-01T11:55:00Z')
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')

      const oneMinuteAgo = new Date('2024-01-01T11:59:00Z')
      expect(formatRelativeTime(oneMinuteAgo)).toBe('1 minute ago')
    })

    it('should format hours ago', () => {
      const twoHoursAgo = new Date('2024-01-01T10:00:00Z')
      expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')

      const oneHourAgo = new Date('2024-01-01T11:00:00Z')
      expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago')
    })

    it('should format days ago', () => {
      const threeDaysAgo = new Date('2023-12-29T12:00:00Z')
      expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')

      const oneDayAgo = new Date('2023-12-31T12:00:00Z')
      expect(formatRelativeTime(oneDayAgo)).toBe('1 day ago')
    })
  })
})
