import React from 'react'
import { render, screen } from '../../../../__tests__/test-utils'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import SignInPage from '../page'

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

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render sign in form', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('should have link to sign up page', () => {
    render(<SignInPage />)
    
    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toHaveAttribute('href', '/auth/signup')
  })

  it('should have proper form structure', () => {
    render(<SignInPage />)
    
    const form = screen.getByRole('form')
    expect(form).toBeInTheDocument()
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(submitButton).toHaveAttribute('type', 'submit')
  })

  it('should display branding', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('InsightBoard AI')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<SignInPage />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    expect(emailInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('required')
  })
})
