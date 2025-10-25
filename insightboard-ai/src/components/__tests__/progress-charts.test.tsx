import React from 'react'
import { render, screen } from '../../__tests__/test-utils'
import { describe, it, expect } from '@jest/globals'
import { ProgressCharts } from '../progress-charts'

// Mock recharts components
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
  YAxis: () <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

const mockActionItems = [
  {
    id: '1',
    status: 'COMPLETED' as const,
    priority: 'HIGH' as const,
  },
  {
    id: '2',
    status: 'COMPLETED' as const,
    priority: 'MEDIUM' as const,
  },
  {
    id: '3',
    status: 'PENDING' as const,
    priority: 'HIGH' as const,
  },
  {
    id: '4',
    status: 'PENDING' as const,
    priority: 'LOW' as const,
  },
  {
    id: '5',
    status: 'PENDING' as const,
    priority: 'LOW' as const,
  },
]

describe('ProgressCharts', () => {
  it('should render charts with data', () => {
    render(<ProgressCharts actionItems={mockActionItems} />)
    
    expect(screen.getByText('Task Completion')).toBeInTheDocument()
    expect(screen.getByText('Priority Distribution')).toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
    
    // Check completion rate
    expect(screen.getByText('40%')).toBeInTheDocument() // 2 completed out of 5 total
    
    // Check summary stats
    expect(screen.getByText('5')).toBeInTheDocument() // Total tasks
    expect(screen.getByText('2')).toBeInTheDocument() // Completed tasks
    expect(screen.getByText('3')).toBeInTheDocument() // Pending tasks
    expect(screen.getByText('2')).toBeInTheDocument() // High priority tasks
  })

  it('should show empty state when no action items', () => {
    render(<ProgressCharts actionItems={[]} />)
    
    expect(screen.getByText('No data to display')).toBeInTheDocument()
    expect(screen.getAllByText('No data to display')).toHaveLength(3) // One for each chart
  })

  it('should calculate completion rate correctly', () => {
    const allCompletedItems = [
      { id: '1', status: 'COMPLETED' as const, priority: 'HIGH' as const },
      { id: '2', status: 'COMPLETED' as const, priority: 'MEDIUM' as const },
    ]
    
    render(<ProgressCharts actionItems={allCompletedItems} />)
    
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should show zero completion rate for no completed tasks', () => {
    const allPendingItems = [
      { id: '1', status: 'PENDING' as const, priority: 'HIGH' as const },
      { id: '2', status: 'PENDING' as const, priority: 'MEDIUM' as const },
    ]
    
    render(<ProgressCharts actionItems={allPendingItems} />)
    
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('should display priority distribution correctly', () => {
    const priorityItems = [
      { id: '1', status: 'PENDING' as const, priority: 'HIGH' as const },
      { id: '2', status: 'PENDING' as const, priority: 'HIGH' as const },
      { id: '3', status: 'PENDING' as const, priority: 'MEDIUM' as const },
      { id: '4', status: 'PENDING' as const, priority: 'LOW' as const },
    ]
    
    render(<ProgressCharts actionItems={priorityItems} />)
    
    // Check legend items
    expect(screen.getByText('High (2)')).toBeInTheDocument()
    expect(screen.getByText('Medium (1)')).toBeInTheDocument()
    expect(screen.getByText('Low (1)')).toBeInTheDocument()
  })

  it('should handle single action item', () => {
    const singleItem = [
      { id: '1', status: 'COMPLETED' as const, priority: 'HIGH' as const },
    ]
    
    render(<ProgressCharts actionItems={singleItem} />)
    
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // Total tasks
    expect(screen.getByText('1')).toBeInTheDocument() // Completed tasks
    expect(screen.getByText('0')).toBeInTheDocument() // Pending tasks
    expect(screen.getByText('1')).toBeInTheDocument() // High priority
  })

  it('should render chart components', () => {
    render(<ProgressCharts actionItems={mockActionItems} />)
    
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(2) // Pie and Bar charts
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getAllByTestId('cell')).toHaveLength(5) // 2 completion + 3 priority cells
  })

  it('should show correct legend for completion data', () => {
    render(<ProgressCharts actionItems={mockActionItems} />)
    
    expect(screen.getByText('Completed (2)')).toBeInTheDocument()
    expect(screen.getByText('Pending (3)')).toBeInTheDocument()
  })

  it('should handle mixed priority and status combinations', () => {
    const mixedItems = [
      { id: '1', status: 'COMPLETED' as const, priority: 'HIGH' as const },
      { id: '2', status: 'COMPLETED' as const, priority: 'LOW' as const },
      { id: '3', status: 'PENDING' as const, priority: 'HIGH' as const },
      { id: '4', status: 'PENDING' as const, priority: 'MEDIUM' as const },
      { id: '5', status: 'PENDING' as const, priority: 'MEDIUM' as const },
    ]
    
    render(<ProgressCharts actionItems={mixedItems} />)
    
    // Check completion
    expect(screen.getByText('40%')).toBeInTheDocument() // 2/5 completed
    
    // Check priority distribution
    expect(screen.getByText('High (2)')).toBeInTheDocument()
    expect(screen.getByText('Medium (2)')).toBeInTheDocument()
    expect(screen.getByText('Low (1)')).toBeInTheDocument()
    
    // Check summary
    expect(screen.getByText('5')).toBeInTheDocument() // Total
    expect(screen.getByText('2')).toBeInTheDocument() // Completed
    expect(screen.getByText('3')).toBeInTheDocument() // Pending
    expect(screen.getByText('2')).toBeInTheDocument() // High priority
  })
})
