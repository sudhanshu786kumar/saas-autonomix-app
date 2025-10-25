import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { ManualActionForm } from '../manual-action-form'

// Mock the actions
jest.mock('@/lib/actions', () => ({
  createActionItem: jest.fn(),
}))

// Mock the toast hook
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}))

describe('ManualActionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render add button initially', () => {
    render(<ManualActionForm />)
    
    expect(screen.getByText('Add Manual Action Item')).toBeInTheDocument()
  })

  it('should show form when add button is clicked', async () => {
    const user = userEvent.setup()
    render(<ManualActionForm />)
    
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    expect(screen.getByText('Create Action Item')).toBeInTheDocument()
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/assignee/i)).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    const { createActionItem } = await import('@/lib/actions')
    const { useToast } = await import('@/components/ui/toast')
    
    createActionItem.mockResolvedValue(undefined)
    const mockToast = jest.fn()
    useToast.mockReturnValue({ toast: mockToast })
    
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    // Fill form
    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const prioritySelect = screen.getByLabelText(/priority/i)
    const assigneeInput = screen.getByLabelText(/assignee/i)
    const submitButton = screen.getByRole('button', { name: /create action item/i })
    
    await user.type(titleInput, 'Test Task')
    await user.type(descriptionInput, 'Test Description')
    await user.selectOptions(prioritySelect, 'high')
    await user.type(assigneeInput, 'John Doe')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(createActionItem).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        assignee: 'John Doe'
      })
    })
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Success',
      description: 'Action item created successfully'
    })
  })

  it('should show error for missing title', async () => {
    const user = userEvent.setup()
    const { useToast } = await import('@/components/ui/toast')
    
    const mockToast = jest.fn()
    useToast.mockReturnValue({ toast: mockToast })
    
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    // Try to submit without title
    const submitButton = screen.getByRole('button', { name: /create action item/i })
    await user.click(submitButton)
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Error',
      description: 'Please enter a title for the action item',
      variant: 'destructive'
    })
  })

  it('should handle submission errors', async () => {
    const user = userEvent.setup()
    const { createActionItem } = await import('@/lib/actions')
    const { useToast } = await import('@/components/ui/toast')
    
    const error = new Error('Creation failed')
    createActionItem.mockRejectedValue(error)
    const mockToast = jest.fn()
    useToast.mockReturnValue({ toast: mockToast })
    
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    // Fill and submit form
    const titleInput = screen.getByLabelText(/title/i)
    const submitButton = screen.getByRole('button', { name: /create action item/i })
    
    await user.type(titleInput, 'Test Task')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create action item. Please try again.',
        variant: 'destructive'
      })
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    const { createActionItem } = await import('@/lib/actions')
    
    createActionItem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    // Fill and submit form
    const titleInput = screen.getByLabelText(/title/i)
    const submitButton = screen.getByRole('button', { name: /create action item/i })
    
    await user.type(titleInput, 'Test Task')
    await user.click(submitButton)
    
    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should close form when cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    expect(screen.getByText('Create Action Item')).toBeInTheDocument()
    
    // Close form
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(screen.queryByText('Create Action Item')).not.toBeInTheDocument()
    expect(screen.getByText('Add Manual Action Item')).toBeInTheDocument()
  })

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup()
    const { createActionItem } = await import('@/lib/actions')
    
    createActionItem.mockResolvedValue(undefined)
    
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    // Fill form
    const titleInput = screen.getByLabelText(/title/i)
    const descriptionInput = screen.getByLabelText(/description/i)
    const submitButton = screen.getByRole('button', { name: /create action item/i })
    
    await user.type(titleInput, 'Test Task')
    await user.type(descriptionInput, 'Test Description')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('')
      expect(descriptionInput).toHaveValue('')
    })
  })

  it('should disable form during submission', async () => {
    const user = userEvent.setup()
    const { createActionItem } = await import('@/lib/actions')
    
    createActionItem.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    // Fill and submit form
    const titleInput = screen.getByLabelText(/title/i)
    const submitButton = screen.getByRole('button', { name: /create action item/i })
    
    await user.type(titleInput, 'Test Task')
    await user.click(submitButton)
    
    expect(titleInput).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('should handle priority selection', async () => {
    const user = userEvent.setup()
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    const prioritySelect = screen.getByLabelText(/priority/i)
    
    // Test different priority selections
    await user.selectOptions(prioritySelect, 'low')
    expect(prioritySelect).toHaveValue('low')
    
    await user.selectOptions(prioritySelect, 'medium')
    expect(prioritySelect).toHaveValue('medium')
    
    await user.selectOptions(prioritySelect, 'high')
    expect(prioritySelect).toHaveValue('high')
  })

  it('should handle optional fields', async () => {
    const user = userEvent.setup()
    const { createActionItem } = await import('@/lib/actions')
    
    createActionItem.mockResolvedValue(undefined)
    
    render(<ManualActionForm />)
    
    // Open form
    const addButton = screen.getByText('Add Manual Action Item')
    await user.click(addButton)
    
    // Submit with only title (optional fields empty)
    const titleInput = screen.getByLabelText(/title/i)
    const submitButton = screen.getByRole('button', { name: /create action item/i })
    
    await user.type(titleInput, 'Test Task')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(createActionItem).toHaveBeenCalledWith({
        title: 'Test Task',
        description: undefined,
        priority: 'medium', // default value
        assignee: undefined
      })
    })
  })
})
