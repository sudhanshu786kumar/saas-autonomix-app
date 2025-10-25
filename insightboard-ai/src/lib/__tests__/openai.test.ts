import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { analyzeTranscript, generateActionItemSuggestions } from '../openai'

// Mock Google Gemini
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn()
    }
  }))
}))

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Set up environment variables
    process.env.GEMINI_API_KEY = 'test-key'
  })

  describe('analyzeTranscript', () => {
    it('should analyze transcript successfully with Google Gemini', async () => {
      const mockResponse = {
        text: JSON.stringify({
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

      const { GoogleGenAI } = await import('@google/genai')
      const mockClient = new GoogleGenAI()
      mockClient.models.generateContent = jest.fn().mockResolvedValue(mockResponse)

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

    it('should handle Google Gemini API errors and use fallback', async () => {
      const { GoogleGenAI } = await import('@google/genai')
      const mockClient = new GoogleGenAI()
      mockClient.models.generateContent = jest.fn().mockRejectedValue(new Error('API Error'))

      const result = await analyzeTranscript('Test transcript content')

      expect(result.actionItems).toHaveLength(1)
      expect(result.actionItems[0].text).toContain('AI analysis unavailable')
      expect(result.sentiment).toBe('NEUTRAL')
    })

    it('should handle invalid JSON response from Gemini', async () => {
      const mockResponse = {
        text: 'Invalid JSON response'
      }

      const { GoogleGenAI } = await import('@google/genai')
      const mockClient = new GoogleGenAI()
      mockClient.models.generateContent = jest.fn().mockResolvedValue(mockResponse)

      const result = await analyzeTranscript('Test transcript content')

      expect(result.actionItems).toHaveLength(1)
      expect(result.actionItems[0].text).toContain('AI analysis unavailable')
      expect(result.sentiment).toBe('NEUTRAL')
    })

    it('should use fallback when Gemini API key is not configured', async () => {
      delete process.env.GEMINI_API_KEY

      const result = await analyzeTranscript('Test transcript content')

      expect(result.actionItems).toHaveLength(1)
      expect(result.actionItems[0].text).toContain('AI analysis unavailable')
      expect(result.sentiment).toBe('NEUTRAL')
    })

    it('should extract JSON from markdown code blocks', async () => {
      const mockResponse = {
        text: '```json\n{"actionItems":[{"text":"Test item","priority":"HIGH","tags":["@Test"]}],"sentiment":"POSITIVE"}\n```'
      }

      const { GoogleGenAI } = await import('@google/genai')
      const mockClient = new GoogleGenAI()
      mockClient.models.generateContent = jest.fn().mockResolvedValue(mockResponse)

      const result = await analyzeTranscript('Test transcript content')

      expect(result.actionItems).toHaveLength(1)
      expect(result.actionItems[0].text).toBe('Test item')
      expect(result.sentiment).toBe('POSITIVE')
    })
  })

  describe('generateActionItemSuggestions', () => {
    it('should generate suggestions using Gemini when available', async () => {
      const mockResponse = {
        text: JSON.stringify({
          actionItems: [
            {
              text: 'Suggestion 1',
              priority: 'HIGH',
              tags: ['@Marketing']
            },
            {
              text: 'Suggestion 2',
              priority: 'MEDIUM',
              tags: ['@Development']
            }
          ]
        })
      }

      const { GoogleGenAI } = await import('@google/genai')
      const mockClient = new GoogleGenAI()
      mockClient.models.generateContent = jest.fn().mockResolvedValue(mockResponse)

      const result = await generateActionItemSuggestions('Test context')

      expect(result).toHaveLength(2)
      expect(result[0].text).toBe('Suggestion 1')
      expect(result[1].text).toBe('Suggestion 2')
    })

    it('should return fallback suggestions when Gemini fails', async () => {
      const { GoogleGenAI } = await import('@google/genai')
      const mockClient = new GoogleGenAI()
      mockClient.models.generateContent = jest.fn().mockRejectedValue(new Error('API Error'))

      const result = await generateActionItemSuggestions('Test context')

      expect(result).toHaveLength(2)
      expect(result[0].text).toContain('Review and prioritize')
      expect(result[1].text).toContain('Follow up')
    })
  })
})
