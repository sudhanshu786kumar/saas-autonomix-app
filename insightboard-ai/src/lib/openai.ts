import { GoogleGenAI } from '@google/genai'

interface LLMProvider {
  name: string
  analyzeTranscript: (transcript: string) => Promise<AnalysisResult>
}

class GeminiProvider implements LLMProvider {
  private apiKey: string
  name = 'Google Gemini'
  
  constructor() {
    // Check for API key at startup and validate format
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error('[GeminiProvider] No API key found. Set GEMINI_API_KEY or GOOGLE_API_KEY in environment.')
      throw new Error('Gemini API key not configured')
    }
    if (!apiKey.startsWith('AI') || apiKey.length < 40) {
      console.warn('[GeminiProvider] API key format looks invalid. Verify key in environment.')
    }
    this.apiKey = apiKey
  }
  
  async analyzeTranscript(transcript: string): Promise<AnalysisResult> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured')
    }

    const prompt = `
Analyze the following meeting transcript and extract actionable items. For each action item, determine:
1. The specific task or action to be taken
2. Priority level (LOW, MEDIUM, HIGH) based on urgency and importance
3. Relevant team tags (e.g., @Marketing, @Tech, @Sales, @HR, @Finance, @Legal)

Also provide:
- Overall sentiment of the meeting (POSITIVE, NEUTRAL, NEGATIVE)
- A brief summary of key discussion points

Transcript:
${transcript}

Please respond in the following JSON format:
{
  "actionItems": [
    {
      "text": "Specific action item description",
      "priority": "HIGH|MEDIUM|LOW",
      "tags": ["@TeamName", "@AnotherTeam"]
    }
  ],
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "summary": "Brief summary of the meeting"
}

Guidelines:
- Extract only clear, actionable items (not general discussion points)
- Assign realistic priorities based on business impact and urgency
- Use appropriate team tags based on the nature of the task
- Keep action items concise but specific
- Ensure the summary captures the main outcomes and decisions
`

    try {
      // Pass the validated API key explicitly to ensure it's included in requests
      const ai = new GoogleGenAI({ apiKey: this.apiKey })
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an expert meeting analyst who extracts actionable items from transcripts. You must respond with ONLY valid JSON in the exact format specified. Do not include any markdown formatting, explanations, or additional text - just the raw JSON object."
        }
      })
      
      const content = response.text
      
      if (!content) {
        throw new Error('No response from Google Gemini')
      }

      // Extract JSON from markdown code blocks if present
      let jsonContent = content
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        jsonContent = jsonMatch[1]
      }

      let parsedResult: AnalysisResult
      try {
        parsedResult = JSON.parse(jsonContent) as AnalysisResult
      } catch (parseError) {
        console.error('JSON parsing error:', parseError)
        console.error('Raw content:', content)
        throw new Error('Invalid JSON response from Google Gemini')
      }
      
      // Validate and clean the response
      if (!parsedResult.actionItems || !Array.isArray(parsedResult.actionItems)) {
        throw new Error('Invalid response format from Google Gemini')
      }

      parsedResult.actionItems = parsedResult.actionItems.map(item => ({
        text: item.text || 'Untitled action item',
        priority: ['LOW', 'MEDIUM', 'HIGH'].includes(item.priority) ? item.priority : 'MEDIUM',
        tags: Array.isArray(item.tags) ? item.tags : []
      }))

      return parsedResult
    } catch (error) {
      console.error('Google Gemini API error:', error)
      throw error
    }
  }
}

// Initialize Google Gemini only
const geminiProvider = new GeminiProvider()

export interface ActionItemData {
  text: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  tags: string[]
}

export interface AnalysisResult {
  actionItems: ActionItemData[]
  sentiment?: string
  summary?: string
}

export async function analyzeTranscript(transcript: string): Promise<AnalysisResult> {
  // Try Google Gemini first
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('Trying Google Gemini...')
      const result = await geminiProvider.analyzeTranscript(transcript)
      console.log('Successfully analyzed transcript using Google Gemini')
      return result
    } catch (error) {
      console.error('Google Gemini API error:', error)
      console.warn('Google Gemini failed, using fallback analysis')
    }
  } else {
    console.warn('Gemini API key not configured, using fallback analysis')
  }

  // If Gemini fails or is not configured, use fallback analysis
  return getFallbackAnalysis(transcript)
}

// Fallback analysis when Google Gemini is unavailable
function getFallbackAnalysis(transcript: string): AnalysisResult {
  // Simple keyword-based analysis as fallback
  const words = transcript.toLowerCase().split(/\s+/)
  const actionKeywords = ['action', 'task', 'todo', 'follow up', 'next steps', 'deadline', 'due', 'assign', 'responsible']
  const priorityKeywords = {
    high: ['urgent', 'asap', 'immediately', 'critical', 'important'],
    medium: ['soon', 'priority', 'schedule'],
    low: ['eventually', 'when possible', 'low priority']
  }
  
  const hasActionKeywords = actionKeywords.some(keyword => 
    words.some(word => word.includes(keyword))
  )
  
  let priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  if (priorityKeywords.high.some(keyword => words.some(word => word.includes(keyword)))) {
    priority = 'HIGH'
  } else if (priorityKeywords.low.some(keyword => words.some(word => word.includes(keyword)))) {
    priority = 'LOW'
  }
  
  // Extract basic action items from common patterns
  const actionItems: ActionItemData[] = []
  
  if (hasActionKeywords) {
    actionItems.push({
      text: 'Review transcript for specific action items - AI analysis unavailable',
      priority,
      tags: ['@Admin']
    })
  }
  
  // If no action keywords found, create a general review task
  if (actionItems.length === 0) {
    actionItems.push({
      text: 'Review meeting transcript manually - AI analysis unavailable',
      priority: 'MEDIUM',
      tags: ['@Admin']
    })
  }
  
  return {
    actionItems,
    sentiment: 'NEUTRAL',
    summary: 'AI analysis unavailable. Please review transcript manually for action items.'
  }
}

export async function generateActionItemSuggestions(context: string): Promise<ActionItemData[]> {
  // Try Google Gemini for suggestions
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('Trying Google Gemini for suggestions...')
      const result = await geminiProvider.analyzeTranscript(context)
      return result.actionItems.slice(0, 5) // Return up to 5 suggestions
    } catch (error) {
      console.error('Google Gemini suggestions error:', error)
    }
  }

  // Fallback: return basic suggestions
  return [
    {
      text: 'Review and prioritize tasks based on context',
      priority: 'MEDIUM' as const,
      tags: ['@Admin']
    },
    {
      text: 'Follow up on pending items',
      priority: 'HIGH' as const,
      tags: ['@Admin']
    }
  ]
}