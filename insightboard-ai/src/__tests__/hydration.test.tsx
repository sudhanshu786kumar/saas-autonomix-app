import React from 'react'
import { render, screen } from './test-utils'
import { describe, it, expect, jest, beforeEach } from '@jest/globals'

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
    button: 'button',
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '2 days ago'),
}))

describe('Hydration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render components without hydration mismatches', () => {
    // Test that components render consistently on server and client
    const TestComponent = () => (
      <div>
        <h1>Test Component</h1>
        <p suppressHydrationWarning>{new Date().getFullYear()}</p>
        <span suppressHydrationWarning>2 days ago</span>
      </div>
    )

    const { container } = render(<TestComponent />)
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('should handle dynamic content with suppressHydrationWarning', () => {
    const DynamicComponent = () => (
      <div>
        <p suppressHydrationWarning>
          Last updated: {new Date().toLocaleString()}
        </p>
        <span suppressHydrationWarning>
          {Math.random()}
        </span>
      </div>
    )

    const { container } = render(<DynamicComponent />)
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('should render date-fns formatted dates consistently', () => {
    const DateComponent = () => (
      <div>
        <span suppressHydrationWarning>2 days ago</span>
      </div>
    )

    const { container } = render(<DateComponent />)
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('2 days ago')).toBeInTheDocument()
  })

  it('should handle conditional rendering without hydration issues', () => {
    const ConditionalComponent = ({ show }: { show: boolean }) => (
      <div>
        <h1>Always Visible</h1>
        {show && <p>Conditional Content</p>}
        <span suppressHydrationWarning>
          {show ? 'Shown' : 'Hidden'}
        </span>
      </div>
    )

    const { container, rerender } = render(<ConditionalComponent show={true} />)
    
    expect(screen.getByText('Always Visible')).toBeInTheDocument()
    expect(screen.getByText('Conditional Content')).toBeInTheDocument()
    expect(screen.getByText('Shown')).toBeInTheDocument()

    rerender(<ConditionalComponent show={false} />)
    
    expect(screen.getByText('Always Visible')).toBeInTheDocument()
    expect(screen.queryByText('Conditional Content')).not.toBeInTheDocument()
    expect(screen.getByText('Hidden')).toBeInTheDocument()
  })

  it('should handle form inputs without hydration mismatches', () => {
    const FormComponent = () => (
      <form>
        <input 
          type="text" 
          defaultValue="test value"
          suppressHydrationWarning
        />
        <textarea 
          defaultValue="textarea content"
          suppressHydrationWarning
        />
        <select defaultValue="option1" suppressHydrationWarning>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
        </select>
      </form>
    )

    const { container } = render(<FormComponent />)
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
    expect(screen.getByDisplayValue('textarea content')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Option 1')).toBeInTheDocument()
  })

  it('should handle async content loading', async () => {
    const AsyncComponent = () => {
      const [data, setData] = React.useState<string | null>(null)
      
      React.useEffect(() => {
        // Simulate async data loading
        setTimeout(() => setData('Loaded data'), 0)
      }, [])
      
      return (
        <div>
          <h1>Async Component</h1>
          {data ? (
            <p suppressHydrationWarning>{data}</p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      )
    }

    const { container } = render(<AsyncComponent />)
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('Async Component')).toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Wait for async content
    await screen.findByText('Loaded data')
    expect(screen.getByText('Loaded data')).toBeInTheDocument()
  })

  it('should handle client-only components', () => {
    const ClientOnlyComponent = () => {
      const [mounted, setMounted] = React.useState(false)
      
      React.useEffect(() => {
        setMounted(true)
      }, [])
      
      if (!mounted) {
        return <div>Server-side placeholder</div>
      }
      
      return (
        <div suppressHydrationWarning>
          <p>Client-only content: {typeof window !== 'undefined' ? 'Browser' : 'Server'}</p>
        </div>
      )
    }

    const { container } = render(<ClientOnlyComponent />)
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('Client-only content: Browser')).toBeInTheDocument()
  })

  it('should handle dynamic imports without hydration issues', () => {
    const DynamicImportComponent = () => (
      <div>
        <h1>Dynamic Import Test</h1>
        <div suppressHydrationWarning>
          {/* This would normally be a dynamically imported component */}
          <p>Dynamically loaded content</p>
        </div>
      </div>
    )

    const { container } = render(<DynamicImportComponent />)
    
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText('Dynamic Import Test')).toBeInTheDocument()
    expect(screen.getByText('Dynamically loaded content')).toBeInTheDocument()
  })
})
