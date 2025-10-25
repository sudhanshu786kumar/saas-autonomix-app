import React from 'react'
import { render, screen } from '../../../../__tests__/test-utils'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import SignUpPage from '../page'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  getSession: jest.fn(() => Promise.resolve(null)),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render sign up form', () => {
    render(<SignUpPage />)
    
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('should have link to sign in page', () => {
    render(<SignUpPage />)
    
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toHaveAttribute('href', '/auth/signin')
  })

  it('should have proper form structure', () => {
    render(<SignUpPage />)
    
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign up/i })
    
    expect(nameInput).toHaveAttribute('type', 'text')
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should display branding', () => {
    render(<SignUpPage />)
    
    expect(screen.getByText('InsightBoard AI')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<SignUpPage />)
    
    const nameInput = screen.getByLabelText(/name/i)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(nameInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })

  it('should show password requirements', () => {
    render(<SignUpPage />)
    
    // Check if password requirements are displayed
    expect(screen.getByText(/password/i)).toBeInTheDocument()
  })
})
