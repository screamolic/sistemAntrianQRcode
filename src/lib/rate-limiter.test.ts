import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  checkRateLimit,
  createRateLimitedNotification,
  getRateLimitStatus,
  type RateLimitConfig,
} from './rate-limiter'

describe('rate-limiter', () => {
  beforeEach(() => {
    // Clear any existing cache between tests
    vi.resetModules()
  })

  describe('checkRateLimit', () => {
    const testConfig: RateLimitConfig = {
      maxRequests: 3,
      windowMs: 1000, // 1 second for testing
    }

    it('should allow requests under the limit', () => {
      const result1 = checkRateLimit('test-user', testConfig)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(2)

      const result2 = checkRateLimit('test-user', testConfig)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(1)
    })

    it('should block requests over the limit', () => {
      // Make 3 requests (the limit)
      checkRateLimit('test-user-2', testConfig)
      checkRateLimit('test-user-2', testConfig)
      checkRateLimit('test-user-2', testConfig)

      // 4th request should be blocked
      const result = checkRateLimit('test-user-2', testConfig)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
      expect(result.resetAt).toBeGreaterThan(Date.now() - 1000)
    })

    it('should allow requests after window expires', () => {
      vi.useFakeTimers()

      const key = 'test-user-3'
      checkRateLimit(key, testConfig)
      checkRateLimit(key, testConfig)
      checkRateLimit(key, testConfig)

      // Should be blocked
      expect(checkRateLimit(key, testConfig).allowed).toBe(false)

      // Advance time by 2 seconds (window is 1 second)
      vi.advanceTimersByTime(2000)

      // Should be allowed again
      const result = checkRateLimit(key, testConfig)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(2)

      vi.useRealTimers()
    })

    it('should track different keys independently', () => {
      const result1 = checkRateLimit('user-a', testConfig)
      const result2 = checkRateLimit('user-b', testConfig)

      expect(result1.allowed).toBe(true)
      expect(result2.allowed).toBe(true)
      expect(result1.remaining).toBe(2)
      expect(result2.remaining).toBe(2)
    })

    it('should return correct reset time', () => {
      vi.useFakeTimers()
      const startTime = Date.now()
      vi.setSystemTime(startTime)

      const result = checkRateLimit('test-user-4', testConfig)
      expect(result.resetAt).toBeGreaterThan(startTime)
      expect(result.resetAt).toBeLessThanOrEqual(startTime + testConfig.windowMs)

      vi.useRealTimers()
    })
  })

  describe('createRateLimitedNotification', () => {
    it('should allow notification under limit', () => {
      const result = createRateLimitedNotification('+1234567890')
      expect(result.allowed).toBe(true)
      expect(result.reason).toBeUndefined()
    })

    it('should block notification over limit', () => {
      const phone = '+0987654321'

      // Make multiple requests to exceed limit
      for (let i = 0; i < 5; i++) {
        createRateLimitedNotification(phone)
      }

      const result = createRateLimitedNotification(phone)
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Rate limit exceeded')
    })
  })

  describe('getRateLimitStatus', () => {
    it('should return current rate limit status', () => {
      const phone = '+1111111111'
      const status = getRateLimitStatus(phone)

      expect(status).toHaveProperty('remaining')
      expect(status).toHaveProperty('resetAt')
      expect(status).toHaveProperty('limit')
      expect(status.limit).toBe(5) // default config
      expect(status.remaining).toBeLessThanOrEqual(5)
      expect(status.resetAt).toBeInstanceOf(Date)
    })

    it('should decrease remaining count with each request', () => {
      const phone = '+2222222222'

      const status1 = getRateLimitStatus(phone)
      getRateLimitStatus(phone) // Make a request
      const status2 = getRateLimitStatus(phone)

      expect(status2.remaining).toBeLessThan(status1.remaining)
    })
  })
})
