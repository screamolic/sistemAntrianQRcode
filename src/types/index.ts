// Base types for Queue Automation System

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'super-admin'
  createdAt: Date
  updatedAt: Date
}

export interface Queue {
  id: string
  name: string
  adminId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface QueueEntry {
  id: string
  queueId: string
  phoneNumber: string
  name?: string
  position: number
  status: 'waiting' | 'served' | 'no-show'
  notifiedAt?: Date
  servedAt?: Date
  createdAt: Date
}

export type Theme = 'light' | 'dark' | 'system'
