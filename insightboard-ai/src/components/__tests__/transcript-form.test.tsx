import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { TranscriptForm } from '../transcript-form'

// Mock the actions
jest.mock('@/lib/actions', () => ({
  submitTranscript: jest.fn(),
}))

// Mock the toast hook
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

describe('TranscriptForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render form with all required fields', () => {
    render(<TranscriptForm />)
    
    expect(screen.getByLabelText(/meeting title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/transcript content/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument()
  })

  it('should handle file upload', async () => {
    const user = userEvent.setup()
    render(<TranscriptForm />)
    
    const file = new File(['Test transcript content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/upload transcript file/i)
    
    await user.upload(fileInput, file)
    
    expect(screen.getByText('test.txt')).toBeInTheDocument()
  })

  it('should reject invalid file types', async () => {
    const user = userEvent.setup()
    const { useToast } = await import('@/components/ui/toast')
    const mockToast = jest.fn()
    useToast.mockReturnValue({ toast: mockToast })
    
    render(<TranscriptForm />)
    
    const file = new File(['Test content'], 'test.pdf', { type: 'application/pdf' })
    const fileInput = screen.getByLabelText(/upload transcript file/i)
    
    await user.upload(fileInput, file)
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'Invalid file type',
      description: 'Please upload a text file (.txt) or document with text content.',
      variant: 'destructive',
    })
  })

  it('should reject files that are too large', async () => {
    const user = userEvent.setup()
    const { useToast } = await import('@/components/ui/toast')
    const mockToast = jest.fn()
    useToast.mockReturnValue({ toast: mockToast })
    
    render(<TranscriptForm />)
    
    // Create a large file (6MB)
    const largeContent = 'x'.repeat(6 * 1024 * 1024)
    const file = new File([largeContent], 'large.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/upload transcript file/i)
    
    await user.upload(fileInput, file)
    
    expect(mockToast).toHaveBeenCalledWith({
      title: 'File too large',
      description: 'Please upload a file smaller than 5MB.',
      variant: 'destructive',
    })
  })

  it('should remove uploaded file', async () => {
    const user = userEvent.setup()
    render(<TranscriptForm />)
    
    const file = new File(['Test content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/upload transcript file/i)
    
    await user.upload(fileInput, file)
    expect(screen.getByText('test.txt')).toBeInTheDocument()
    
    const removeButton = screen.getByRole('button', { name: '' }) // X button
    await user.click(removeButton)
    
    expect(screen.queryByText('test.txt')).not.toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    const { submitTranscript } = await import('@/lib/actions')
    const { useToast } = await import('@/components/ui/toast')
    
    submitTranscript.mockResolvedValue({ success: true, transcriptId: 'test-id' })
    const mockToast = jest.fn()
    useToast.mockReturnValue({ toast: mockToast })
    
    render(<TranscriptForm />)
    
    const titleInput = screen.getByLabelText(/meeting title/i)
    const contentTextarea = screen.getByLabelText(/transcript content/i)
    const submitButton = screen.getByRole('button', { name: /analyze/i })
    
    await user.type(titleInput, 'Test Meeting')
    await user.type(contentTextarea, 'Test transcript content')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(submitTranscript).toHaveBeenCalledWith(expect.any(FormData))
    })
    
    expect(mockToast).toHaveBeenCalledWith({
      title: '🎉 Analysis Complete!',
      description: 'Successfully analyzed transcript and generated action items. Check the dashboard to see the results.',
    })
  })

  it('should handle submission errors', async () => {
    const user = userEvent.setup()
    const { submitTranscript } = await import('@/lib/actions')
    const { useToast } = await import('@/components/ui/toast')
    
    const error = new Error('Analysis failed')
    submitTranscript.mockRejectedValue(error)
    const mockToast = jest.fn()
    useToast.mockReturnValue({ toast: mockToast })
    
    render(<TranscriptForm />)
    
    const contentTextarea = screen.getByLabelText(/transcript content/i)
    const submitButton = screen.getByRole('button', { name: /analyze/i })
    
    await user.type(contentTextarea, 'Test transcript content')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Analysis Failed',
        description: 'Analysis failed',
        variant: 'destructive',
      })
    })
  })

  it('should show loading state during submission', async () => {
    const user = userEvent.setup()
    const { submitTranscript } = await import('@/lib/actions')
    
    // Mock a slow response
    submitTranscript.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<TranscriptForm />)
    
    const contentTextarea = screen.getByLabelText(/transcript content/i)
    const submitButton = screen.getByRole('button', { name: /analyze/i })
    
    await user.type(contentTextarea, 'Test transcript content')
    await user.click(submitButton)
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should use sample transcript when sample button is clicked', async () => {
    const user = userEvent.setup()
    render(<TranscriptForm />)
    
    const useSampleButton = screen.getByText('Use Sample')
    await user.click(useSampleButton)
    
    const titleInput = screen.getByLabelText(/meeting title/i)
    const contentTextarea = screen.getByLabelText(/transcript content/i)
    
    expect(titleInput).toHaveValue('Marketing Campaign Planning - March 2024')
    expect(contentTextarea.value).toContain('John: We need to finalize the marketing campaign')
  })

  it('should disable form during submission', async () => {
    const user = userEvent.setup()
    const { submitTranscript } = await import('@/lib/actions')
    
    submitTranscript.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<TranscriptForm />)
    
    const titleInput = screen.getByLabelText(/meeting title/i)
    const contentTextarea = screen.getByLabelText(/transcript content/i)
    const submitButton = screen.getByRole('button', { name: /analyze/i })
    
    await user.type(contentTextarea, 'Test content')
    await user.click(submitButton)
    
    expect(titleInput).toBeDisabled()
    expect(contentTextarea).toBeDisabled()
    expect(submitButton).toBeDisabled()
  })

  it('should show analysis overlay during processing', async () => {
    const user = userEvent.setup()
    const { submitTranscript } = await import('@/lib/actions')
    
    submitTranscript.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<TranscriptForm />)
    
    const contentTextarea = screen.getByLabelText(/transcript content/i)
    const submitButton = screen.getByRole('button', { name: /analyze/i })
    
    await user.type(contentTextarea, 'Test content')
    await user.click(submitButton)
    
    expect(screen.getByText('Analyzing transcript...')).toBeInTheDocument()
    expect(screen.getByText('This may take a few moments')).toBeInTheDocument()
  })

  it('should reset form after successful submission', async () => {
    const user = userEvent.setup()
    const { submitTranscript } = await import('@/lib/actions')
    
    submitTranscript.mockResolvedValue({ success: true, transcriptId: 'test-id' })
    
    render(<TranscriptForm />)
    
    const titleInput = screen.getByLabelText(/meeting title/i)
    const contentTextarea = screen.getByLabelText(/transcript content/i)
    const submitButton = screen.getByRole('button', { name: /analyze/i })
    
    await user.type(titleInput, 'Test Meeting')
    await user.type(contentTextarea, 'Test content')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(titleInput).toHaveValue('')
      expect(contentTextarea).toHaveValue('')
    })
  })
})
