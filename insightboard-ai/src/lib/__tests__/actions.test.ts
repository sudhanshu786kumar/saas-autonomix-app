import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createActionItem, toggleTaskStatus, deleteTask } from '../actions'

// Mock Prisma
vi.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    actionItem: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-id' }
  }))
}))

// Mock Next.js
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createActionItem', () => {
    it('should create an action item with valid data', async () => {
      const mockCreate = vi.fn().mockResolvedValue({ id: 'test-id' })
      const { prisma } = await import('../prisma')
      prisma.actionItem.create = mockCreate

      const payload = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high' as const,
        assignee: 'John Doe'
      }

      await createActionItem(payload)

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          text: 'Test Task — Test Description',
          priority: 'HIGH',
          tags: ['@Assignee:John Doe'],
          userId: 'test-user-id',
          transcriptId: null,
        }
      })
    })

    it('should handle missing title', async () => {
      const payload = {
        title: '',
        description: 'Test Description',
        priority: 'high' as const,
        assignee: 'John Doe'
      }

      await expect(createActionItem(payload)).rejects.toThrow('Task title is required')
    })
  })

  describe('toggleTaskStatus', () => {
    it('should toggle task status from PENDING to COMPLETED', async () => {
      const mockFindFirst = vi.fn().mockResolvedValue({
        id: 'test-id',
        status: 'PENDING',
        userId: 'test-user-id'
      })
      const mockUpdate = vi.fn().mockResolvedValue({})
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst
      prisma.actionItem.update = mockUpdate

      await toggleTaskStatus('test-id')

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          status: 'COMPLETED',
          completedAt: expect.any(Date)
        }
      })
    })

    it('should throw error if task not found', async () => {
      const mockFindFirst = vi.fn().mockResolvedValue(null)
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst

      await expect(toggleTaskStatus('non-existent-id')).rejects.toThrow('Task not found')
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const mockFindFirst = vi.fn().mockResolvedValue({
        id: 'test-id',
        userId: 'test-user-id'
      })
      const mockDelete = vi.fn().mockResolvedValue({})
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst
      prisma.actionItem.delete = mockDelete

      await deleteTask('test-id')

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      })
    })

    it('should throw error if task not found', async () => {
      const mockFindFirst = vi.fn().mockResolvedValue(null)
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst

      await expect(deleteTask('non-existent-id')).rejects.toThrow('Task not found')
    })
  })
})
