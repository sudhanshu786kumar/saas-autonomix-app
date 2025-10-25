import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { TaskList } from '../task-list'

// Mock the actions
jest.mock('@/lib/actions', () => ({
  toggleTaskStatus: jest.fn(),
  deleteTask: jest.fn(),
  updateTaskPriority: jest.fn(),
}))

// Mock the toast hook
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

const mockActionItems = [
  {
    id: '1',
    text: 'Complete project documentation',
    status: 'PENDING' as const,
    priority: 'HIGH' as const,
    tags: ['@Development', '@Documentation'],
    createdAt: new Date('2024-01-15'),
    completedAt: null,
    transcript: { title: 'Sprint Planning' }
  },
  {
    id: '2',
    text: 'Review code changes',
    status: 'COMPLETED' as const,
    priority: 'MEDIUM' as const,
    tags: ['@Code Review'],
    createdAt: new Date('2024-01-14'),
    completedAt: new Date('2024-01-16'),
    transcript: null
  },
  {
    id: '3',
    text: 'Update team on progress',
    status: 'PENDING' as const,
    priority: 'LOW' as const,
    tags: ['@Communication'],
    createdAt: new Date('2024-01-13'),
    completedAt: null,
    transcript: { title: 'Weekly Standup' }
  }
]

describe('TaskList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render task list with all items', () => {
    render(<TaskList actionItems={mockActionItems} />)
    
    expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
    expect(screen.getByText('Review code changes')).toBeInTheDocument()
    expect(screen.getByText('Update team on progress')).toBeInTheDocument()
  })

  it('should show empty state when no action items', () => {
    render(<TaskList actionItems={[]} />)
    
    expect(screen.getByText('No action items yet')).toBeInTheDocument()
    expect(screen.getByText('Submit a meeting transcript to generate action items automatically.')).toBeInTheDocument()
  })

  it('should filter tasks by status', async () => {
    const user = userEvent.setup()
    render(<TaskList actionItems={mockActionItems} />)
    
    const filterSelect = screen.getByDisplayValue('All Tasks')
    await user.click(filterSelect)
    
    const pendingOption = screen.getByText('Pending')
    await user.click(pendingOption)
    
    expect(screen.getByText('Complete project documentation')).toBeInTheDocument()
    expect(screen.getByText('Update team on progress')).toBeInTheDocument()
    expect(screen.queryByText('Review code changes')).not.toBeInTheDocument()
  })

  it('should sort tasks by priority', async () => {
    const user = userEvent.setup()
    render(<TaskList actionItems={mockActionItems} />)
    
    const sortSelect = screen.getByDisplayValue('Recent')
    await user.click(sortSelect)
    
    const priorityOption = screen.getByText('Priority')
    await user.click(priorityOption)
    
    // High priority task should appear first
    const taskElements = screen.getAllByText(/Complete project documentation|Review code changes|Update team on progress/)
    expect(taskElements[0]).toHaveTextContent('Complete project documentation')
  })

  it('should toggle task status when checkbox is clicked', async () => {
    const user = userEvent.setup()
    const { toggleTaskStatus } = await import('@/lib/actions')
    
    render(<TaskList actionItems={mockActionItems} />)
    
    const checkboxes = screen.getAllByRole('checkbox')
    const pendingTaskCheckbox = checkboxes[0] // First task is pending
    
    await user.click(pendingTaskCheckbox)
    
    expect(toggleTaskStatus).toHaveBeenCalledWith('1')
  })

  it('should update task priority when priority is changed', async () => {
    const user = userEvent.setup()
    const { updateTaskPriority } = await import('@/lib/actions')
    
    render(<TaskList actionItems={mockActionItems} />)
    
    const prioritySelects = screen.getAllByDisplayValue('High')
    const firstPrioritySelect = prioritySelects[0]
    
    await user.click(firstPrioritySelect)
    
    const mediumOption = screen.getByText('Medium')
    await user.click(mediumOption)
    
    expect(updateTaskPriority).toHaveBeenCalledWith('1', 'MEDIUM')
  })

  it('should show delete confirmation dialog', async () => {
    const user = userEvent.setup()
    render(<TaskList actionItems={mockActionItems} />)
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])
    
    expect(screen.getByText('Delete Task')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete this task? This action cannot be undone.')).toBeInTheDocument()
  })

  it('should delete task when confirmed', async () => {
    const user = userEvent.setup()
    const { deleteTask } = await import('@/lib/actions')
    
    render(<TaskList actionItems={mockActionItems} />)
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])
    
    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(confirmButton)
    
    expect(deleteTask).toHaveBeenCalledWith('1')
  })

  it('should display task metadata correctly', () => {
    render(<TaskList actionItems={mockActionItems} />)
    
    // Check for transcript titles
    expect(screen.getByText('From: Sprint Planning')).toBeInTheDocument()
    expect(screen.getByText('From: Weekly Standup')).toBeInTheDocument()
    
    // Check for tags
    expect(screen.getByText('@Development')).toBeInTheDocument()
    expect(screen.getByText('@Documentation')).toBeInTheDocument()
    expect(screen.getByText('@Code Review')).toBeInTheDocument()
  })

  it('should show loading state when updating task', async () => {
    const user = userEvent.setup()
    const { toggleTaskStatus } = await import('@/lib/actions')
    
    // Mock a slow response
    toggleTaskStatus.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<TaskList actionItems={mockActionItems} />)
    
    const checkboxes = screen.getAllByRole('checkbox')
    const pendingTaskCheckbox = checkboxes[0]
    
    await user.click(pendingTaskCheckbox)
    
    // Should show loading spinner
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should handle completed tasks styling', () => {
    render(<TaskList actionItems={mockActionItems} />)
    
    const completedTask = screen.getByText('Review code changes')
    expect(completedTask).toHaveClass('line-through', 'text-gray-500')
  })

  it('should show task count in filter section', () => {
    render(<TaskList actionItems={mockActionItems} />)
    
    expect(screen.getByText('3 of 3 tasks')).toBeInTheDocument()
  })

  it('should handle tasks with many tags', () => {
    const taskWithManyTags = {
      id: '4',
      text: 'Task with many tags',
      status: 'PENDING' as const,
      priority: 'MEDIUM' as const,
      tags: ['@Tag1', '@Tag2', '@Tag3', '@Tag4', '@Tag5'],
      createdAt: new Date('2024-01-12'),
      completedAt: null,
      transcript: null
    }
    
    render(<TaskList actionItems={[taskWithManyTags]} />)
    
    expect(screen.getByText('@Tag1')).toBeInTheDocument()
    expect(screen.getByText('@Tag2')).toBeInTheDocument()
    expect(screen.getByText('+3')).toBeInTheDocument() // Shows overflow count
  })
})
