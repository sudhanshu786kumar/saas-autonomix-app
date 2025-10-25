import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { authOptions } from '../auth'

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('authOptions', () => {
    it('should have correct configuration', () => {
      expect(authOptions.session.strategy).toBe('jwt')
      expect(authOptions.pages.signIn).toBe('/auth/signin')
      expect(authOptions.providers).toHaveLength(1)
      expect(authOptions.providers[0].name).toBe('credentials')
    })

    it('should authorize user with valid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User'
      }
      const mockCompare = jest.fn().mockResolvedValue(true)
      
      const { prisma } = await import('../prisma')
      const bcrypt = await import('bcryptjs')
      
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)
      bcrypt.compare = mockCompare

      const credentialsProvider = authOptions.providers[0]
      const result = await credentialsProvider.authorize({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      })
      expect(mockCompare).toHaveBeenCalledWith('password123', 'hashed-password')
    })

    it('should return null for invalid email', async () => {
      const { prisma } = await import('../prisma')
      prisma.user.findUnique = jest.fn().mockResolvedValue(null)

      const credentialsProvider = authOptions.providers[0]
      const result = await credentialsProvider.authorize({
        email: 'nonexistent@example.com',
        password: 'password123'
      })

      expect(result).toBeNull()
    })

    it('should return null for invalid password', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User'
      }
      const mockCompare = jest.fn().mockResolvedValue(false)
      
      const { prisma } = await import('../prisma')
      const bcrypt = await import('bcryptjs')
      
      prisma.user.findUnique = jest.fn().mockResolvedValue(mockUser)
      bcrypt.compare = mockCompare

      const credentialsProvider = authOptions.providers[0]
      const result = await credentialsProvider.authorize({
        email: 'test@example.com',
        password: 'wrong-password'
      })

      expect(result).toBeNull()
      expect(mockCompare).toHaveBeenCalledWith('wrong-password', 'hashed-password')
    })

    it('should return null for missing credentials', async () => {
      const credentialsProvider = authOptions.providers[0]
      
      const result1 = await credentialsProvider.authorize({
        email: '',
        password: 'password123'
      })
      expect(result1).toBeNull()

      const result2 = await credentialsProvider.authorize({
        email: 'test@example.com',
        password: ''
      })
      expect(result2).toBeNull()

      const result3 = await credentialsProvider.authorize({})
      expect(result3).toBeNull()
    })

    it('should handle JWT callback correctly', async () => {
      const user = { id: 'user-id', email: 'test@example.com', name: 'Test User' }
      const token = {}

      const result = await authOptions.callbacks.jwt({ token, user })

      expect(result.id).toBe('user-id')
    })

    it('should handle session callback correctly', async () => {
      const session = { user: { email: 'test@example.com', name: 'Test User' } }
      const token = { id: 'user-id' }

      const result = await authOptions.callbacks.session({ session, token })

      expect(result.user.id).toBe('user-id')
    })
  })
})
