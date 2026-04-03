/**
 * QR Code generation utility
 * Generates QR codes for counter queue entry
 */

import { toDataURL } from 'qrcode'

/**
 * Generate QR code data URL for a counter
 * @param counterId - Counter ID
 * @param baseUrl - Base URL of the application
 * @returns QR code data URL
 */
export async function generateCounterQRCode(
  counterId: string,
  baseUrl: string = process.env.AUTH_URL || 'http://localhost:3000'
): Promise<string> {
  const queueUrl = `${baseUrl}/q/${counterId}`

  return toDataURL(queueUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })
}

/**
 * Generate queue join URL
 * @param counterId - Counter ID
 * @param baseUrl - Base URL
 * @returns Queue join URL
 */
export function getQueueJoinUrl(
  counterId: string,
  baseUrl: string = process.env.AUTH_URL || 'http://localhost:3000'
): string {
  return `${baseUrl}/q/${counterId}`
}
