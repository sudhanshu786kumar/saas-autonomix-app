import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { GET, POST } from '../route'

// Mock NextAuth
const mockNextAuth = jest.fn()
jest.mock('next-auth', () => mockNextAuth)

// Mock authOptions
jest.mock('@/lib/auth', () => ({
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' },
  },
}))

describe('NextAuth API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should call NextAuth with authOptions', async () => {
      const mockRequest = new Request('http://localhost:3000/api/auth/session')
      const mockResponse = { status: 200, json: () => ({ user: null }) }
      
      mockNextAuth.mockResolvedValue(mockResponse)
      
      const result = await GET(mockRequest)
      
      expect(mockNextAuth).toHaveBeenCalledWith(
        expect.any(Object), // authOptions
        expect.any(Object)  // request
      )
    })

    it('should handle NextAuth errors', async () => {
      const mockRequest = new Request('http://localhost:3000/api/auth/session')
      const error = new Error('Authentication failed')
      
      mockNextAuth.mockRejectedValue(error)
      
      await expect(GET(mockRequest)).rejects.toThrow('Authentication failed')
    })
  })

  describe('POST', () => {
    it('should call NextAuth with authOptions for POST requests', async () => {
      const mockRequest = new Request('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const mockResponse = { status: 200, json: () => ({ success: true }) }
      
      mockNextAuth.mockResolvedValue(mockResponse)
      
      const result = await POST(mockRequest)
      
      expect(mockNextAuth).toHaveBeenCalledWith(
        expect.any(Object), // authOptions
        expect.any(Object)  // request
      )
    })

    it('should handle NextAuth errors for POST requests', async () => {
      const mockRequest = new Request('http://localhost:3000/api/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'wrong' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const error = new Error('Invalid credentials')
      
      mockNextAuth.mockRejectedValue(error)
      
      await expect(POST(mockRequest)).rejects.toThrow('Invalid credentials')
    })
  })
})
