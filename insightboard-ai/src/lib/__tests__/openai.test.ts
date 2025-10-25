import { describe, it, expect, vi, beforeEach } from 'vitest'
import { analyzeTranscript } from '../openai'

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}))

describe('OpenAI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set up environment variables
    process.env.OPENAI_API_KEY = 'test-key'
  })

  describe('analyzeTranscript', () => {
    it('should analyze transcript successfully with OpenAI', async () => {
      const mockCompletion = {
        choices: [{
          message: {
            content: JSON.stringify({
              actionItems: [
                {
                  text: 'Review marketing campaign',
                  priority: 'HIGH',
                  tags: ['@Marketing']
                }
              ],
              sentiment: 'POSITIVE',
              summary: 'Productive meeting about campaign'
            })
          }
        }]
      }

      const { default: OpenAI } = await import('openai')
      const mockClient = new OpenAI()
      mockClient.chat.completions.create = vi.fn().mockResolvedValue(mockCompletion)

      const result = await analyzeTranscript('Test transcript content')

      expect(result).toEqual({
        actionItems: [
          {
            text: 'Review marketing campaign',
            priority: 'HIGH',
            tags: ['@Marketing']
          }
        ],
        sentiment: 'POSITIVE',
        summary: 'Productive meeting about campaign'
      })
    })

    it('should handle OpenAI API errors and use fallback', async () => {
      const { default: OpenAI } = await import('openai')
      const mockClient = new OpenAI()
      mockClient.chat.completions.create = vi.fn().mockRejectedValue(new Error('API Error'))

      const result = await analyzeTranscript('Test transcript content')

      expect(result.actionItems).toHaveLength(1)
      expect(result.actionItems[0].text).toContain('AI analysis unavailable')
      expect(result.sentiment).toBe('NEUTRAL')
    })

    it('should handle quota exceeded error and try alternatives', async () => {
      // Mock OpenAI quota error
      const { default: OpenAI } = await import('openai')
      const mockClient = new OpenAI()
      mockClient.chat.completions.create = vi.fn().mockRejectedValue(new Error('429 You exceeded your current quota'))

      // Mock alternative providers
      process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
      
      // Mock fetch for Anthropic
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          content: [{
            text: JSON.stringify({
              actionItems: [
                {
                  text: 'Alternative analysis',
                  priority: 'MEDIUM',
                  tags: ['@Admin']
                }
              ],
              sentiment: 'NEUTRAL',
              summary: 'Fallback analysis'
            })
          }]
        })
      })

      const result = await analyzeTranscript('Test transcript content')

      expect(result.actionItems).toHaveLength(1)
      expect(result.actionItems[0].text).toBe('Alternative analysis')
    })
  })
})
