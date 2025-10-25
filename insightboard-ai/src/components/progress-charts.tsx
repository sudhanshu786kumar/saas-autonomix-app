'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ActionItem {
  id: string
  status: 'PENDING' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface ProgressChartsProps {
  actionItems: ActionItem[]
}

export function ProgressCharts({ actionItems }: ProgressChartsProps) {
  // Calculate completion data
  const completedCount = actionItems.filter(item => item.status === 'COMPLETED').length
  const pendingCount = actionItems.filter(item => item.status === 'PENDING').length
  
  const completionData = [
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' }
  ]

  // Calculate priority distribution
  const priorityData = [
    { 
      name: 'High', 
      value: actionItems.filter(item => item.priority === 'HIGH').length,
      color: '#ef4444'
    },
    { 
      name: 'Medium', 
      value: actionItems.filter(item => item.priority === 'MEDIUM').length,
      color: '#f59e0b'
    },
    { 
      name: 'Low', 
      value: actionItems.filter(item => item.priority === 'LOW').length,
      color: '#10b981'
    }
  ]

  const completionRate = actionItems.length > 0 
    ? Math.round((completedCount / actionItems.length) * 100) 
    : 0

  if (actionItems.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Task Completion</h3>
          <div className="flex items-center justify-center h-48 text-gray-500">
            <p>No data to display</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
          <div className="flex items-center justify-center h-48 text-gray-500">
            <p>No data to display</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Completion Pie Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Task Completion</h3>
          <div className="text-2xl font-bold text-green-600">
            {completionRate}%
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={completionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {completionData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [value, 'Tasks']}
              labelStyle={{ color: '#374151' }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex justify-center space-x-4 mt-4">
          {completionData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Bar Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Priority Distribution</h3>
        
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={priorityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              formatter={(value: number) => [value, 'Tasks']}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
            >
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="flex justify-center space-x-4 mt-4">
          {priorityData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{actionItems.length}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {actionItems.filter(item => item.priority === 'HIGH').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
        </div>
      </div>
    </div>
  )
}