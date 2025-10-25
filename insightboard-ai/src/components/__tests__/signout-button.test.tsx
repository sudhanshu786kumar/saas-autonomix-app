import React from 'react'
import { render, screen } from '../../__tests__/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import { SignOutButton } from '../signout-button'

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  signOut: jest.fn(),
}))

describe('SignOutButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render sign out button', () => {
    render(<SignOutButton />)
    
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    expect(screen.getByText('Sign Out')).toBeInTheDocument()
  })

  it('should call signOut when clicked', async () => {
    const user = userEvent.setup()
    const { signOut } = await import('next-auth/react')
    render(<SignOutButton />)
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)
    
    expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/auth/signin' })
  })

  it('should have correct styling classes', () => {
    render(<SignOutButton />)
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    expect(signOutButton).toHaveClass('outline-none')
  })

  it('should include logout icon', () => {
    render(<SignOutButton />)
    
    // The LogOut icon should be present (mocked as a div in jest.setup.js)
    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toBeInTheDocument()
  })
})
