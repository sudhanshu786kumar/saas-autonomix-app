import React from 'react'
import { render, screen } from '../../__tests__/test-utils'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import HomePage from '../page'

// Mock NextAuth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(null)),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render homepage with current year in footer', () => {
    const currentYear = new Date().getFullYear()
    
    render(<HomePage />)
    
    expect(screen.getByText(`© ${currentYear} InsightBoard AI. All rights reserved.`)).toBeInTheDocument()
  })

  it('should render all main sections', () => {
    render(<HomePage />)
    
    // Header
    expect(screen.getByText('InsightBoard AI')).toBeInTheDocument()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    
    // Hero section
    expect(screen.getByText('Transform Meeting')).toBeInTheDocument()
    expect(screen.getByText('Transcripts into Action')).toBeInTheDocument()
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
    expect(screen.getByText('View Demo')).toBeInTheDocument()
    
    // Features section
    expect(screen.getByText('Everything you need to stay organized')).toBeInTheDocument()
    expect(screen.getByText('Smart Transcript Analysis')).toBeInTheDocument()
    expect(screen.getByText('Task Management')).toBeInTheDocument()
    expect(screen.getByText('Progress Analytics')).toBeInTheDocument()
    
    // CTA section
    expect(screen.getByText('Ready to transform your meetings?')).toBeInTheDocument()
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
    expect(screen.getByText('Try Demo')).toBeInTheDocument()
    
    // Footer
    expect(screen.getByText('Transform your meetings into actionable insights.')).toBeInTheDocument()
  })

  it('should display demo preview section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Upload Transcript')).toBeInTheDocument()
    expect(screen.getByText('AI Analysis')).toBeInTheDocument()
    expect(screen.getByText('Track Progress')).toBeInTheDocument()
  })

  it('should show all feature cards', () => {
    render(<HomePage />)
    
    const featureTitles = [
      'Smart Transcript Analysis',
      'Task Management',
      'Progress Analytics',
      'Priority Management',
      'Team Collaboration',
      'Real-time Updates'
    ]
    
    featureTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument()
    })
  })

  it('should have proper navigation links', () => {
    render(<HomePage />)
    
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    const getStartedLink = screen.getByRole('link', { name: /get started/i })
    const viewDemoLink = screen.getByRole('link', { name: /view demo/i })
    
    expect(signInLink).toHaveAttribute('href', '/auth/signin')
    expect(getStartedLink).toHaveAttribute('href', '/auth/signup')
    expect(viewDemoLink).toHaveAttribute('href', '/auth/signin')
  })

  it('should display AI-powered badge', () => {
    render(<HomePage />)
    
    expect(screen.getByText('AI-Powered Meeting Analysis')).toBeInTheDocument()
  })

  it('should show sample transcript section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Sample Transcript')).toBeInTheDocument()
    expect(screen.getByText('Try this sample to see how the AI analysis works:')).toBeInTheDocument()
    expect(screen.getByText('Use Sample')).toBeInTheDocument()
  })

  it('should have proper semantic structure', () => {
    render(<HomePage />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
    
    // Check for main sections
    expect(screen.getByRole('banner')).toBeInTheDocument() // header
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer
  })

  it('should display current year dynamically', () => {
    // Mock different years to test dynamic behavior
    const originalDate = Date
    const mockDate = jest.fn(() => new originalDate('2025-01-01'))
    mockDate.now = originalDate.now
    global.Date = mockDate as any
    
    render(<HomePage />)
    
    expect(screen.getByText('© 2025 InsightBoard AI. All rights reserved.')).toBeInTheDocument()
    
    // Restore original Date
    global.Date = originalDate
  })
})
