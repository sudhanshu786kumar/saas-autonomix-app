import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import DashboardPage from '../page'

// Mock NextAuth
const mockGetServerSession = jest.fn()
jest.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}))

// Mock Next.js navigation
const mockRedirect = jest.fn()
jest.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

// Mock actions
jest.mock('@/lib/actions', () => ({
  getDashboardData: jest.fn(),
}))

// Mock components
jest.mock('@/components/transcript-form', () => ({
  TranscriptForm: () => <div data-testid="transcript-form">Transcript Form</div>,
}))

jest.mock('@/components/task-list', () => ({
  TaskList: ({ actionItems }: { actionItems: any[] }) => (
    <div data-testid="task-list">Task List ({actionItems.length} items)</div>
  ),
}))

jest.mock('@/components/progress-charts-wrapper', () => ({
  ProgressChartsWrapper: ({ actionItems }: { actionItems: any[] }) => (
    <div data-testid="progress-charts">Progress Charts ({actionItems.length} items)</div>
  ),
}))

jest.mock('@/components/manual-action-form', () => ({
  ManualActionForm: () => <div data-testid="manual-action-form">Manual Action Form</div>,
}))

jest.mock('@/components/signout-button', () => ({
  SignOutButton: () => <button data-testid="signout-button">Sign Out</button>,
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to signin when not authenticated', async () => {
    mockGetServerSession.mockResolvedValue(null)
    
    await DashboardPage()
    
    expect(mockRedirect).toHaveBeenCalledWith('/auth/signin')
  })

  it('should render dashboard when authenticated', async () => {
    const mockSession = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
    
    const mockDashboardData = {
      actionItems: [
        { id: '1', text: 'Task 1', status: 'PENDING', priority: 'HIGH' },
        { id: '2', text: 'Task 2', status: 'COMPLETED', priority: 'MEDIUM' },
      ],
      transcripts: [
        { id: '1', title: 'Meeting 1', createdAt: new Date(), sentiment: 'POSITIVE', _count: { actionItems: 2 } }
      ],
      stats: {
        totalTasks: 2,
        completedTasks: 1,
        pendingTasks: 1,
        completionRate: 50,
        priorityStats: { HIGH: 1, MEDIUM: 1, LOW: 0 }
      }
    }
    
    mockGetServerSession.mockResolvedValue(mockSession)
    const { getDashboardData } = await import('@/lib/actions')
    getDashboardData.mockResolvedValue(mockDashboardData)
    
    const result = await DashboardPage()
    render(result)
    
    // Check header
    expect(screen.getByText('InsightBoard AI')).toBeInTheDocument()
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument()
    expect(screen.getByTestId('signout-button')).toBeInTheDocument()
    
    // Check main sections
    expect(screen.getByText('Progress Analytics')).toBeInTheDocument()
    expect(screen.getByText('Submit Meeting Transcript')).toBeInTheDocument()
    expect(screen.getByText('Create Manual Action')).toBeInTheDocument()
    expect(screen.getByText('Action Items')).toBeInTheDocument()
    
    // Check components are rendered with data
    expect(screen.getByTestId('transcript-form')).toBeInTheDocument()
    expect(screen.getByTestId('manual-action-form')).toBeInTheDocument()
    expect(screen.getByTestId('task-list')).toBeInTheDocument()
    expect(screen.getByTestId('progress-charts')).toBeInTheDocument()
  })

  it('should handle user without name', async () => {
    const mockSession = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: null
      }
    }
    
    const mockDashboardData = {
      actionItems: [],
      transcripts: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        priorityStats: { HIGH: 0, MEDIUM: 0, LOW: 0 }
      }
    }
    
    mockGetServerSession.mockResolvedValue(mockSession)
    const { getDashboardData } = await import('@/lib/actions')
    getDashboardData.mockResolvedValue(mockDashboardData)
    
    const result = await DashboardPage()
    render(result)
    
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument()
  })

  it('should render with empty dashboard data', async () => {
    const mockSession = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
    
    const mockDashboardData = {
      actionItems: [],
      transcripts: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        priorityStats: { HIGH: 0, MEDIUM: 0, LOW: 0 }
      }
    }
    
    mockGetServerSession.mockResolvedValue(mockSession)
    const { getDashboardData } = await import('@/lib/actions')
    getDashboardData.mockResolvedValue(mockDashboardData)
    
    const result = await DashboardPage()
    render(result)
    
    expect(screen.getByTestId('task-list')).toHaveTextContent('Task List (0 items)')
    expect(screen.getByTestId('progress-charts')).toHaveTextContent('Progress Charts (0 items)')
  })

  it('should have proper semantic structure', async () => {
    const mockSession = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
    
    const mockDashboardData = {
      actionItems: [],
      transcripts: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        priorityStats: { HIGH: 0, MEDIUM: 0, LOW: 0 }
      }
    }
    
    mockGetServerSession.mockResolvedValue(mockSession)
    const { getDashboardData } = await import('@/lib/actions')
    getDashboardData.mockResolvedValue(mockDashboardData)
    
    const result = await DashboardPage()
    render(result)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    
    // Check for main sections
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('main')).toBeInTheDocument() // main content
  })

  it('should display section descriptions', async () => {
    const mockSession = {
      user: {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User'
      }
    }
    
    const mockDashboardData = {
      actionItems: [],
      transcripts: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        completionRate: 0,
        priorityStats: { HIGH: 0, MEDIUM: 0, LOW: 0 }
      }
    }
    
    mockGetServerSession.mockResolvedValue(mockSession)
    const { getDashboardData } = await import('@/lib/actions')
    getDashboardData.mockResolvedValue(mockDashboardData)
    
    const result = await DashboardPage()
    render(result)
    
    expect(screen.getByText('Visualize completion rates and priority distribution')).toBeInTheDocument()
    expect(screen.getByText('Paste your meeting transcript to analyze and generate action items')).toBeInTheDocument()
    expect(screen.getByText('Add custom tasks without a transcript')).toBeInTheDocument()
    expect(screen.getByText('Track, update, and manage your tasks')).toBeInTheDocument()
  })
})
