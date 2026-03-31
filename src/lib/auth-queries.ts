import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  })
}

export async function createUser(email: string, password: string, name?: string) {
  const hashedPassword = await bcrypt.hash(password, 10)
  
  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    }
  })
}

export async function createQueue(adminId: string, name: string) {
  return prisma.queue.create({
    data: {
      adminId,
      name,
    }
  })
}

export async function getQueueById(id: string) {
  return prisma.queue.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { position: 'asc' }
      }
    }
  })
}

export async function getQueuesByAdminId(adminId: string) {
  return prisma.queue.findMany({
    where: { adminId },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createQueueEntry(queueId: string, phoneNumber: string, name?: string) {
  // Get the current highest position
  const queue = await getQueueById(queueId)
  const currentPosition = queue?.entries.length || 0
  
  return prisma.queueEntry.create({
    data: {
      queueId,
      phoneNumber,
      name,
      position: currentPosition + 1,
    }
  })
}

export async function getQueueEntryById(id: string) {
  return prisma.queueEntry.findUnique({
    where: { id },
    include: { queue: true }
  })
}

export async function updateQueueEntryStatus(id: string, status: 'WAITING' | 'SERVED' | 'NO_SHOW') {
  return prisma.queueEntry.update({
    where: { id },
    data: { 
      status,
      servedAt: status === 'SERVED' ? new Date() : undefined
    }
  })
}
