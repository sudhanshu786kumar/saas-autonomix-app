import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Alternative LLM providers
interface LLMProvider {
  name: string
  analyzeTranscript: (transcript: string) => Promise<AnalysisResult>
}

// Anthropic Claude support
class AnthropicProvider implements LLMProvider {
  name = 'Anthropic Claude'
  
  async analyzeTranscript(transcript: string): Promise<AnalysisResult> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured')
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
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.content[0]?.text
      
      if (!content) {
        throw new Error('No response from Anthropic')
      }

      const result = JSON.parse(content) as AnalysisResult
      
      // Validate and clean the response
      if (!result.actionItems || !Array.isArray(result.actionItems)) {
        throw new Error('Invalid response format from Anthropic')
      }

      result.actionItems = result.actionItems.map(item => ({
        text: item.text || 'Untitled action item',
        priority: ['LOW', 'MEDIUM', 'HIGH'].includes(item.priority) ? item.priority : 'MEDIUM',
        tags: Array.isArray(item.tags) ? item.tags : []
      }))

      return result
    } catch (error) {
      console.error('Anthropic API error:', error)
      throw error
    }
  }
}

// Google Gemini support
class GeminiProvider implements LLMProvider {
  name = 'Google Gemini'
  
  async analyzeTranscript(transcript: string): Promise<AnalysisResult> {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('Google API key not configured')
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
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Google API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!content) {
        throw new Error('No response from Google Gemini')
      }

      const result = JSON.parse(content) as AnalysisResult
      
      // Validate and clean the response
      if (!result.actionItems || !Array.isArray(result.actionItems)) {
        throw new Error('Invalid response format from Google Gemini')
      }

      result.actionItems = result.actionItems.map(item => ({
        text: item.text || 'Untitled action item',
        priority: ['LOW', 'MEDIUM', 'HIGH'].includes(item.priority) ? item.priority : 'MEDIUM',
        tags: Array.isArray(item.tags) ? item.tags : []
      }))

      return result
    } catch (error) {
      console.error('Google Gemini API error:', error)
      throw error
    }
  }
}

// Initialize providers
const anthropicProvider = new AnthropicProvider()
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
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert meeting analyst who extracts actionable items from transcripts. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from OpenAI')
      }

      // Parse the JSON response
      const result = JSON.parse(response) as AnalysisResult
      
      // Validate the response structure
      if (!result.actionItems || !Array.isArray(result.actionItems)) {
        throw new Error('Invalid response format from OpenAI')
      }

      // Ensure each action item has required fields
      result.actionItems = result.actionItems.map(item => ({
        text: item.text || 'Untitled action item',
        priority: ['LOW', 'MEDIUM', 'HIGH'].includes(item.priority) ? item.priority : 'MEDIUM',
        tags: Array.isArray(item.tags) ? item.tags : []
      }))

      console.log('Successfully analyzed transcript using OpenAI')
      return result
    } catch (error) {
      console.error('OpenAI API error:', error)
      
      // If it's a quota exceeded error, try alternative providers
      if (error instanceof Error && (error.message.includes('429') || error.message.includes('quota'))) {
        console.warn('OpenAI quota exceeded, trying alternative providers...')
      } else {
        console.warn('OpenAI API failed, trying alternative providers...')
      }
    }
  }

  // Try alternative providers
  const alternativeProviders = [
    { name: 'Anthropic Claude', provider: anthropicProvider, condition: () => !!process.env.ANTHROPIC_API_KEY },
    { name: 'Google Gemini', provider: geminiProvider, condition: () => !!process.env.GOOGLE_API_KEY }
  ]

  for (const { name, provider, condition } of alternativeProviders) {
    if (condition()) {
      try {
        console.log(`Trying ${name}...`)
        const result = await provider.analyzeTranscript(transcript)
        console.log(`Successfully analyzed transcript using ${name}`)
        return result
      } catch (error) {
        console.error(`${name} API error:`, error)
        continue // Try next provider
      }
    }
  }

  // If all providers fail, use fallback analysis
  console.warn('All LLM providers failed, using fallback analysis')
  return getFallbackAnalysis(transcript)
}

// Fallback analysis when OpenAI API is unavailable
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
  try {
    const prompt = `
Based on the following context, suggest 3-5 relevant action items that might be needed:

Context: ${context}

Respond with a JSON array of action items in this format:
[
  {
    "text": "Specific action item description",
    "priority": "HIGH|MEDIUM|LOW",
    "tags": ["@TeamName"]
  }
]
`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a productivity assistant that suggests actionable tasks. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      return []
    }

    const suggestions = JSON.parse(response) as ActionItemData[]
    return Array.isArray(suggestions) ? suggestions : []
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}