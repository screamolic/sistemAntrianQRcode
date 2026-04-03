/**
 * Rate Limiter for Notifications
 * Prevents spam by limiting messages per user
 */

import { LRUCache } from 'lru-cache';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // Time window in milliseconds
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 5, // 5 messages per user
  windowMs: 5 * 60 * 1000, // per 5 minutes
};

// Cache to track request timestamps per key
const cache = new LRUCache<string, number[]>({
  max: 1000,
  ttl: defaultConfig.windowMs,
});

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request is within rate limits
 * @param key - Unique identifier (e.g., phone number, IP)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = defaultConfig
): RateLimitResult {
  const now = Date.now();
  const requests = cache.get(key) || [];

  // Remove old requests outside the window
  const validRequests = requests.filter(
    (timestamp) => now - timestamp < config.windowMs
  );

  if (validRequests.length >= config.maxRequests) {
    const oldestRequest = Math.min(...validRequests);
    const resetAt = oldestRequest + config.windowMs;

    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Add current request
  validRequests.push(now);
  cache.set(key, validRequests);

  return {
    allowed: true,
    remaining: config.maxRequests - validRequests.length,
    resetAt: now + config.windowMs,
  };
}

export interface RateLimitCheckResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Create rate-limited notification check for phone numbers
 * @param phone - Phone number to check
 */
export function createRateLimitedNotification(
  phone: string
): RateLimitCheckResult {
  const limit = checkRateLimit(`notification:${phone}`);

  if (!limit.allowed) {
    return {
      allowed: false,
      reason: `Rate limit exceeded. Try again after ${new Date(limit.resetAt).toLocaleTimeString()}`,
    };
  }

  return { allowed: true };
}

/**
 * Get current rate limit status for a phone number
 * @param phone - Phone number to check
 */
export function getRateLimitStatus(phone: string): {
  remaining: number;
  resetAt: Date;
  limit: number;
} {
  const limit = checkRateLimit(`notification:${phone}`);
  return {
    remaining: limit.remaining,
    resetAt: new Date(limit.resetAt),
    limit: defaultConfig.maxRequests,
  };
}

// -----------------------------------------------------------
// HTTP API Rate Limiter (for auth routes)
// -----------------------------------------------------------

class HttpRateLimiter {
  private cache: LRUCache<string, number>
  private maxRequests: number

  constructor(options: { maxRequests: number; windowMs: number }) {
    this.maxRequests = options.maxRequests
    this.cache = new LRUCache({
      max: 10000,
      ttl: options.windowMs,
    })
  }

  async isRateLimited(identifier: string): Promise<boolean> {
    const current = this.cache.get(identifier) ?? 0
    if (current >= this.maxRequests) return true
    this.cache.set(identifier, current + 1)
    return false
  }

  getRemaining(identifier: string): number {
    const current = this.cache.get(identifier) ?? 0
    return Math.max(0, this.maxRequests - current)
  }
}

// Auth rate limiter: 5 requests per 15 minutes (brute force protection)
export const authRateLimiter = new HttpRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000,
})

// General API rate limiter: 100 requests per 15 minutes
export const apiRateLimiter = new HttpRateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000,
})
