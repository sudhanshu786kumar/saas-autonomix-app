import React from 'react'
import { render, screen } from './test-utils'
import { describe, it, expect } from '@jest/globals'

// Simple component to test footer date functionality
const FooterWithDate = () => {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} InsightBoard AI. All rights reserved.</p>
    </footer>
  )
}

describe('Footer Date', () => {
  it('should display current year in footer', () => {
    const currentYear = new Date().getFullYear()
    
    render(<FooterWithDate />)
    
    expect(screen.getByText(`© ${currentYear} InsightBoard AI. All rights reserved.`)).toBeInTheDocument()
  })

  it('should update year dynamically', () => {
    // Mock different years to test dynamic behavior
    const originalDate = Date
    const mockDate = jest.fn(() => new originalDate('2025-01-01'))
    mockDate.now = originalDate.now
    global.Date = mockDate as any
    
    render(<FooterWithDate />)
    
    expect(screen.getByText('© 2025 InsightBoard AI. All rights reserved.')).toBeInTheDocument()
    
    // Restore original Date
    global.Date = originalDate
  })

  it('should handle year changes correctly', () => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1
    
    // Test current year
    render(<FooterWithDate />)
    expect(screen.getByText(`© ${currentYear} InsightBoard AI. All rights reserved.`)).toBeInTheDocument()
    
    // Mock next year
    const originalDate = Date
    const mockDate = jest.fn(() => new originalDate(`${nextYear}-01-01`))
    mockDate.now = originalDate.now
    global.Date = mockDate as any
    
    // Re-render with new year
    render(<FooterWithDate />)
    expect(screen.getByText(`© ${nextYear} InsightBoard AI. All rights reserved.`)).toBeInTheDocument()
    
    // Restore original Date
    global.Date = originalDate
  })
})
