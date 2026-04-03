/**
 * Evolution-API Connection Helper
 * Provides singleton instance and connection utilities
 */

import { EvolutionAPI } from './client'

const API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
const API_KEY = process.env.EVOLUTION_API_KEY || ''
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'queue-automation'

// Singleton instance
export const evolution = new EvolutionAPI(API_URL, API_KEY, INSTANCE_NAME)

/**
 * Check if Evolution-API is connected and ready
 */
export async function isEvolutionConnected(): Promise<boolean> {
  try {
    return await evolution.isConnected()
  } catch {
    return false
  }
}

/**
 * Get connection QR code for pairing
 * Returns base64 encoded QR code image
 */
export async function getConnectionQR(): Promise<{ base64: string; code: string } | null> {
  try {
    const response = await evolution.connect()
    return { base64: response.base64, code: response.code }
  } catch (error) {
    console.error('Failed to get connection QR:', error)
    return null
  }
}

/**
 * Get current connection status
 */
export async function getConnectionStatus(): Promise<{
  connected: boolean
  status: string
  error?: string
}> {
  try {
    const status = await evolution.getInstanceStatus()
    return {
      connected: status.status === 'open',
      status: status.status,
    }
  } catch (error) {
    return {
      connected: false,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Test Evolution-API health
 */
export async function testEvolutionHealth(): Promise<{
  healthy: boolean
  message: string
}> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      headers: { apikey: API_KEY },
    })

    if (response.ok) {
      return { healthy: true, message: 'Evolution-API is healthy' }
    }

    return { healthy: false, message: `Health check failed: ${response.statusText}` }
  } catch (error) {
    return {
      healthy: false,
      message: `Cannot reach Evolution-API at ${API_URL}: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }
}
