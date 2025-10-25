'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { prisma } from './prisma'
import { analyzeTranscript } from './openai'
import bcrypt from 'bcryptjs'

// Authentication helper
async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !('id' in session.user) || !session.user.id) {
    console.error('No session or user ID found:', { session: !!session, userId: session?.user })
    throw new Error('Unauthorized')
  }
  
  const userId = session.user.id as string
  
  // Verify the user exists in the database
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    console.error('User not found in database:', userId)
    throw new Error('User not found')
  }
  
  return userId
}

// User registration
export async function registerUser(payload: FormData | { email: string; password: string; name?: string }) {
  try {
    let email: string | undefined
    let password: string | undefined
    let name: string | undefined

    if (payload instanceof FormData) {
      email = payload.get('email') as string
      password = payload.get('password') as string
      name = payload.get('name') as string | undefined
    } else {
      email = payload.email
      password = payload.password
      name = payload.name
    }

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { success: false, error: 'User already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error registering user:', error)
    return { success: false, error: 'Failed to register user' }
  }
}

// Transcript submission and AI analysis
export async function submitTranscript(formData: FormData) {
  const userId = await getAuthenticatedUser()
  const content = formData.get('content') as string
  const title = formData.get('title') as string

  if (!content) {
    throw new Error('Transcript content is required')
  }

  try {
    // Analyze transcript with AI
    const analysis = await analyzeTranscript(content)

    // Create transcript
    const transcript = await prisma.transcript.create({
      data: {
        content,
        title: title || 'Untitled Transcript',
        sentiment: analysis.sentiment,
        userId
      }
    })

    // Create action items from AI analysis
    if (analysis.actionItems && analysis.actionItems.length > 0) {
      await prisma.actionItem.createMany({
        data: analysis.actionItems.map(item => ({
          text: item.text,
          priority: item.priority as 'LOW' | 'MEDIUM' | 'HIGH',
          tags: item.tags,
          userId,
          transcriptId: transcript.id
        }))
      })
    }

    revalidatePath('/dashboard')
    return { success: true, transcriptId: transcript.id }
  } catch (error) {
    console.error('Error submitting transcript:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        throw new Error('User session is invalid. Please sign in again.')
      }
      if (error.message.includes('429')) {
        throw new Error('AI analysis service is temporarily unavailable. Please try again later.')
      }
    }
    
    throw new Error('Failed to process transcript')
  }
}

// Task management actions
export async function toggleTaskStatus(taskId: string) {
  const userId = await getAuthenticatedUser()

  const task = await prisma.actionItem.findFirst({
    where: {
      id: taskId,
      userId
    }
  })

  if (!task) {
    throw new Error('Task not found')
  }

  const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'
  const completedAt = newStatus === 'COMPLETED' ? new Date() : null

  await prisma.actionItem.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      completedAt
    }
  })

  revalidatePath('/dashboard')
}

export async function deleteTask(taskId: string) {
  const userId = await getAuthenticatedUser()

  const task = await prisma.actionItem.findFirst({
    where: {
      id: taskId,
      userId
    }
  })

  if (!task) {
    throw new Error('Task not found')
  }

  await prisma.actionItem.delete({
    where: { id: taskId }
  })

  revalidatePath('/dashboard')
}

export async function updateTaskPriority(taskId: string, priority: 'LOW' | 'MEDIUM' | 'HIGH') {
  const userId = await getAuthenticatedUser()

  const task = await prisma.actionItem.findFirst({
    where: {
      id: taskId,
      userId
    }
  })

  if (!task) {
    throw new Error('Task not found')
  }

  await prisma.actionItem.update({
    where: { id: taskId },
    data: { priority }
  })

  revalidatePath('/dashboard')
}

// Create manual action item
export async function createActionItem(
  payload: FormData | {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    assignee?: string
  }
) {
  const userId = await getAuthenticatedUser()

  let title: string | undefined
  let description: string | undefined
  let priorityInput: 'low' | 'medium' | 'high' | undefined
  let assignee: string | undefined

  if (payload instanceof FormData) {
    // Support both new fields and legacy 'text'/'tags'
    title = (payload.get('title') as string) || (payload.get('text') as string)
    description = payload.get('description') as string | undefined
    const pr = payload.get('priority') as string | undefined
    if (pr) {
      priorityInput = pr.toLowerCase() as 'low' | 'medium' | 'high'
    }
    assignee = payload.get('assignee') as string | undefined
  } else {
    title = payload.title
    description = payload.description
    priorityInput = payload.priority
    assignee = payload.assignee
  }

  if (!title || !title.trim()) {
    throw new Error('Task title is required')
  }

  const priorityMap = {
    low: 'LOW',
    medium: 'MEDIUM',
    high: 'HIGH',
  } as const
  const priority = priorityInput ? priorityMap[priorityInput] : 'MEDIUM'

  // Combine title and description into single text field for storage
  const text = description && description.trim()
    ? `${title} — ${description}`
    : title

  const tagArray = assignee && assignee.trim()
    ? [`@Assignee:${assignee.trim()}`]
    : []

  await prisma.actionItem.create({
    data: {
      text,
      priority,
      tags: tagArray,
      userId,
      transcriptId: null, // Manual tasks are not linked to a transcript
    }
  })

  revalidatePath('/dashboard')
}

// Get dashboard data
export async function getDashboardData() {
  const userId = await getAuthenticatedUser()

  const [actionItems, transcripts, taskStats] = await Promise.all([
    // Get all action items for the user
    prisma.actionItem.findMany({
      where: { userId },
      include: {
        transcript: {
          select: { title: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),

    // Get recent transcripts
    prisma.transcript.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        sentiment: true,
        _count: {
          select: { actionItems: true }
        }
      }
    }),

    // Get task statistics
    prisma.actionItem.groupBy({
      by: ['status', 'priority'],
      where: { userId },
      _count: true
    })
  ])

  // Calculate statistics
  const totalTasks = actionItems.length
  const completedTasks = actionItems.filter(item => item.status === 'COMPLETED').length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Priority distribution
  const priorityStats = {
    HIGH: actionItems.filter(item => item.priority === 'HIGH').length,
    MEDIUM: actionItems.filter(item => item.priority === 'MEDIUM').length,
    LOW: actionItems.filter(item => item.priority === 'LOW').length
  }

  return {
    actionItems,
    transcripts,
    stats: {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      priorityStats
    }
  }
}