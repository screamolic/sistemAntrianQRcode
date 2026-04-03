import { describe, it, expect } from 'vitest'
import { getQueueJoinUrl } from '@/lib/qr'

describe('QR Code Utility', () => {
  describe('getQueueJoinUrl', () => {
    it('should generate correct URL with custom base', () => {
      const counterId = 'abc123'
      const baseUrl = 'https://example.com'
      
      const result = getQueueJoinUrl(counterId, baseUrl)
      expect(result).toBe('https://example.com/q/abc123')
    })

    it('should generate URL with default base URL', () => {
      const counterId = 'xyz789'
      
      const result = getQueueJoinUrl(counterId)
      expect(result).toContain('/q/xyz789')
    })
  })
})
