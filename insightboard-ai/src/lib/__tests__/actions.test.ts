import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { createActionItem, toggleTaskStatus, deleteTask, registerUser, submitTranscript, updateTaskPriority, getDashboardData } from '../actions'

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    actionItem: {
      create: jest.fn(),
      createMany: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
    transcript: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: 'test-user-id' }
  }))
}))

// Mock Next.js
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

// Mock OpenAI
jest.mock('../openai', () => ({
  analyzeTranscript: jest.fn(),
}))

describe('Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const mockFindUnique = jest.fn().mockResolvedValue(null)
      const mockCreate = jest.fn().mockResolvedValue({ id: 'new-user-id' })
      const mockHash = jest.fn().mockResolvedValue('hashed-password')
      
      const { prisma } = await import('../prisma')
      const bcrypt = await import('bcryptjs')
      
      prisma.user.findUnique = mockFindUnique
      prisma.user.create = mockCreate
      bcrypt.hash = mockHash

      const payload = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const result = await registerUser(payload)

      expect(result.success).toBe(true)
      expect(mockHash).toHaveBeenCalledWith('password123', 12)
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          password: 'hashed-password',
          name: 'Test User'
        }
      })
    })

    it('should return error if user already exists', async () => {
      const mockFindUnique = jest.fn().mockResolvedValue({ id: 'existing-user' })
      
      const { prisma } = await import('../prisma')
      prisma.user.findUnique = mockFindUnique

      const payload = {
        email: 'existing@example.com',
        password: 'password123'
      }

      const result = await registerUser(payload)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User already exists')
    })

    it('should handle missing email or password', async () => {
      const payload = {
        email: '',
        password: 'password123'
      }

      const result = await registerUser(payload)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email and password are required')
    })
  })

  describe('createActionItem', () => {
    it('should create an action item with valid data', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: 'test-id' })
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

    it('should handle FormData payload', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ id: 'test-id' })
      const { prisma } = await import('../prisma')
      prisma.actionItem.create = mockCreate

      const formData = new FormData()
      formData.append('title', 'Form Task')
      formData.append('description', 'Form Description')
      formData.append('priority', 'medium')
      formData.append('assignee', 'Jane Doe')

      await createActionItem(formData)

      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          text: 'Form Task — Form Description',
          priority: 'MEDIUM',
          tags: ['@Assignee:Jane Doe'],
          userId: 'test-user-id',
          transcriptId: null,
        }
      })
    })
  })

  describe('submitTranscript', () => {
    it('should submit transcript and create action items', async () => {
      const mockAnalyze = jest.fn().mockResolvedValue({
        actionItems: [
          {
            text: 'Test action item',
            priority: 'HIGH',
            tags: ['@Marketing']
          }
        ],
        sentiment: 'POSITIVE',
        summary: 'Test summary'
      })
      const mockTranscriptCreate = jest.fn().mockResolvedValue({ id: 'transcript-id' })
      const mockActionItemCreateMany = jest.fn().mockResolvedValue({})
      
      const openaiModule = await import('../openai')
      const prismaModule = await import('../prisma')
      
      openaiModule.analyzeTranscript = mockAnalyze
      prismaModule.prisma.transcript.create = mockTranscriptCreate
      prismaModule.prisma.actionItem.createMany = mockActionItemCreateMany

      const formData = new FormData()
      formData.append('content', 'Test transcript content')
      formData.append('title', 'Test Meeting')

      const result = await submitTranscript(formData)

      expect(result.success).toBe(true)
      expect(mockAnalyze).toHaveBeenCalledWith('Test transcript content')
      expect(mockTranscriptCreate).toHaveBeenCalled()
      expect(mockActionItemCreateMany).toHaveBeenCalled()
    })

    it('should handle missing content', async () => {
      const formData = new FormData()
      formData.append('title', 'Test Meeting')

      await expect(submitTranscript(formData)).rejects.toThrow('Transcript content is required')
    })
  })

  describe('toggleTaskStatus', () => {
    it('should toggle task status from PENDING to COMPLETED', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue({
        id: 'test-id',
        status: 'PENDING',
        userId: 'test-user-id'
      })
      const mockUpdate = jest.fn().mockResolvedValue({})
      
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

    it('should toggle task status from COMPLETED to PENDING', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue({
        id: 'test-id',
        status: 'COMPLETED',
        userId: 'test-user-id'
      })
      const mockUpdate = jest.fn().mockResolvedValue({})
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst
      prisma.actionItem.update = mockUpdate

      await toggleTaskStatus('test-id')

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          status: 'PENDING',
          completedAt: null
        }
      })
    })

    it('should throw error if task not found', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue(null)
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst

      await expect(toggleTaskStatus('non-existent-id')).rejects.toThrow('Task not found')
    })
  })

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue({
        id: 'test-id',
        userId: 'test-user-id'
      })
      const mockDelete = jest.fn().mockResolvedValue({})
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst
      prisma.actionItem.delete = mockDelete

      await deleteTask('test-id')

      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 'test-id' }
      })
    })

    it('should throw error if task not found', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue(null)
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst

      await expect(deleteTask('non-existent-id')).rejects.toThrow('Task not found')
    })
  })

  describe('updateTaskPriority', () => {
    it('should update task priority successfully', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue({
        id: 'test-id',
        userId: 'test-user-id'
      })
      const mockUpdate = jest.fn().mockResolvedValue({})
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst
      prisma.actionItem.update = mockUpdate

      await updateTaskPriority('test-id', 'HIGH')

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: { priority: 'HIGH' }
      })
    })

    it('should throw error if task not found', async () => {
      const mockFindFirst = jest.fn().mockResolvedValue(null)
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findFirst = mockFindFirst

      await expect(updateTaskPriority('non-existent-id', 'HIGH')).rejects.toThrow('Task not found')
    })
  })

  describe('getDashboardData', () => {
    it('should return dashboard data with statistics', async () => {
      const mockActionItems = [
        { id: '1', status: 'COMPLETED', priority: 'HIGH', createdAt: new Date() },
        { id: '2', status: 'PENDING', priority: 'MEDIUM', createdAt: new Date() },
        { id: '3', status: 'PENDING', priority: 'LOW', createdAt: new Date() }
      ]
      const mockTranscripts = [
        { id: '1', title: 'Meeting 1', createdAt: new Date(), sentiment: 'POSITIVE', _count: { actionItems: 2 } }
      ]
      const mockTaskStats = [
        { status: 'COMPLETED', priority: 'HIGH', _count: 1 },
        { status: 'PENDING', priority: 'MEDIUM', _count: 1 },
        { status: 'PENDING', priority: 'LOW', _count: 1 }
      ]

      const mockFindMany = jest.fn().mockResolvedValue(mockActionItems)
      const mockTranscriptFindMany = jest.fn().mockResolvedValue(mockTranscripts)
      const mockGroupBy = jest.fn().mockResolvedValue(mockTaskStats)
      
      const { prisma } = await import('../prisma')
      prisma.actionItem.findMany = mockFindMany
      prisma.transcript.findMany = mockTranscriptFindMany
      prisma.actionItem.groupBy = mockGroupBy

      const result = await getDashboardData()

      expect(result.actionItems).toEqual(mockActionItems)
      expect(result.transcripts).toEqual(mockTranscripts)
      expect(result.stats.totalTasks).toBe(3)
      expect(result.stats.completedTasks).toBe(1)
      expect(result.stats.pendingTasks).toBe(2)
      expect(result.stats.completionRate).toBe(33)
      expect(result.stats.priorityStats.HIGH).toBe(1)
      expect(result.stats.priorityStats.MEDIUM).toBe(1)
      expect(result.stats.priorityStats.LOW).toBe(1)
    })
  })
})
